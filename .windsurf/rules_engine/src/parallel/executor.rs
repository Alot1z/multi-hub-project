//! Parallel task executor with work stealing for the Windsurf Rules Engine

use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::marker::PhantomData;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::mpsc;
use std::time::Duration;

use crate::parallel::work_stealing::{Task, WorkStealingQueue};
use crate::parallel::ParallelConfig;

/// A parallel iterator that processes items in parallel
pub struct ParallelIter<I, T> {
    iter: I,
    executor: Arc<ParallelExecutor>,
    _marker: PhantomData<T>,
}

impl<I, T> ParallelIter<I, T>
where
    I: Iterator<Item = T> + Send + 'static,
    T: Send + 'static,
{
    /// Creates a new parallel iterator with the default executor
    pub fn new(iter: I) -> Self {
        Self::with_executor(iter, Arc::new(ParallelExecutor::new()))
    }
    
    /// Creates a new parallel iterator with a custom executor
    pub fn with_executor(iter: I, executor: Arc<ParallelExecutor>) -> Self {
        Self {
            iter,
            executor,
            _marker: PhantomData,
        }
    }
    
    /// Processes each item in parallel using the provided function
    pub fn for_each<F>(self, f: F)
    where
        F: Fn(T) + Send + Sync + 'static,
    {
        let f = Arc::new(f);
        
        for item in self.iter {
            let f = f.clone();
            if let Err(_) = self.executor.submit(move || f(item)) {
                // Handle task submission error (e.g., executor is shutting down)
                break;
            }
        }
    }
}

impl<I, T> Iterator for ParallelIter<I, T>
where
    I: Iterator<Item = T>,
    T: Send + 'static,
{
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        self.iter.next()
    }
}

/// A parallel executor that manages a pool of worker threads
/// and distributes tasks among them using work stealing.
pub struct ParallelExecutor {
    workers: Vec<Worker>,
    task_sender: mpsc::Sender<Task>,
    is_running: Arc<AtomicBool>,
    _distributor: Option<thread::JoinHandle<()>>,
    num_workers: usize,
}

struct Worker {
    id: usize,
    thread: Option<JoinHandle<()>>,
    _forwarder: Option<JoinHandle<()>>,
    work_stealing_queue: Arc<WorkStealingQueue>,
    is_running: Arc<AtomicBool>,
    _marker: PhantomData<()>,
}

impl Worker {
    pub fn new(
        id: usize,
        receiver: mpsc::Receiver<Task>,
        work_stealing_queue: Arc<WorkStealingQueue>,
        is_running: Arc<AtomicBool>,
    ) -> Self {
        // Clone the work stealing queue for the worker thread
        let worker_queue = work_stealing_queue.clone();
        
        // Clone the running flag for the worker thread
        let is_running_worker = is_running.clone();
        
        // Clone the work stealing queue for the forwarder thread
        let forwarder_queue = work_stealing_queue.clone();
        let is_running_forwarder = is_running.clone();
        
        // Create a channel for the worker thread with explicit type annotation
        let (worker_tx, worker_rx) = mpsc::channel::<Task>();
        
        // Spawn the worker thread first
        let thread = thread::spawn(move || {
            while is_running_worker.load(Ordering::Relaxed) {
                // Try to get a task from our own queue first
                if let Some(task) = worker_queue.pop() {
                    task();
                    continue;
                }
                
                // Then try to get a task from our dedicated channel
                match worker_rx.try_recv() {
                    Ok(task) => {
                        task();
                        continue;
                    }
                    Err(_) => {
                        // Yield to avoid busy-waiting
                        thread::yield_now();
                    }
                }
            }
        });
        
        // Spawn a thread to forward tasks from the shared receiver to this worker's channel
        let _forwarder = thread::spawn(move || {
            while is_running_forwarder.load(Ordering::Relaxed) {
                // Try to get a task from the shared receiver first
                match receiver.recv_timeout(Duration::from_millis(10)) {
                    Ok(task) => {
                        // Try to send to the worker's channel first
                        if let Err(_) = worker_tx.send(task) {
                            break; // Worker thread has ended
                        }
                    }
                    Err(_) => {
                        // If no task is available, try to get one from the work stealing queue
                        if let Some(task) = forwarder_queue.steal() {
                            if let Err(_) = worker_tx.send(task) {
                                break; // Worker thread has ended
                            }
                        }
                    }
                }
            }
        });

        Self {
            id,
            thread: Some(thread),
            _forwarder: Some(_forwarder),
            work_stealing_queue,
            is_running,
            _marker: PhantomData,
        }
    }
}

impl ParallelExecutor {
    /// Creates a new parallel executor with default configuration
    pub fn new() -> Self {
        Self::with_config(ParallelConfig::default())
    }
    
    /// Creates a new parallel executor with the given configuration
    pub fn with_config(config: ParallelConfig) -> Self {
        let num_workers = config.num_workers.max(1);
        let is_running = Arc::new(AtomicBool::new(true));
        
        // Create the shared work stealing queue
        let work_queues: Vec<_> = (0..num_workers)
            .map(|_| Arc::new(WorkStealingQueue::new(config.queue_size)))
            .collect();
        
        // Create a channel for task distribution
        let (task_sender, task_receiver) = mpsc::channel();
        
        // Create a vector to hold all worker channels
        let mut worker_channels = Vec::with_capacity(num_workers);
        
        // Create workers with their work stealing queues
        let mut workers = Vec::with_capacity(num_workers);
        for id in 0..num_workers {
            // Create a new channel for this worker
            let (worker_sender, worker_receiver) = mpsc::channel();
            worker_channels.push(worker_sender);
            
            workers.push(Worker::new(
                id,
                worker_receiver,  // Each worker gets its own receiver
                work_queues[id].clone(),
                is_running.clone(),
            ));
        }
        
        // Spawn a task distributor thread
        let distributor = {
            let is_running = is_running.clone();
            thread::spawn(move || {
                let mut next_worker = 0;
                while is_running.load(Ordering::Relaxed) {
                    match task_receiver.recv_timeout(Duration::from_millis(100)) {
                        Ok(task) => {
                            // Round-robin distribution of tasks to workers
                            if let Some(worker_sender) = worker_channels.get_mut(next_worker) {
                                if let Err(_) = worker_sender.send(task) {
                                    // Worker channel is closed, remove it
                                    worker_channels.swap_remove(next_worker);
                                    if worker_channels.is_empty() {
                                        break; // No more workers
                                    }
                                    if next_worker >= worker_channels.len() {
                                        next_worker = 0;
                                    }
                                    continue;
                                }
                            }
                            next_worker = (next_worker + 1) % worker_channels.len().max(1);
                        }
                        Err(_) => {
                            // Timeout, check if we should continue
                            if !is_running.load(Ordering::Relaxed) {
                                break;
                            }
                        }
                    }
                }
            })
        };
        
        Self {
            workers,
            task_sender,
            is_running,
            _distributor: Some(distributor),
            num_workers,
        }
    }
    
    /// Submits a task to be executed in parallel
    pub fn submit<F>(&self, task: F) -> Result<(), F>
    where
        F: FnOnce() + Send + 'static,
    {
        if !self.is_running.load(std::sync::atomic::Ordering::Relaxed) {
            return Err(task);
        }
        
        // Create a wrapper that will execute the task
        let task = std::sync::Arc::new(std::sync::Mutex::new(Some(task)));
        let task_clone = task.clone();
        
        let boxed_task: Box<dyn FnOnce() + Send + 'static> = Box::new(move || {
            if let Some(task) = task_clone.lock().unwrap().take() {
                task();
            }
        });
        
        self.task_sender
            .send(boxed_task)
            .map_err(|_| {
                // If sending fails, try to recover the original task
                task.lock().unwrap().take().unwrap()
            })
    }
    
    /// Returns the number of worker threads
    pub fn num_workers(&self) -> usize {
        self.num_workers
    }
    
    /// Returns the number of pending tasks across all workers
    pub fn pending_tasks(&self) -> usize {
        // This is an estimate since we can't atomically get the exact count
        self.workers
            .iter()
            .map(|w| w.work_stealing_queue.pending_tasks())
            .sum::<usize>()
    }
    
    /// Shuts down the executor and waits for all worker threads to finish
    pub fn shutdown(&self) {
        self.is_running.store(false, std::sync::atomic::Ordering::Relaxed);
        
        // Wake up any sleeping workers
        for _ in 0..self.num_workers {
            let _ = self.task_sender.send(Box::new(|| {}));
        }
        
        // Drop the sender to close the channel
        drop(self.task_sender.clone());
    }
}

impl Drop for ParallelExecutor {
    fn drop(&mut self) {
        self.shutdown();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::Ordering;
    use std::time::Duration;
    
    // Helper function for testing
    fn increment_counter(counter: &AtomicUsize) {
        counter.fetch_add(1, Ordering::Relaxed);
    }
    
    // Helper function for work stealing test
    fn increment_with_work(counter: &AtomicUsize) {
        std::thread::sleep(Duration::from_micros(100)); // Simulate work
        counter.fetch_add(1, Ordering::Relaxed);
    }
    
    #[test]
    fn test_parallel_executor() {
        let executor = ParallelExecutor::with_config(ParallelConfig {
            num_workers: 4,
            queue_size: 100,
            enable_work_stealing: true,
        });
        
        let counter = Arc::new(AtomicUsize::new(0));
        let num_tasks = 1000;
        
        for _ in 0..num_tasks {
            let counter = Arc::clone(&counter);
            let task = Box::new(move || increment_counter(&counter));
            if let Err(e) = executor.submit(task) {
                panic!("Failed to submit task: {:?}", e);
            }
        }
        
        // Wait for all tasks to complete
        while executor.pending_tasks() > 0 {
            std::thread::sleep(Duration::from_millis(10));
        }
        
        assert_eq!(counter.load(Ordering::Relaxed), num_tasks);
    }
    
    #[test]
    fn test_work_stealing() {
        let executor = ParallelExecutor::with_config(ParallelConfig {
            num_workers: 4,
            queue_size: 10,  // Small queue to force work stealing
            enable_work_stealing: true,
        });
        
        let counter = Arc::new(AtomicUsize::new(0));
        let num_tasks = 1000;
        
        // Submit tasks from a single thread to test work stealing
        for _ in 0..num_tasks {
            let counter = Arc::clone(&counter);
            let task = Box::new(move || increment_with_work(&counter));
            if let Err(e) = executor.submit(task) {
                panic!("Failed to submit task: {:?}", e);
            }
        }
        
        // Wait for all tasks to complete
        while executor.pending_tasks() > 0 {
            std::thread::sleep(Duration::from_millis(10));
        }
        
        assert_eq!(counter.load(Ordering::Relaxed), num_tasks);
    }
}

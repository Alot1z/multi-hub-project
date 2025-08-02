//! A work-stealing queue implementation for parallel task scheduling

//! A work-stealing queue implementation for parallel task scheduling

use std::sync::atomic::{AtomicUsize, Ordering, AtomicBool};
use std::sync::Arc;
use std::cell::UnsafeCell;
use std::mem::MaybeUninit;
use std::ptr;
use std::thread;

/// Type alias for tasks in the work-stealing queue
pub type Task = Box<dyn FnOnce() + Send + 'static>;

/// A lock-free work-stealing queue for parallel task scheduling
pub struct WorkStealingQueue {
    inner: Arc<Inner>,
    mask: usize,
}

struct Inner {
    buffer: Box<[UnsafeCell<MaybeUninit<Task>>]>,
    head: AtomicUsize,
    tail: AtomicUsize,
    active: AtomicBool,
}

unsafe impl Send for WorkStealingQueue {}
unsafe impl Sync for WorkStealingQueue {}

impl WorkStealingQueue {
    /// Creates a new work-stealing queue with the given capacity (rounded up to the next power of two)
    /// 
    /// # Panics
    /// Panics if the capacity is 0 or if allocation fails
    pub fn new(capacity: usize) -> Self {
        assert_ne!(capacity, 0, "Capacity cannot be zero");
        let capacity = capacity.next_power_of_two();
        let mut buffer = Vec::with_capacity(capacity);
        
        // Initialize the buffer with uninitialized memory
        for _ in 0..capacity {
            buffer.push(UnsafeCell::new(MaybeUninit::uninit()));
        }
        
        Self {
            inner: Arc::new(Inner {
                buffer: buffer.into_boxed_slice(),
                head: AtomicUsize::new(0),
                tail: AtomicUsize::new(0),
                active: AtomicBool::new(true),
            }),
            mask: capacity - 1,
        }
    }
    
    /// Pushes a task onto the queue (thread-safe, can be called from any thread)
    /// 
    /// # Returns
    /// - `Ok(())` if the task was successfully pushed
    /// - `Err(task)` if the queue is full or shutting down
    pub fn push(&self, task: Task) -> Result<(), Task> {
        let inner = &*self.inner;
        
        // Fast path check if queue is shutting down
        if !inner.active.load(Ordering::Relaxed) {
            return Err(task);
        }
        
        let mut tail = inner.tail.load(Ordering::Relaxed);
        let mut backoff = 0;
        
        loop {
            let head = inner.head.load(Ordering::Acquire);
            let next_tail = tail.wrapping_add(1);
            
            // Check if queue is full
            if next_tail.wrapping_sub(head) > self.mask {
                // Exponential backoff to reduce contention
                if backoff < 10 {
                    backoff += 1;
                    for _ in 0..(1 << backoff) {
                        std::hint::spin_loop();
                    }
                    tail = inner.tail.load(Ordering::Relaxed);
                    continue;
                }
                return Err(task);
            }
            
            // Try to claim a slot
            match inner.tail.compare_exchange_weak(
                tail,
                next_tail,
                Ordering::AcqRel,
                Ordering::Relaxed,
            ) {
                Ok(_) => {
                    // Write the task to the buffer
                    let idx = tail & self.mask;
                    unsafe {
                        let slot = inner.buffer.get_unchecked(idx).get();
                        ptr::write((*slot).as_mut_ptr(), task);
                        // Ensure the write is visible to other threads
                        std::sync::atomic::fence(Ordering::Release);
                    }
                    return Ok(());
                }
                Err(t) => {
                    tail = t;
                    std::hint::spin_loop();
                }
            }
        }
    }
    
    /// Steals a task from the queue (thread-safe, typically called by other workers)
    /// 
    /// # Returns
    /// - `Some(task)` if a task was successfully stolen
    /// - `None` if the queue is empty or shutting down
    pub fn steal(&self) -> Option<Task> {
        let inner = &*self.inner;
        
        // Fast path check if queue is shutting down
        if !inner.active.load(Ordering::Relaxed) {
            return None;
        }
        
        let mut tail = inner.tail.load(Ordering::Acquire);
        let mut backoff = 0;
        
        loop {
            let head = inner.head.load(Ordering::Acquire);
            
            // Check if queue is empty
            if head >= tail {
                return None;
            }
            
            // Try to claim a task
            match inner.tail.compare_exchange_weak(
                tail,
                tail.wrapping_add(1),
                Ordering::AcqRel,
                Ordering::Relaxed,
            ) {
                Ok(_) => {
                    // Read the task from the buffer
                    let idx = (tail - 1) & self.mask;
                    unsafe {
                        let slot = &*inner.buffer.get_unchecked(idx).get();
                        // Ensure we have the latest value
                        std::sync::atomic::fence(Ordering::Acquire);
                        let task = slot.assume_init_read();
                        return Some(task);
                    }
                }
                Err(t) => {
                    tail = t;
                    // Exponential backoff
                    if backoff < 10 {
                        backoff += 1;
                        for _ in 0..(1 << backoff) {
                            std::hint::spin_loop();
                        }
                    } else {
                        thread::yield_now();
                    }
                }
            }
        }
    }
    
    /// Returns the number of pending tasks in the queue
    pub fn pending_tasks(&self) -> usize {
        let inner = &*self.inner;
        let head = inner.head.load(Ordering::Relaxed);
        let tail = inner.tail.load(Ordering::Relaxed);
        tail.wrapping_sub(head) as usize
    }
    
    /// Pops a task from the queue (thread-safe, can be called from any thread)
    /// 
    /// # Returns
    /// - `Some(task)` if a task was successfully popped
    /// - `None` if the queue is empty or shutting down
    pub fn pop(&self) -> Option<Task> {
        let inner = &*self.inner;
        
        // Fast path check if queue is shutting down
        if !inner.active.load(Ordering::Relaxed) {
            return None;
        }
        
        let mut head = inner.head.load(Ordering::Relaxed);
        let mut backoff = 0;
        
        loop {
            let tail = inner.tail.load(Ordering::Acquire);
            
            if head == tail {
                return None; // Queue is empty
            }
            
            // Safe because we have a unique reference to this slot
            let idx = head & self.mask;
            let task = unsafe { &*inner.buffer.get_unchecked(idx).get() };
            
            match inner.head.compare_exchange_weak(
                head,
                head.wrapping_add(1),
                Ordering::AcqRel,
                Ordering::Relaxed,
            ) {
                Ok(_) => {
                    // Safety: We have exclusive access to this slot
                    let task = unsafe { task.assume_init_read() };
                    // Ensure we have the latest value
                    std::sync::atomic::fence(Ordering::Acquire);
                    return Some(task);
                }
                Err(h) => {
                    head = h;
                    // Exponential backoff
                    if backoff < 10 {
                        backoff += 1;
                        for _ in 0..(1 << backoff) {
                            std::hint::spin_loop();
                        }
                    } else {
                        thread::yield_now();
                    }
                }
            }
        }
    }
    
    /// Processes all tasks in the queue using the current thread
    /// 
    /// This method will continuously pop tasks from the queue and execute them
    /// until the queue is empty or the queue is marked as inactive.
    /// 
    /// # Returns
    /// The number of tasks processed
    pub fn process_all(&self) -> usize {
        let mut count = 0;
        while self.inner.active.load(Ordering::Relaxed) {
            if let Some(task) = self.pop() {
                task();
                count += 1;
            } else {
                break;
            }
        }
        count
    }
    
    /// Marks the queue as inactive, causing all operations to fail
    /// 
    /// This is used during shutdown to prevent new tasks from being processed
    pub fn shutdown(&self) {
        self.inner.active.store(false, Ordering::Release);
    }
    
}

impl Drop for Inner {
    fn drop(&mut self) {
        // Mark as inactive to prevent new operations
        self.active.store(false, Ordering::Release);
        
        // Ensure all operations are complete
        std::sync::atomic::fence(Ordering::Acquire);
        
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Relaxed);
        
        // Drop all remaining tasks
        for i in head..tail {
            let idx = i % self.buffer.len();
            unsafe {
                let slot = self.buffer.get_unchecked(idx).get();
                let task = (*slot).assume_init_read();
                // The task will be dropped when it goes out of scope
                std::mem::drop(task);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;
    use std::thread;
    use std::time::Duration;

    #[test]
    fn test_push_pop() {
        let queue = WorkStealingQueue::new(32);
        
        // Test push and pop
        assert!(queue.push(Box::new(|| {})).is_ok());
        assert!(queue.pop().is_some());
        assert!(queue.pop().is_none());
        
        // Test multiple items
        for i in 0..10 {
            assert!(queue.push(Box::new(move || { 
                let _ = i; 
            })).is_ok());
        }
        
        for _ in 0..10 {
            assert!(queue.pop().is_some());
        }
        
        assert!(queue.pop().is_none());
    }
    
    #[test]
    fn test_steal() {
        let queue = Arc::new(WorkStealingQueue::new(4));
        let counter = Arc::new(AtomicUsize::new(0));
        
        // Push two tasks
        let c = counter.clone();
        assert!(queue.push(Box::new(move || {
            c.fetch_add(1, Ordering::Relaxed);
        })).is_ok());
        
        let c = counter.clone();
        assert!(queue.push(Box::new(move || {
            c.fetch_add(1, Ordering::Relaxed);
        })).is_ok());
        
        // Steal one task from another thread
        let queue2 = queue.clone();
        let counter2 = counter.clone();
        let handle = thread::spawn(move || {
            thread::sleep(Duration::from_millis(10));
            if let Some(task) = queue2.steal() {
                task();
                true
            } else {
                false
            }
        });
        
        // Execute one task in the main thread
        if let Some(task) = queue.pop() {
            task();
        }
        
        // Verify the stolen task was executed
        assert!(handle.join().unwrap());
        assert_eq!(counter2.load(Ordering::Relaxed), 2);
        assert!(queue.pop().is_none());
    }
    
    #[test]
    fn test_concurrent() {
        const NUM_TASKS: usize = 1000;
        const NUM_THREADS: usize = 4;
        
        let queue = Arc::new(WorkStealingQueue::new(1024));
        let counter = Arc::new(AtomicUsize::new(0));
        
        // Spawn producer threads
        let mut handles = vec![];
        for _ in 0..NUM_THREADS {
            let queue = queue.clone();
            let _counter = counter.clone();
            let handle = thread::spawn(move || {
                for _ in 0..NUM_TASKS {
                    let counter = _counter.clone();
                    assert!(queue.push(Box::new(move || {
                        counter.fetch_add(1, Ordering::Relaxed);
                    })).is_ok());
                }
            });
            handles.push(handle);
        }
        
        // Spawn consumer threads
        for _ in 0..NUM_THREADS {
            let queue = queue.clone();
            let _counter = counter.clone();
            let handle = thread::spawn(move || {
                while let Some(task) = queue.pop() {
                    task();
                }
                
                while let Some(task) = queue.steal() {
                    task();
                }
            });
            handles.push(handle);
        }
        
        // Wait for all threads to complete
        for handle in handles {
            handle.join().unwrap();
        }
        
        // Verify all tasks were processed
        assert_eq!(counter.load(Ordering::SeqCst), NUM_TASKS * NUM_THREADS);
    }
}

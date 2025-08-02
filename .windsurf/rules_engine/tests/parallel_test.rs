use windsurf_rules_engine::parallel::{
    ParallelExecutor, 
    ParallelIter, 
    executor::ParallelConfig,
    Task
};
use std::sync::atomic::{AtomicUsize, AtomicBool, Ordering};
use std::sync::{Arc, Barrier};
use std::thread;
use std::time::Duration;
use rand::Rng;
use parking_lot::Mutex;
use proptest::prelude::*;
use std::sync::atomic::Ordering::Relaxed;

// Helper functions to replace closures
fn increment_counter(counter: Arc<AtomicUsize>) {
    counter.fetch_add(1, Ordering::Relaxed);
}

fn increment_with_work(counter: Arc<AtomicUsize>) {
    thread::sleep(Duration::from_micros(100)); // Simulate work
    counter.fetch_add(1, Ordering::Relaxed);
}

fn panic_task() {
    panic!("This task is supposed to panic!");
}

fn noop() {}

fn increment_mutex(counter: Arc<Mutex<usize>>) {
    let mut num = counter.lock();
    *num += 1;
}

fn barrier_wait(barrier: Arc<Barrier>, counter: Arc<AtomicUsize>) {
    barrier.wait();
    counter.fetch_add(1, Ordering::Relaxed);
}

#[test]
fn test_parallel_executor_basic() {
    // Create an executor with 4 worker threads
    let executor = ParallelExecutor::new(4);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit 1000 tasks using the helper function
    for _ in 0..1000 {
        let counter_clone = counter.clone();
        let task = Box::new(move || increment_counter(counter_clone));
        if let Err(e) = executor.submit(task) {
            panic!("Failed to submit task: {:?}", e);
        }
    }
    
    // Give tasks time to complete
    thread::sleep(Duration::from_millis(100));
    
    // Verify all tasks completed
    assert_eq!(counter.load(Ordering::Relaxed), 1000);
}

#[test]
fn test_parallel_executor_work_stealing() {
    let executor = ParallelExecutor::new(4);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit more tasks than worker threads to trigger work stealing
    for _ in 0..1000 {
        let counter_clone = counter.clone();
        let task = Box::new(move || increment_with_work(counter_clone));
        if let Err(e) = executor.submit(task) {
            panic!("Failed to submit task: {:?}", e);
        }
    }
    
    // Wait for tasks to complete
    while counter.load(Ordering::Relaxed) < 1000 {
        thread::sleep(Duration::from_millis(10));
    }
    
    assert_eq!(counter.load(Ordering::Relaxed), 1000);
}

#[test]
fn test_parallel_iter() {
    let data: Vec<_> = (0..1000).collect();
    let sum = Arc::new(AtomicUsize::new(0));
    
    // Process data in parallel
    ParallelIter::new(data.into_iter())
        .for_each(|n| {
            sum.fetch_add(n, Ordering::Relaxed);
        });
    
    // Sum of 0..999 = (n*(n+1))/2 where n=999
    assert_eq!(sum.load(Ordering::Relaxed), 999 * 1000 / 2);
}

#[test]
fn test_parallel_executor_panic_handling() {
    let executor = ParallelExecutor::new(2);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit tasks, some of which panic
    for i in 0..100 {
        let counter = counter.clone();
        executor.submit(move || {
            if i % 10 == 0 {
                panic!("Intentional panic for test");
            } else {
                counter.fetch_add(1, Ordering::Relaxed);
            }
        }).unwrap();
    }
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(100));
    
    // Should have processed all non-panicking tasks
    assert_eq!(counter.load(Ordering::Relaxed), 90);
}

#[test]
fn test_parallel_executor_pending_tasks() {
    let executor = ParallelExecutor::new(2);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit tasks with delays to create pending tasks
    for _ in 0..10 {
        let counter = counter.clone();
        executor.submit(move || {
            thread::sleep(Duration::from_millis(10));
            counter.fetch_add(1, Ordering::Relaxed);
        }).unwrap();
    }
    
    // Should have pending tasks initially
    let pending = executor.pending_tasks();
    assert!(pending > 0);
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(100));
    
    // No pending tasks after completion
    assert_eq!(executor.pending_tasks(), 0);
    assert_eq!(counter.load(Ordering::Relaxed), 10);
}

#[test]
fn test_parallel_executor_queue_full() {
    // Create executor with small queue size
    let executor = ParallelExecutor::new(1);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Fill the queue with a long-running task
    let counter_clone = counter.clone();
    executor.submit(move || {
        thread::sleep(Duration::from_millis(100));
        counter_clone.fetch_add(1, Ordering::Relaxed);
    }).unwrap();
    
    // Try to submit more tasks than the queue can hold
    let mut submitted = 0;
    for _ in 0..1000 {
        let counter = counter.clone();
        if executor.submit(move || {
            counter.fetch_add(1, Ordering::Relaxed);
        }).is_ok() {
            submitted += 1;
        } else {
            break;
        }
    }
    
    // Should have submitted at least some tasks before filling up
    assert!(submitted > 0);
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(200));
    
    // Verify completed tasks
    assert!(counter.load(Ordering::Relaxed) > 0);
}

#[test]
fn test_parallel_barrier_sync() {
    let executor = ParallelExecutor::new(4);
    let barrier = Arc::new(Barrier::new(4));
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Launch 4 tasks that synchronize at a barrier
    for _ in 0..4 {
        let barrier = barrier.clone();
        let counter = counter.clone();
        executor.submit(move || {
            // Simulate some work
            thread::sleep(Duration::from_millis(rand::thread_rng().gen_range(1..10)));
            barrier.wait();
            counter.fetch_add(1, Ordering::SeqCst);
        }).unwrap();
    }
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(100));
    
    // All tasks should have incremented the counter after the barrier
    assert_eq!(counter.load(Ordering::SeqCst), 4);
}

#[test]
fn test_parallel_shared_state() {
    let executor = ParallelExecutor::new(4);
    let shared_map = Arc::new(Mutex::new(std::collections::HashMap::new()));
    
    // Submit tasks that modify shared state
    for i in 0..1000 {
        let map = shared_map.clone();
        executor.submit(move || {
            let mut map = map.lock();
            map.insert(i, i * 2);
        }).unwrap();
    }
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(200));
    
    // Verify all entries were processed
    let map = shared_map.lock();
    assert_eq!(map.len(), 1000);
    for i in 0..1000 {
        assert_eq!(map[&i], i * 2);
    }
}

#[test]
fn test_parallel_cancellation() {
    let executor = ParallelExecutor::new(2);
    let counter = Arc::new(AtomicUsize::new(0));
    let cancelled = Arc::new(AtomicBool::new(false));
    
    // Submit a long-running task
    let cancelled_clone = cancelled.clone();
    executor.submit(move || {
        for _ in 0..10 {
            if cancelled_clone.load(Ordering::Relaxed) {
                return;
            }
            thread::sleep(Duration::from_millis(10));
        }
        counter.fetch_add(1, Ordering::Relaxed);
    }).unwrap();
    
    // Submit a task that will be cancelled
    {
        let cancelled_clone = cancelled.clone();
        let counter_clone = counter.clone();
        executor.submit(move || {
            cancelled_clone.store(true, Ordering::Relaxed);
            counter_clone.fetch_add(1, Ordering::Relaxed);
        }).unwrap();
    }
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(100));
    
    // Only the cancellation task should have completed
    assert_eq!(counter.load(Ordering::Relaxed), 1);
}

#[test]
fn test_parallel_throughput() {
    let executor = ParallelExecutor::new(num_cpus::get());
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit a large number of small tasks
    let start = std::time::Instant::now();
    for _ in 0..100_000 {
        let counter = counter.clone();
        executor.submit(move || {
            counter.fetch_add(1, Ordering::Relaxed);
        }).unwrap();
    }
    
    // Wait for all tasks to complete
    while counter.load(Ordering::Relaxed) < 100_000 {
        thread::yield_now();
    }
    
    let elapsed = start.elapsed();
    println!("Processed 100,000 tasks in {:?}", elapsed);
    assert!(elapsed < Duration::from_secs(1), "Parallel executor too slow");
}

// Property-based testing for parallel executor
// Helper function for property-based testing
fn test_arbitrary_task(n: usize, counter: Arc<AtomicUsize>) {
    counter.fetch_add(n, Ordering::Relaxed);
}

proptest! {
    #[test]
    fn test_parallel_arbitrary_tasks(n in 1..1000usize) {
        let executor = ParallelExecutor::new(4);
        let counter = Arc::new(AtomicUsize::new(0));
        
        // Submit n tasks using the helper function
        for _ in 0..n {
            let counter_clone = counter.clone();
            executor.submit(Box::new(move || {
                counter_clone.fetch_add(1, Ordering::Relaxed);
            })).unwrap();
        }
        
        // Wait for tasks to complete
        std::thread::sleep(Duration::from_millis(100));
        
        assert_eq!(counter.load(Ordering::Relaxed), n);
    }
}
}

#[test]
fn test_parallel_executor_drop_behavior() {
    let executor = ParallelExecutor::new(2);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit some tasks
    for _ in 0..10 {
        let counter = counter.clone();
        executor.submit(move || {
            thread::sleep(Duration::from_millis(10));
            counter.fetch_add(1, Ordering::Relaxed);
        }).unwrap();
    }
    
    // Drop the executor before all tasks complete
    std::mem::drop(executor);
    
    // Some tasks may complete, but not necessarily all
    let final_count = counter.load(Ordering::Relaxed);
    assert!(final_count > 0, "At least some tasks should complete");
    assert!(final_count <= 10, "No more tasks than submitted should complete");
}

#[test]
fn test_parallel_executor_panic_in_worker() {
    let executor = ParallelExecutor::new(2);
    let counter = Arc::new(AtomicUsize::new(0));
    
    // Submit a task that panics
    let counter_clone = counter.clone();
    executor.submit(move || {
        panic!("Worker panic test");
    }).unwrap();
    
    // Submit more tasks - they should still execute
    for _ in 0..10 {
        let counter = counter.clone();
        executor.submit(move || {
            counter.fetch_add(1, Ordering::Relaxed);
        }).unwrap();
    }
    
    // Wait for tasks to complete
    thread::sleep(Duration::from_millis(100));
    
    // All non-panicking tasks should complete
    assert_eq!(counter.load(Ordering::Relaxed), 10);
}

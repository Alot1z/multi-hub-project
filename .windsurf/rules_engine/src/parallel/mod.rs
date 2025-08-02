//! Parallel execution utilities for the Windsurf Rules Engine
//! 
//! This module provides high-performance parallel execution primitives
//! including work-stealing queues, parallel iterators, and task scheduling.
//! 
//! # Features
//! - Work-stealing task scheduler for load balancing
//! - Lock-free concurrent data structures
//! - Parallel iterators for easy data parallelism
//! - Configurable thread pool with work stealing
//! - Graceful shutdown and resource cleanup
//!
//! # Examples
//! ```no_run
//! use windsurf_rules_engine::parallel::{ParallelConfig, ParallelExecutor};
//! use std::sync::atomic::{AtomicUsize, Ordering};
//! use std::sync::Arc;
//!
//! let executor = ParallelExecutor::with_config(ParallelConfig {
//!     num_workers: 4,
//!     queue_size: 1024,
//!     enable_work_stealing: true,
//! });
//!
//! let counter = Arc::new(AtomicUsize::new(0));
//! for _ in 0..1000 {
//!     let counter = counter.clone();
//!     executor.submit(move || {
//!         counter.fetch_add(1, Ordering::Relaxed);
//!     }).unwrap();
//! }
//! ```

#![warn(missing_docs)]
#![warn(rustdoc::missing_crate_level_docs)]
#![warn(clippy::all)]

pub mod executor;
pub mod work_stealing;

pub use self::executor::{ParallelIter, ParallelExecutor};
pub use self::work_stealing::WorkStealingQueue;

/// Configuration for parallel execution
///
/// This struct allows configuring various parameters of the parallel executor,
/// including the number of worker threads, queue sizes, and work-stealing behavior.
///
/// # Default Values
/// - `num_workers`: Number of CPU cores
/// - `queue_size`: 1024 tasks per worker
/// - `enable_work_stealing`: true
#[derive(Debug, Clone, Copy)]
pub struct ParallelConfig {
    /// Number of worker threads to use.
    /// Defaults to the number of available CPU cores.
    pub num_workers: usize,
    
    /// Size of the work-stealing queue per worker.
    /// Must be a power of two for optimal performance.
    /// Default: 1024
    pub queue_size: usize,
    
    /// Whether to enable work stealing between worker threads.
    /// When enabled, idle workers can steal tasks from busy workers.
    /// Default: true
    pub enable_work_stealing: bool,
}

impl Default for ParallelConfig {
    fn default() -> Self {
        Self {
            num_workers: num_cpus(),
            queue_size: 1024,
            enable_work_stealing: true,
        }
    }
}

/// Returns the number of available CPU cores.
/// This uses `std::thread::available_parallelism()` for better portability.
/// 
/// # Examples
/// ```
/// use windsurf_rules_engine::parallel::num_cpus;
/// 
/// let cores = num_cpus();
/// assert!(cores > 0);
/// ```
pub fn num_cpus() -> usize {
    std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1)
}

// Test helper functions
#[cfg(test)]
fn test_increment_counter(counter: &std::sync::atomic::AtomicUsize) {
    counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
}

#[cfg(test)]
fn test_increment_with_work(counter: &std::sync::atomic::AtomicUsize) {
    counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    // Simulate work
    std::thread::sleep(std::time::Duration::from_micros(100));
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::sync::Arc;
    use std::sync::atomic::{AtomicUsize, Ordering};
    // Removed unused import: use std::time::Duration;
    
    #[test]
    fn test_parallel_iter() {
        let count = Arc::new(AtomicUsize::new(0));
        let data: Vec<_> = (0..1000).collect();
        
        let count_clone = count.clone();
        ParallelIter::new(data.into_iter())
            .for_each(move |_| {
                count_clone.fetch_add(1, Ordering::Relaxed);
            });
            
        assert_eq!(count.load(Ordering::SeqCst), 1000);
    }
    
    #[test]
    fn test_parallel_executor() {
        let executor = ParallelExecutor::with_config(ParallelConfig {
            num_workers: 4,
            queue_size: 100,
            enable_work_stealing: true,
        });
        
        let counter = Arc::new(AtomicUsize::new(0));
        
        // Submit some tasks
        for _ in 0..1000 {
            let counter = counter.clone();
            let task = Box::new(move || test_increment_counter(&counter));
            if let Err(e) = executor.submit(task) {
                panic!("Failed to submit task: {:?}", e);
            }
        }
        
        // Give some time for tasks to complete
        thread::sleep(std::time::Duration::from_millis(100));
        
        assert_eq!(counter.load(Ordering::SeqCst), 1000);
    }
    
    #[test]
    fn test_work_stealing() {
        let executor = ParallelExecutor::with_config(ParallelConfig {
            num_workers: 4,
            queue_size: 10,  // Small queue to force work stealing
            enable_work_stealing: true,
        });
        
        let counter = Arc::new(AtomicUsize::new(0));
        
        // Submit more tasks than the queue size to trigger work stealing
        for _ in 0..1000 {
            let counter = counter.clone();
            let task = Box::new(move || test_increment_with_work(&counter));
            if let Err(e) = executor.submit(task) {
                panic!("Failed to submit task: {:?}", e);
            }
        }
        
        // Give time for tasks to complete
        thread::sleep(std::time::Duration::from_secs(2));
        
        assert_eq!(counter.load(Ordering::SeqCst), 1000);
    }
    
    #[test]
    fn test_config_default() {
        let config = ParallelConfig::default();
        assert!(config.num_workers > 0);
        assert_eq!(config.queue_size, 1024);
        assert!(config.enable_work_stealing);
    }
    
    #[test]
    fn test_num_cpus() {
        let cpus = num_cpus();
        assert!(cpus > 0);
        assert!(cpus <= 128); // Reasonable upper bound
    }
}

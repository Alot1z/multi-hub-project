//! # Windsurf Rules Engine
//! 
//! Ultra-high performance rules engine with SIMD acceleration and lock-free parallelism,
//! built with a hybrid Rust/C++ architecture for maximum performance.
//!
//! ## Features
//! - 🚀 **Hybrid Architecture**: Combines Rust's safety with C++'s raw performance
//! - ⚡ **SIMD Acceleration**: AVX2/AVX-512 vectorization for bulk operations
//! - 🔒 **Thread Safety**: Lock-free data structures and atomic operations
//! - 🧠 **Smart Caching**: Rule result caching with automatic invalidation
//! - 📊 **Metrics**: Detailed performance metrics collection
//! - 🔄 **Parallel Execution**: Work-stealing task scheduler for optimal CPU utilization
//! - 📈 **Scalable**: Efficient memory management with custom allocators
//! - 🔍 **Observability**: Built-in tracing and logging
//! - 🌐 **Cross-Platform**: Runs anywhere Rust is supported
//!
//! ## Quick Start
//! ```rust
//! use windsurf_rules_engine::prelude::*;
//! use windsurf_rules_engine::metrics::RuleMetrics;
//! use std::time::Duration;
//!
//! // Initialize the engine
//! let metrics = RuleMetrics::default();
//!
//! // Record execution metrics
//! metrics.record_execution(Duration::from_millis(100));
//! 
//! // Get performance snapshot
//! let snapshot = metrics.snapshot();
//! println!("Average execution time: {:?}", snapshot.average_execution_time());
//! ```

#![warn(missing_docs)]
#![cfg_attr(feature = "simd", feature(portable_simd))]
#![cfg_attr(feature = "simd-avx2", feature(stdsimd))]
#![cfg_attr(feature = "simd-avx512", feature(avx512_target_feature))]
#![allow(dead_code)]  // Temporary during development

// Core modules
#[cfg(feature = "cpp")]
mod ffi;  // FFI bindings to C++ core

/// Core engine implementation
pub mod core;

/// Parallel execution utilities and work-stealing
pub mod parallel;

/// Caching system for rule evaluation results
#[cfg(feature = "caching")]
pub mod cache;

/// SIMD-accelerated operations for high-performance rule evaluation
#[cfg(feature = "simd")]
pub mod simd;

/// Metrics collection and monitoring
#[cfg(feature = "metrics")]
pub mod metrics;

/// Error types and handling
pub mod error;

/// Memory management and custom allocators
pub mod memory;

/// Rule definition and processing
pub mod rule;

// Re-export the FFI module if C++ feature is enabled
#[cfg(feature = "cpp")]
pub use ffi::{Engine, FfiError};

// Re-exports
pub use crate::error::Error;
pub use crate::error::Result;
pub use crate::core::HyperEngine;

/// Predefined rules and optimizations
pub mod prelude {
    pub use crate::{
        cache::Cache,
        metrics::Metric,
        parallel::{ParallelConfig, ParallelExecutor, WorkStealingQueue, ParallelIter},
        error::Error,
        Result,
        rule::Rule
    };
}

#[cfg(test)]
mod tests {
    use crate::prelude::*;

    // Helper function for testing
    fn test_task(counter: std::sync::Arc<std::sync::atomic::AtomicUsize>) {
        counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    #[test]
    fn test_parallel_executor() {
        // Create a custom configuration with 2 worker threads
        let config = ParallelConfig {
            num_workers: 2,
            ..Default::default()
        };
        let executor = ParallelExecutor::with_config(config);
        
        let counter = std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(0));
        
        // Submit a task to the executor
        let counter_clone = counter.clone();
        // Use the named function instead of a closure
        let task = Box::new(|| test_task(counter_clone));
        
        // Submit the task and handle potential errors
        if let Err(e) = executor.submit(task) {
            panic!("Failed to submit task: {:?}", e);
        }
        
        // Wait for tasks to complete
        std::thread::sleep(std::time::Duration::from_millis(100));
        
        // Verify the task was executed
        assert_eq!(counter.load(std::sync::atomic::Ordering::Relaxed), 1);
    }
}

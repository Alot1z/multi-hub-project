//! Basic usage example for the Windsurf Rules Engine

use windsurf_rules_engine::prelude::*;
use windsurf_rules_engine::engine::RulesEngine;
use std::time::Instant;

fn main() {
    println!("🚀 Starting Windsurf Rules Engine example...");
    
    // Create a new engine instance
    let mut engine = RulesEngine::new();
    
    // Example 1: Process data using SIMD acceleration
    let input = [1.0; 16];
    let mut output = [0.0; 16];
    
    let start = Instant::now();
    engine.process_data(&input, &mut output);
    let duration = start.elapsed();
    
    println!("✅ Processed {} elements in {:?}", input.len(), duration);
    println!("   Input:  {:?}", &input[..8]);
    println!("   Output: {:?}", &output[..8]);
    
    // Example 2: Parallel processing with work-stealing
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::sync::Arc;
    
    let counter = Arc::new(AtomicU64::new(0));
    let num_tasks = 1000;
    let mut tasks = Vec::with_capacity(num_tasks);
    
    println!("\n🚀 Starting parallel processing with {} tasks...", num_tasks);
    
    // Create tasks that each increment the counter
    for _ in 0..num_tasks {
        let counter = Arc::clone(&counter);
        tasks.push(move || {
            counter.fetch_add(1, Ordering::Relaxed);
        });
    }
    
    let start = Instant::now();
    engine.process_parallel(tasks);
    let duration = start.elapsed();
    
    println!("✅ Completed {} tasks in {:?}", num_tasks, duration);
    println!("   Final counter value: {}", counter.load(Ordering::Relaxed));
    
    // Example 3: Memory pool usage
    println!("\n🚀 Allocating memory from the pool...");
    let block = engine.get_memory_block();
    println!("✅ Allocated block of {} bytes", block.len());
    
    println!("\n✨ Example completed successfully!");
}

#[test]
fn test_example() {
    // This test ensures the example compiles and runs
    main();
}

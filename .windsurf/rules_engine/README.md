# Windsurf Rules Engine

[![Crates.io](https://img.shields.io/crates/v/windsurf_rules_engine.svg)](https://crates.io/crates/windsurf_rules_engine)
[![Documentation](https://docs.rs/windsurf_rules_engine/badge.svg)](https://docs.rs/windsurf_rules_engine)
[![License](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg)](https://github.com/yourusername/windsurf-rules)
[![codecov](https://codecov.io/gh/yourusername/windsurf-rules/graph/badge.svg?token=YOUR-TOKEN)](https://codecov.io/gh/yourusername/windsurf-rules)

Ultra-high performance rules engine with SIMD acceleration and lock-free parallelism, built with a hybrid Rust/C++ architecture for maximum performance.

## Features

- 🚀 **Hybrid Architecture**: Combines Rust's safety with C++'s raw performance
- ⚡ **SIMD Acceleration**: AVX2/AVX-512 vectorization for bulk operations
- 🔒 **Thread Safety**: Lock-free data structures and atomic operations
- 🧠 **Smart Caching**: Rule result caching with automatic invalidation
- 📊 **Metrics**: Detailed performance metrics collection
- 🔄 **Parallel Execution**: Work-stealing task scheduler for optimal CPU utilization
- 📈 **Scalable**: Efficient memory management with custom allocators
- 🔍 **Observability**: Built-in tracing and logging
- 🌐 **Cross-Platform**: Runs anywhere Rust is supported

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
windsurf_rules_engine = { version = "0.1", features = ["simd", "caching", "metrics"] }
```

## Features

### Core Features

- `default`: Enables parallel execution, caching, and metrics
- `parallel`: Enables parallel execution using Rayon
- `simd`: Enables SIMD acceleration (AVX2/AVX-512)
- `caching`: Enables rule result caching
- `metrics`: Enables performance metrics collection
- `jemalloc`: Uses jemalloc for improved memory management
- `cpp`: Enables C++ FFI bindings

## Usage

```rust
use windsurf_rules_engine::prelude::*;
use std::time::Duration;

// Initialize the engine
let engine = RulesEngine::new();

// Define a rule
let rule = Rule::new("example_rule")
    .condition(|ctx| {
        // Rule condition logic
        true
    })
    .action(|ctx| {
        // Action to perform when rule matches
        println!("Rule matched!");
        Ok(())
    });

// Add rule to engine
engine.add_rule(rule);

// Execute rules
let context = Context::new();
let results = engine.execute(&context).await?;

// Check results
if results.matched_rules().contains("example_rule") {
    println!("Example rule was matched!");
}
```

## Performance

The engine is designed for high performance with:

- Zero-cost abstractions
- Lock-free data structures
- Work-stealing task scheduling
- SIMD-accelerated operations
- Memory pooling and custom allocators

## Caching

The engine includes a high-performance caching system:

```rust
use windsurf_rules_engine::cache::Cache;
use std::time::Duration;

// Create a cache with TTL and max entries
let cache = Cache::new(Some(Duration::from_secs(60)), Some(1000));

// Insert a value
cache.insert("key", "value");

// Get a value
if let Some(value) = cache.get(&"key") {
    println!("Cached value: {}", value);
}
```

## Metrics

Built-in metrics collection:

```rust
use windsurf_rules_engine::metrics::*;
use std::time::Duration;

// Record metrics
increment_counter!("rules.matched", 1);
record_histogram!("rule.execution_time", 150);

// Time an operation
let _timer = start_timer!("expensive_operation");
// ... expensive operation ...

// Get metrics snapshot
let metrics = snapshot_metrics();
println!("Metrics: {:#?}", metrics);
```

## SIMD Acceleration

Leverage SIMD for high-performance operations:

```rust
#[cfg(feature = "simd")]
use windsurf_rules_engine::simd::*;

#[cfg(feature = "simd")]
fn process_data(data: &[f32]) -> Vec<f32> {
    let simd_vec = SimdVector::<f32>::new(data);
    simd_vec.map(|x| x * Simd::splat(2.0))
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

Licensed under either of:

 * Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license
   ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.

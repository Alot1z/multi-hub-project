//! Metrics collection and monitoring for the rules engine.
//!
//! This module provides functionality for collecting, aggregating, and exporting
//! various metrics about the rules engine's performance and behavior.

use std::collections::HashMap;
use std::sync::atomic::{AtomicI64, AtomicU64, Ordering};
use std::time::{Duration, Instant};

use lazy_static::lazy_static;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Represents a single metric with a name and value.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricValue {
    /// A counter that can only increase or be reset to zero
    Counter(u64),
    
    /// A gauge that can increase or decrease
    Gauge(i64),
    
    /// A timing measurement in milliseconds
    Timing(Duration),
    
    /// A histogram of values with their frequencies
    Histogram(Vec<u64>),
}

/// A named metric with a value and optional tags.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metric {
    /// The name of the metric
    pub name: String,
    
    /// The value of the metric
    pub value: MetricValue,
    
    /// Optional key-value pairs to categorize or filter metrics
    pub tags: HashMap<String, String>,
    
    /// Optional timestamp in milliseconds since Unix epoch
    pub timestamp: Option<u64>,
}

/// A collector for metrics that can be updated and queried.
#[derive(Debug, Default)]
pub struct MetricsCollector {
    counters: RwLock<HashMap<String, Arc<AtomicU64>>>,
    gauges: RwLock<HashMap<String, Arc<AtomicI64>>>,
    timings: RwLock<HashMap<String, Vec<Duration>>>,
    histograms: RwLock<HashMap<String, Vec<u64>>>,
}

impl MetricsCollector {
    /// Creates a new, empty metrics collector.
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Increments a counter by the specified amount.
    pub fn increment_counter(&self, name: &str, value: u64, _tags: Option<HashMap<String, String>>) {
        let mut counters = self.counters.write();
        let counter = counters
            .entry(name.to_string())
            .or_insert_with(|| Arc::new(AtomicU64::new(0)));
        counter.fetch_add(value, Ordering::Relaxed);
    }
    
    /// Decrements a gauge by the specified amount.
    pub fn decrement_gauge(&self, name: &str, value: i64, _tags: Option<HashMap<String, String>>) {
        let mut gauges = self.gauges.write();
        let gauge = gauges
            .entry(name.to_string())
            .or_insert_with(|| Arc::new(AtomicI64::new(0)));
        gauge.fetch_sub(value, Ordering::Relaxed);
    }
    
    /// Records a timing value in milliseconds.
    pub fn record_timing(&self, name: &str, duration: Duration, _tags: Option<HashMap<String, String>>) {
        let mut timings = self.timings.write();
        let timing = timings.entry(name.to_string()).or_default();
        timing.push(duration);
    }
    
    /// Records a value in a histogram.
    pub fn record_histogram(&self, name: &str, value: u64, _tags: Option<HashMap<String, String>>) {
        let mut histograms = self.histograms.write();
        let histogram = histograms.entry(name.to_string()).or_default();
        histogram.push(value);
    }
    
    /// Returns a snapshot of all collected metrics.
    pub fn snapshot(&self) -> Vec<Metric> {
        let mut metrics = Vec::new();
        let timestamp = Some(std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs());
        
        // Collect counters
        for (name, counter) in self.counters.read().iter() {
            metrics.push(Metric {
                name: name.clone(),
                value: MetricValue::Counter(counter.load(Ordering::Relaxed)),
                tags: HashMap::new(),
                timestamp,
            });
        }
        
        // Collect gauges
        for (name, gauge) in self.gauges.read().iter() {
            metrics.push(Metric {
                name: name.clone(),
                value: MetricValue::Gauge(gauge.load(Ordering::Relaxed)),
                tags: HashMap::new(),
                timestamp,
            });
        }
        
        // Collect timings (averages)
        for (name, timings) in self.timings.read().iter() {
            if !timings.is_empty() {
                let sum: Duration = timings.iter().sum();
                let avg = sum / timings.len() as u32;
                
                metrics.push(Metric {
                    name: format!("{}_avg", name),
                    value: MetricValue::Timing(avg),
                    tags: HashMap::new(),
                    timestamp,
                });
                
                metrics.push(Metric {
                    name: format!("{}_count", name),
                    value: MetricValue::Counter(timings.len() as u64),
                    tags: HashMap::new(),
                    timestamp,
                });
            }
        }
        
        // Collect histogram percentiles
        for (name, values) in self.histograms.read().iter() {
            if !values.is_empty() {
                let mut sorted = values.clone();
                sorted.sort_unstable();
                
                let len = sorted.len();
                let p50_idx = (len as f64 * 0.5) as usize;
                let p90_idx = (len as f64 * 0.9) as usize;
                let p99_idx = (len as f64 * 0.99) as usize;
                
                metrics.push(Metric {
                    name: format!("{}_p50", name),
                    value: MetricValue::Gauge(*sorted.get(p50_idx).unwrap_or(&0) as i64),
                    tags: HashMap::new(),
                    timestamp,
                });
                
                metrics.push(Metric {
                    name: format!("{}_p90", name),
                    value: MetricValue::Gauge(*sorted.get(p90_idx).unwrap_or(&0) as i64),
                    tags: HashMap::new(),
                    timestamp,
                });
                
                metrics.push(Metric {
                    name: format!("{}_p99", name),
                    value: MetricValue::Gauge(*sorted.get(p99_idx).unwrap_or(&0) as i64),
                    tags: HashMap::new(),
                    timestamp,
                });
                
                metrics.push(Metric {
                    name: format!("{}_count", name),
                    value: MetricValue::Counter(len as u64),
                    tags: HashMap::new(),
                    timestamp,
                });
            }
        }
        
        metrics
    }
    
    /// Resets all metrics.
    pub fn reset(&self) {
        self.counters.write().clear();
        self.gauges.write().clear();
        self.timings.write().clear();
        self.histograms.write().clear();
    }
}

/// A simple timer that records the duration between its creation and drop.
pub struct Timer<'a> {
    name: String,
    collector: &'a MetricsCollector,
    start: Instant,
    tags: Option<HashMap<String, String>>,
}

impl<'a> Timer<'a> {
    /// Creates a new timer that will record the duration to the specified collector.
    pub fn new(collector: &'a MetricsCollector, name: &str) -> Self {
        Self {
            name: name.to_string(),
            collector,
            start: Instant::now(),
            tags: None,
        }
    }
    
    /// Adds tags to the timer.
    pub fn with_tags(mut self, tags: HashMap<String, String>) -> Self {
        self.tags = Some(tags);
        self
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        let duration = self.start.elapsed();
        self.collector.record_timing(&self.name, duration, self.tags.take());
    }
}

lazy_static! {
    /// Global thread-safe metrics collector instance.
    ///
    /// This is the main entry point for collecting metrics throughout the application.
    /// It is thread-safe and can be accessed from multiple threads concurrently.
    ///
    /// # Examples
    ///
    /// ```
    /// use windsurf_rules_engine::metrics::{self, MetricValue};
    /// use std::time::Duration;
    ///
    /// // Increment a counter
    /// metrics::increment_counter("requests", 1, None);
    ///
    /// // Record a timing
    /// metrics::record_timing("request_time", Duration::from_millis(42), None);
    ///
    /// // Get a snapshot of all metrics
    /// let snapshot = metrics::snapshot();
    /// ```
    pub static ref GLOBAL_METRICS: RwLock<MetricsCollector> = RwLock::new(MetricsCollector::new());
}

// Explicitly implement Sync and Send for MetricsCollector
unsafe impl Sync for MetricsCollector {}
unsafe impl Send for MetricsCollector {}

/// Records a timing metric with the global collector.
pub fn record_timing(name: &str, duration: Duration, tags: Option<HashMap<String, String>>) {
    GLOBAL_METRICS.write().record_timing(name, duration, tags);
}

/// Increments a counter with the global collector.
pub fn increment_counter(name: &str, value: u64, tags: Option<HashMap<String, String>>) {
    GLOBAL_METRICS.write().increment_counter(name, value, tags);
}

/// Decrements a gauge with the global collector.
pub fn decrement_gauge(name: &str, value: i64, tags: Option<HashMap<String, String>>) {
    GLOBAL_METRICS.write().decrement_gauge(name, value, tags);
}

/// Records a value in a histogram with the global collector.
pub fn record_histogram(name: &str, value: u64, tags: Option<HashMap<String, String>>) {
    GLOBAL_METRICS.write().record_histogram(name, value, tags);
}

/// Returns a snapshot of all metrics from the global collector.
pub fn snapshot() -> Vec<Metric> {
    GLOBAL_METRICS.read().snapshot()
}

/// Resets all metrics in the global collector.
pub fn reset() {
    GLOBAL_METRICS.write().reset();
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::time::Duration;
    
    #[test]
    fn test_counter() {
        let collector = MetricsCollector::new();
        collector.increment_counter("test.counter", 1, None);
        collector.increment_counter("test.counter", 2, None);
        
        let metrics = collector.snapshot();
        assert_eq!(metrics.len(), 1);
        
        if let MetricValue::Counter(value) = &metrics[0].value {
            assert_eq!(*value, 3);
        } else {
            panic!("Expected counter metric");
        }
    }
    
    #[test]
    fn test_timing() {
        let collector = MetricsCollector::new();
        
        // Record some timings
        collector.record_timing("test.timing", Duration::from_millis(100), None);
        collector.record_timing("test.timing", Duration::from_millis(200), None);
        
        let metrics = collector.snapshot();
        
        // Should have 2 metrics: _avg and _count
        assert_eq!(metrics.len(), 2);
        
        // Find the average timing
        let avg_metric = metrics.iter().find(|m| m.name == "test.timing_avg").unwrap();
        if let MetricValue::Timing(avg) = avg_metric.value {
            assert!(avg >= Duration::from_millis(150) && avg <= Duration::from_millis(150));
        } else {
            panic!("Expected timing metric");
        }
        
        // Find the count
        let count_metric = metrics.iter().find(|m| m.name == "test.timing_count").unwrap();
        if let MetricValue::Counter(count) = count_metric.value {
            assert_eq!(count, 2);
        } else {
            panic!("Expected counter metric");
        }
    }
    
    #[test]
    fn test_histogram() {
        let collector = MetricsCollector::new();
        
        // Record some values
        for i in 1..=100 {
            collector.record_histogram("test.histogram", i, None);
        }
        
        let metrics = collector.snapshot();
        
        // Should have 4 metrics: p50, p90, p99, and count
        assert_eq!(metrics.len(), 4);
        
        // Check percentiles
        let p50 = metrics.iter().find(|m| m.name == "test.histogram_p50").unwrap();
        let p90 = metrics.iter().find(|m| m.name == "test.histogram_p90").unwrap();
        let p99 = metrics.iter().find(|m| m.name == "test.histogram_p99").unwrap();
        
        if let MetricValue::Gauge(p50_val) = p50.value {
            assert!(p50_val >= 50 && p50_val <= 51);
        } else {
            panic!("Expected gauge metric for p50");
        }
        
        if let MetricValue::Gauge(p90_val) = p90.value {
            assert_eq!(p90_val, 90);
        } else {
            panic!("Expected gauge metric for p90");
        }
        
        if let MetricValue::Gauge(p99_val) = p99.value {
            assert_eq!(p99_val, 99);
        } else {
            panic!("Expected gauge metric for p99");
        }
    }
    
    #[test]
    fn test_timer() {
        let collector = MetricsCollector::new();
        
        {
            let _timer = Timer::new(&collector, "test.timer");
            // Simulate some work
            thread::sleep(Duration::from_millis(10));
        } // Timer drops here and records the duration
        
        let metrics = collector.snapshot();
        assert!(!metrics.is_empty());
    }
}

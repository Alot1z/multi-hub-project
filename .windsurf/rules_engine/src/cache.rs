//! High-performance, thread-safe caching system with TTL support.
//! 
//! This module provides a flexible caching system that can be used to cache
//! expensive computations or rule evaluations with time-based invalidation.

use std::collections::HashMap;
use std::hash::Hash;
use std::time::Duration;

use parking_lot::RwLock as ParkingRwLock;
use thiserror::Error;

/// Errors that can occur during cache operations.
#[derive(Error, Debug)]
pub enum CacheError {
    /// The requested key was not found in the cache
    #[error("Cache key not found")]
    KeyNotFound,
    
    /// The cache entry exists but has expired
    #[error("Cache entry has expired")]
    EntryExpired,
    
    /// An error occurred during serialization or deserialization
    #[error("Serialization error: {0}")]
    Serialization(String),
}

/// A cache entry that includes the value and its expiration time.
#[derive(Debug, Clone)]
struct CacheEntry<V> {
    value: V,
    expires_at: Option<std::time::Instant>,
}

// Manually implement serialization for CacheEntry
#[cfg(feature = "serde")]
impl<V: serde::Serialize> serde::Serialize for CacheEntry<V> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("CacheEntry", 2)?;
        state.serialize_field("value", &self.value)?;
        
        // Convert Instant to milliseconds since Unix epoch for serialization
        let expires_at = self.expires_at.map(|i| {
            i.duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64
        });
        state.serialize_field("expires_at", &expires_at)?;
        state.end()
    }
}

#[cfg(feature = "serde")]
impl<'de, V: serde::Deserialize<'de>> serde::Deserialize<'de> for CacheEntry<V> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(serde::Deserialize)]
        struct CacheEntryHelper<V> {
            value: V,
            expires_at: Option<u64>,
        }
        
        let helper = CacheEntryHelper::deserialize(deserializer)?;
        
        // Convert milliseconds since Unix epoch back to Instant
        let expires_at = helper.expires_at.map(|millis| {
            std::time::UNIX_EPOCH + std::time::Duration::from_millis(millis)
        });
        
        Ok(CacheEntry {
            value: helper.value,
            expires_at,
        })
    }
}

/// A thread-safe, high-performance cache with TTL support.
pub struct Cache<K, V> {
    store: ParkingRwLock<HashMap<K, CacheEntry<V>>>,
    ttl: Option<Duration>,
    max_entries: Option<usize>,
}

impl<K, V> Default for Cache<K, V>
where
    K: Eq + Hash + Clone + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    fn default() -> Self {
        Self::new(None, None)
    }
}

impl<K, V> Cache<K, V>
where
    K: Eq + Hash + Clone + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    /// Creates a new cache with the specified TTL and maximum entries.
    pub fn new(ttl: Option<Duration>, max_entries: Option<usize>) -> Self {
        Self {
            store: ParkingRwLock::new(HashMap::new()),
            ttl,
            max_entries,
        }
    }

    /// Inserts a key-value pair into the cache with the configured TTL.
    pub fn insert(&self, key: K, value: V) {
        self.insert_with_ttl(key, value, self.ttl)
    }

    /// Inserts a key-value pair into the cache with a custom TTL.
    pub fn insert_with_ttl(&self, key: K, value: V, ttl: Option<Duration>) {
        let expires_at = ttl.map(|duration| std::time::Instant::now() + duration);
        let entry = CacheEntry { value, expires_at };
        
        let mut store = self.store.write();
        
        // Evict oldest entry if we're at capacity
        if let Some(max) = self.max_entries {
            if store.len() >= max {
                let key_to_remove = store.keys().next().cloned();
                if let Some(key) = key_to_remove {
                    store.remove(&key);
                }
            }
        }
        
        store.insert(key, entry);
    }

    /// Retrieves a value from the cache if it exists and hasn't expired.
    pub fn get(&self, key: &K) -> Option<V> {
        let store = self.store.read();
        store.get(key).and_then(|entry| {
            if let Some(expiry) = entry.expires_at {
                if std::time::Instant::now() > expiry {
                    return None; // Entry has expired
                }
            }
            Some(entry.value.clone())
        })
    }

    /// Removes a key from the cache, returning the value if it existed.
    pub fn remove(&self, key: &K) -> Option<V> {
        self.store.write().remove(key).map(|entry| entry.value)
    }

    /// Clears all entries from the cache.
    pub fn clear(&self) {
        self.store.write().clear();
    }

    /// Returns the number of entries in the cache.
    pub fn len(&self) -> usize {
        self.store.read().len()
    }

    /// Returns true if the cache is empty.
    pub fn is_empty(&self) -> bool {
        self.store.read().is_empty()
    }

    /// Serializes the cache to a byte vector
    pub fn to_bytes(&self) -> Result<Vec<u8>, CacheError> {
        // Return an error since we're not implementing serialization right now
        Err(CacheError::Serialization("Serialization not implemented".to_string()))
    }

    /// Deserializes the cache from a byte vector
    pub fn from_bytes(_bytes: &[u8]) -> Result<Self, CacheError> {
        // Return an error since we're not implementing deserialization right now
        Err(CacheError::Serialization("Deserialization not implemented".to_string()))
    }
}

lazy_static::lazy_static! {
    /// Global thread-safe cache instance for rule evaluation with a default TTL of 1 hour and a maximum of 10,000 entries.
    /// 
    /// This cache is used by the rules engine to store and retrieve rule evaluation results.
    /// It is thread-safe and can be accessed from multiple threads concurrently.
    pub static ref GLOBAL_CACHE: Cache<String, String> = {
        // Initialize with a 1-hour TTL and a maximum of 10,000 entries by default
        Cache::new(Some(Duration::from_secs(3600)), Some(10_000))
    };
    
    /// Global thread-safe cache instance for rule evaluation with a default TTL of 5 minutes and a maximum of 1,000 entries.
    pub static ref RULE_CACHE: Cache<String, String> = {
        Cache::new(Some(Duration::from_secs(300)), Some(1000))
    };
}

/// Evaluates a rule with caching support.
pub async fn evaluate_cached_rule(rule_identifier: &str, evaluator: impl FnOnce() -> bool) -> bool {
    if let Some(cached_result) = GLOBAL_CACHE.get(&rule_identifier.to_string()) {
        // Convert the cached string back to bool
        return cached_result == "true";
    }
    
    let result = evaluator();
    // Store the bool result as a string
    RULE_CACHE.insert(rule_identifier.to_string(), result.to_string());
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::time::Duration;

    #[test]
    fn test_cache_insert_and_get() {
        let cache: Cache<String, String> = Cache::new(Some(Duration::from_secs(60)), Some(10));
        
        // Test basic insert and get
        cache.insert("key1".to_string(), "value1".to_string());
        assert_eq!(cache.get(&"key1".to_string()), Some("value1".to_string()));
        
        // Test non-existent key
        assert_eq!(cache.get(&"nonexistent".to_string()), None);
    }
    
    #[test]
    fn test_cache_ttl() {
        let cache: Cache<String, String> = Cache::new(Some(Duration::from_millis(100)), None);
        
        cache.insert("key1".to_string(), "value1".to_string());
        assert_eq!(cache.get(&"key1".to_string()), Some("value1".to_string()));
        
        // Wait for TTL to expire
        std::thread::sleep(Duration::from_millis(150));
        
        // Should be expired now
        assert_eq!(cache.get(&"key1".to_string()), None);
    }
    
    #[test]
    fn test_cache_max_entries() {
        let cache: Cache<usize, String> = Cache::new(None, Some(2));
        
        cache.insert(1, "one".to_string());
        cache.insert(2, "two".to_string());
        
        // Should be at capacity
        assert_eq!(cache.len(), 2);
        
        // Add one more, should evict the oldest (1)
        cache.insert(3, "three".to_string());
        
        assert_eq!(cache.len(), 2);
        assert_eq!(cache.get(&1), None);  // Should be evicted
        assert_eq!(cache.get(&2), Some("two".to_string()));
        assert_eq!(cache.get(&3), Some("three".to_string()));
    }
    
    #[tokio::test]
    async fn test_evaluate_cached_rule() {
        // Reset cache for test
        RULE_CACHE.clear();
        
        let mut call_count = 0;
        
        let evaluator = || {
            call_count += 1;
            true
        };
        
        // First call should evaluate
        let result = evaluate_cached_rule("test_rule", evaluator).await;
        assert!(result);
        assert_eq!(call_count, 1);
        
        // Second call should hit cache
        let result = evaluate_cached_rule("test_rule", || {
            call_count += 1;
            false
        }).await;
        
        assert!(result);  // Should still be true from cache
        assert_eq!(call_count, 1);  // Shouldn't have called the evaluator again
    }
}

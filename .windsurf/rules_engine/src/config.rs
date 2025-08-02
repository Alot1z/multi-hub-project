//! Configuration management for the Windsurf Rules Engine

use serde::{Deserialize, Serialize};
use std::path::Path;
use std::fs;

/// Main configuration structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Engine settings
    pub engine: EngineConfig,
    /// Memory settings
    pub memory: MemoryConfig,
    /// Performance settings
    pub performance: PerformanceConfig,
}

/// Engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineConfig {
    /// Enable/disable the engine
    pub enabled: bool,
    /// Maximum number of parallel tasks
    pub max_parallel_tasks: usize,
    /// Enable debug mode
    pub debug: bool,
}

/// Memory configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// Initial memory pool size in MB
    pub initial_pool_size_mb: usize,
    /// Maximum memory pool size in MB
    pub max_pool_size_mb: usize,
    /// Enable memory pooling
    pub enable_pooling: bool,
}

/// Performance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Enable SIMD optimizations
    pub enable_simd: bool,
    /// Enable parallel processing
    pub enable_parallel: bool,
    /// Batch size for processing
    pub batch_size: usize,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            engine: EngineConfig {
                enabled: true,
                max_parallel_tasks: num_cpus::get(),
                debug: false,
            },
            memory: MemoryConfig {
                initial_pool_size_mb: 512,
                max_pool_size_mb: 4096,
                enable_pooling: true,
            },
            performance: PerformanceConfig {
                enable_simd: true,
                enable_parallel: true,
                batch_size: 1024,
            },
        }
    }
}

impl Config {
    /// Load configuration from a file
    pub fn from_file<P: AsRef<Path>>(path: P) -> crate::Result<Self> {
        let content = fs::read_to_string(path)?;
        let config = serde_yaml::from_str(&content)
            .map_err(|e| crate::error::Error::Config(e.to_string()))?;
        Ok(config)
    }

    /// Save configuration to a file
    pub fn save_to_file<P: AsRef<Path>>(&self, path: P) -> crate::Result<()> {
        let content = serde_yaml::to_string(self)
            .map_err(|e| crate::error::Error::Config(e.to_string()))?;
        fs::write(path, content)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    #[test]
    fn test_config_serialization() {
        let config = Config::default();
        let serialized = serde_yaml::to_string(&config).unwrap();
        let deserialized: Config = serde_yaml::from_str(&serialized).unwrap();
        
        assert_eq!(config.engine.max_parallel_tasks, deserialized.engine.max_parallel_tasks);
        assert_eq!(config.memory.initial_pool_size_mb, deserialized.memory.initial_pool_size_mb);
        assert_eq!(config.performance.enable_simd, deserialized.performance.enable_simd);
    }

    #[test]
    fn test_config_file_io() {
        let config = Config::default();
        let file = NamedTempFile::new().unwrap();
        let path = file.path();
        
        // Test saving
        config.save_to_file(path).unwrap();
        
        // Test loading
        let loaded = Config::from_file(path).unwrap();
        
        assert_eq!(config.engine.max_parallel_tasks, loaded.engine.max_parallel_tasks);
    }
}

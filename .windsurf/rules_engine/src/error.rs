//! Error types for the Windsurf Rules Engine

use std::fmt;
use std::error::Error as StdError;
use thiserror::Error;

/// FFI error type (dummy implementation when cpp feature is disabled)
#[cfg(not(feature = "cpp"))]
#[derive(Debug)]
pub struct FfiError(String);

#[cfg(not(feature = "cpp"))]
impl fmt::Display for FfiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[cfg(not(feature = "cpp"))]
impl std::error::Error for FfiError {}

/// Main error type for the library
#[derive(Error, Debug)]
pub enum Error {
    /// FFI-related errors
    #[error("FFI error: {0}")]
    Ffi(FfiError),
    
    /// Configuration errors
    #[error("Configuration error: {0}")]
    Config(String),
    
    /// Serialization/deserialization errors
    #[error("Serialization error: {0}")]
    Serialization(#[source] Box<dyn StdError + Send + Sync + 'static>),
    
    /// I/O errors
    #[error("I/O error: {0}")]
    Io(#[source] std::io::Error),
    
    /// Custom error message
    #[error("{0}")]
    Custom(String),
    
    /// Executor queue is full
    #[error("Executor queue is full")]
    ExecutorFull,
}

impl From<String> for Error {
    fn from(err: String) -> Self {
        Error::Custom(err)
    }
}

impl From<&str> for Error {
    fn from(err: &str) -> Self {
        Error::Custom(err.to_string())
    }
}

#[cfg(not(feature = "cpp"))]
impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Io(err)
    }
}

impl From<Box<dyn StdError + Send + Sync + 'static>> for Error {
    fn from(err: Box<dyn StdError + Send + Sync + 'static>) -> Self {
        Error::Serialization(err)
    }
}

/// Type alias for Result<T, Error>
pub type Result<T> = std::result::Result<T, Error>;

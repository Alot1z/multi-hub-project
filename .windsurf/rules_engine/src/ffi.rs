//! FFI bindings to C++ core functionality

use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_void};
use std::ptr;
use std::slice;

use thiserror::Error;

/// Error type for FFI operations
#[derive(Error, Debug)]
pub enum FfiError {
    #[error("Null pointer encountered")]
    NullPointer,
    #[error("FFI operation failed with code: {0}")]
    OperationFailed(i32),
    #[error("UTF-8 conversion error: {0}")]
    Utf8Error(#[from] std::str::Utf8Error),
    #[error("Nul byte error: {0}")]
    NulError(#[from] std::ffi::NulError),
}

type Result<T> = std::result::Result<T, FfiError>;

// External C++ functions
extern "C" {
    fn engine_create() -> *mut c_void;
    fn engine_destroy(engine: *mut c_void);
    fn engine_process(
        engine: *mut c_void,
        input: *const c_char,
        input_len: usize,
        output: *mut *mut c_char,
        output_len: *mut usize,
    ) -> i32;
    fn memory_alloc(size: usize) -> *mut c_void;
    fn memory_free(ptr: *mut c_void);
    fn simd_process_f32(input: *const f32, output: *mut f32, count: usize);
    fn simd_process_f64(input: *const f64, output: *mut f64, count: usize);
}

/// Safe wrapper around the C++ Engine
pub struct Engine {
    ptr: *mut c_void,
}

impl Engine {
    /// Create a new Engine instance
    pub fn new() -> Result<Self> {
        let ptr = unsafe { engine_create() };
        if ptr.is_null() {
            return Err(FfiError::OperationFailed(-1));
        }
        Ok(Engine { ptr })
    }

    /// Process input and return the result
    pub fn process(&self, input: &str) -> Result<String> {
        let input_cstr = CString::new(input)?;
        let input_ptr = input_cstr.as_ptr() as *const c_char;
        let input_len = input.len();
        
        let mut output_ptr: *mut c_char = ptr::null_mut();
        let mut output_len: usize = 0;
        
        let result = unsafe {
            engine_process(
                self.ptr,
                input_ptr,
                input_len,
                &mut output_ptr,
                &mut output_len,
            )
        };

        if result != 0 {
            return Err(FfiError::OperationFailed(result));
        }

        if output_ptr.is_null() {
            return Err(FfiError::NullPointer);
        }

        // Convert the output to a Rust String
        let output_slice = unsafe { slice::from_raw_parts(output_ptr as *const u8, output_len) };
        let output_str = std::str::from_utf8(output_slice)?;
        let output_string = output_str.to_string();

        // Free the C-allocated memory
        unsafe {
            memory_free(output_ptr as *mut c_void);
        }

        Ok(output_string)
    }

    /// Process f32 array with SIMD acceleration
    pub fn process_f32(&self, input: &[f32]) -> Vec<f32> {
        let mut output = vec![0.0f32; input.len()];
        unsafe {
            simd_process_f32(input.as_ptr(), output.as_mut_ptr(), input.len());
        }
        output
    }

    /// Process f64 array with SIMD acceleration
    pub fn process_f64(&self, input: &[f64]) -> Vec<f64> {
        let mut output = vec![0.0f64; input.len()];
        unsafe {
            simd_process_f64(input.as_ptr(), output.as_mut_ptr(), input.len());
        }
        output
    }
}

impl Drop for Engine {
    fn drop(&mut self) {
        if !self.ptr.is_null() {
            unsafe {
                engine_destroy(self.ptr);
            }
            self.ptr = ptr::null_mut();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_engine_creation() {
        let engine = Engine::new();
        assert!(engine.is_ok());
    }

    #[test]
    fn test_engine_process() {
        let engine = Engine::new().unwrap();
        let result = engine.process("test");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Processed: test");
    }

    #[test]
    fn test_simd_f32() {
        let engine = Engine::new().unwrap();
        let input = [1.0f32, 2.0, 3.0, 4.0];
        let output = engine.process_f32(&input);
        assert_eq!(output, [2.0f32, 4.0, 6.0, 8.0]);
    }

    #[test]
    fn test_simd_f64() {
        let engine = Engine::new().unwrap();
        let input = [1.0f64, 2.0, 3.0, 4.0];
        let output = engine.process_f64(&input);
        assert_eq!(output, [2.0f64, 4.0, 6.0, 8.0]);
    }
}

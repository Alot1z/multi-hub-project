//! Memory management utilities

mod pool;
mod alloc;

pub use pool::MemoryPool;
pub use alloc::CacheAligned;

/// Aligns the given size to the cache line size (64 bytes)
pub const fn align_to_cache_line(size: usize) -> usize {
    const CACHE_LINE_SIZE: usize = 64;
    (size + CACHE_LINE_SIZE - 1) & !(CACHE_LINE_SIZE - 1)
}

/// Returns the cache line size of the current CPU
pub fn cache_line_size() -> usize {
    #[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
    {
        64 // x86/x86_64 typically uses 64-byte cache lines
    }
    #[cfg(target_arch = "aarch64")]
    {
        64 // Most ARM64 implementations use 64-byte cache lines
    }
    #[cfg(not(any(
        target_arch = "x86",
        target_arch = "x86_64",
        target_arch = "aarch64"
    )))] // Fixed: Removed extra closing parenthesis
    {
        64 // Reasonable default for other architectures
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_align_to_cache_line() {
        assert_eq!(align_to_cache_line(0), 0);
        assert_eq!(align_to_cache_line(1), 64);
        assert_eq!(align_to_cache_line(63), 64);
        assert_eq!(align_to_cache_line(64), 64);
        assert_eq!(align_to_cache_line(65), 128);
    }
}

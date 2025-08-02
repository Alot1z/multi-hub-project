//! Cache-aligned memory allocation utilities

use std::alloc::{GlobalAlloc, Layout, System};

/// Cache line size in bytes (typically 64 bytes on x86-64)
pub const CACHE_LINE_SIZE: usize = 64;

/// A wrapper type that ensures the contained value is cache-line aligned
#[repr(align(64))]
pub struct CacheAligned<T>(pub T);

impl<T> CacheAligned<T> {
    /// Creates a new cache-aligned value
    pub fn new(value: T) -> Self {
        CacheAligned(value)
    }
    
    /// Consumes the wrapper, returning the underlying value
    pub fn into_inner(self) -> T {
        self.0
    }
}

impl<T> std::ops::Deref for CacheAligned<T> {
    type Target = T;
    
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T> std::ops::DerefMut for CacheAligned<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

/// A custom allocator that ensures all allocations are cache-line aligned
pub struct CacheAlignedAllocator;

unsafe impl GlobalAlloc for CacheAlignedAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        // Always align to cache line size
        let layout = Layout::from_size_align(
            layout.size(),
            layout.align().max(CACHE_LINE_SIZE)
        ).unwrap_or_else(|_| std::alloc::handle_alloc_error(layout));
        
        System.alloc(layout)
    }
    
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        let layout = Layout::from_size_align_unchecked(
            layout.size(),
            layout.align().max(CACHE_LINE_SIZE)
        );
        
        System.dealloc(ptr, layout);
    }
}

/// Allocates a new cache-aligned buffer of the given size
pub fn allocate_aligned_buffer(size: usize) -> *mut u8 {
    let layout = Layout::from_size_align(size, CACHE_LINE_SIZE)
        .expect("Failed to create layout");
    
    unsafe {
        let ptr = std::alloc::alloc_zeroed(layout);
        if ptr.is_null() {
            std::alloc::handle_alloc_error(layout);
        }
        ptr
    }
}

/// Frees a cache-aligned buffer
pub unsafe fn free_aligned_buffer(ptr: *mut u8, size: usize) {
    if !ptr.is_null() {
        let layout = Layout::from_size_align_unchecked(size, CACHE_LINE_SIZE);
        std::alloc::dealloc(ptr, layout);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cache_aligned() {
        let aligned = CacheAligned::new([0u8; 128]);
        let addr = &aligned.0 as *const _ as usize;
        
        assert_eq!(addr % CACHE_LINE_SIZE, 0, "Address should be cache-line aligned");
    }
    
    #[test]
    fn test_aligned_allocation() {
        let size = 1024;
        let ptr = allocate_aligned_buffer(size);
        
        // Check alignment
        assert_eq!((ptr as usize) % CACHE_LINE_SIZE, 0, "Allocation should be cache-line aligned");
        
        // Write some data
        for i in 0..size {
            unsafe { ptr.add(i).write(i as u8) };
        }
        
        // Verify data
        for i in 0..size {
            assert_eq!(unsafe { ptr.add(i).read() }, (i % 256) as u8);
        }
        
        // Clean up
        unsafe { free_aligned_buffer(ptr, size) };
    }
}

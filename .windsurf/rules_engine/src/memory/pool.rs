//! Memory pool implementation for efficient memory allocation

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

use super::CacheAligned;

/// A memory pool for efficient allocation of fixed-size blocks
pub struct MemoryPool {
    blocks: Vec<CacheAligned<[u8; 4096]>>,
    current: Arc<AtomicUsize>,
    size: usize,
}

impl MemoryPool {
    /// Creates a new memory pool with the specified number of blocks
    pub fn new(size: usize) -> Self {
        let size = size.next_power_of_two();
        let mut blocks = Vec::with_capacity(size);
        
        // Pre-allocate all blocks
        for _ in 0..size {
            blocks.push(CacheAligned([0u8; 4096]));
        }
        
        Self {
            blocks,
            current: Arc::new(AtomicUsize::new(0)),
            size,
        }
    }
    
    /// Gets a block from the pool
    #[inline]
    pub fn get_block(&self) -> &'static mut [u8; 4096] {
        let idx = self.current.fetch_add(1, Ordering::Relaxed) % self.size;
        
        // Safety: We know the index is within bounds and the memory is valid
        unsafe {
            let ptr = self.blocks[idx].0.as_ptr() as *mut _;
            &mut *ptr
        }
    }
    
    /// Gets the current number of allocated blocks
    pub fn allocated_blocks(&self) -> usize {
        self.current.load(Ordering::Relaxed)
    }
    
    /// Gets the total capacity of the pool in blocks
    pub fn capacity(&self) -> usize {
        self.size
    }
}

impl Default for MemoryPool {
    fn default() -> Self {
        // Default to 1024 blocks (4MB total)
        Self::new(1024)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_memory_pool() {
        let pool = MemoryPool::new(4);
        assert_eq!(pool.capacity(), 4);
        
        // Allocate all blocks
        let block1 = pool.get_block();
        let block2 = pool.get_block();
        let block3 = pool.get_block();
        let block4 = pool.get_block();
        
        // Should wrap around
        let block5 = pool.get_block();
        
        // Verify all blocks are unique
        let ptr1 = block1.as_ptr() as usize;
        let ptr2 = block2.as_ptr() as usize;
        let ptr3 = block3.as_ptr() as usize;
        let ptr4 = block4.as_ptr() as usize;
        let ptr5 = block5.as_ptr() as usize;
        
        let mut pointers = vec![ptr1, ptr2, ptr3, ptr4];
        pointers.sort_unstable();
        pointers.dedup();
        assert_eq!(pointers.len(), 4, "All blocks should be unique");
        
        // Verify wrap-around
        assert_eq!(ptr5, ptr1, "Should wrap around to first block");
    }
}

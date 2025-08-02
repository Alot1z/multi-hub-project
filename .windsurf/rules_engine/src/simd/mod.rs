//! SIMD-accelerated operations for high-performance rule evaluation.
//!
//! This module provides SIMD-optimized implementations of common operations
//! used in rule evaluation, such as vectorized comparisons and mathematical
//! operations.


#![cfg_attr(
    any(
        target_arch = "x86",
        target_arch = "x86_64",
        target_arch = "aarch64",
        target_arch = "wasm32"
    ),
    feature(stdsimd, portable_simd)
)]

use std::simd::{Simd, SimdFloat, SimdInt, SimdUint};
use std::marker::PhantomData;

/// Trait for types that can be used in SIMD operations
pub trait SimdElement: Copy + Send + Sync + 'static {
    /// The SIMD vector type for this element type
    type Simd: SimdFloat + SimdInt + SimdUint;
    
    /// The number of lanes in the SIMD vector
    const LANES: usize;
    
    /// The scalar type of the SIMD vector
    type Scalar;
}

// Implement SimdElement for common numeric types
impl SimdElement for f32 {
    type Simd = std::simd::f32x16;
    const LANES: usize = 16;
    type Scalar = f32;
}

impl SimdElement for f64 {
    type Simd = std::simd::f64x8;
    const LANES: usize = 8;
    type Scalar = f64;
}

impl SimdElement for i32 {
    type Simd = std::simd::i32x16;
    const LANES: usize = 16;
    type Scalar = i32;
}

impl SimdElement for u32 {
    type Simd = std::simd::u32x16;
    const LANES: usize = 16;
    type Scalar = u32;
}

/// A SIMD-accelerated vector of values that can be processed in parallel.
pub struct SimdVector<T: SimdElement> {
    data: Vec<T::Scalar>,
    _marker: PhantomData<T>,
}

impl<T: SimdElement> SimdVector<T> {
    /// Creates a new SIMD vector from a slice of scalars.
    pub fn new(data: &[T::Scalar]) -> Self {
        Self {
            data: data.to_vec(),
            _marker: PhantomData,
        }
    }

    /// Applies a function element-wise to the vector using SIMD acceleration.
    pub fn map<F>(&self, f: F) -> Vec<T::Scalar>
    where
        F: Fn(T::Simd) -> T::Simd,
    {
        let chunks = self.data.chunks_exact(T::LANES);
        let remainder = chunks.remainder();
        
        let mut result = Vec::with_capacity(self.data.len());
        
        // Process full SIMD chunks
        for chunk in chunks {
            // SAFETY: We know the chunk has exactly LANES elements
            let simd_chunk = unsafe { T::Simd::from_slice_aligned_unchecked(chunk) };
            let simd_result = f(simd_chunk);
            
            // Convert back to scalar
            let mut chunk_result = vec![T::Scalar::default(); T::LANES];
            simd_result.copy_to_slice(&mut chunk_result);
            result.extend(chunk_result);
        }
        
        // Process remaining elements with scalar fallback
        for &x in remainder {
            // For simplicity, just apply f to each element individually
            // In a real implementation, you might want to handle this differently
            let scalar_result = unsafe {
                let simd = T::Simd::splat(x);
                let result = f(simd);
                result.extract(0)
            };
            result.push(scalar_result);
        }
        
        result
    }
    
    /// Reduces the vector to a single value using SIMD operations.
    pub fn reduce<F>(&self, identity: T::Scalar, f: F) -> T::Scalar
    where
        F: Fn(T::Simd, T::Simd) -> T::Simd,
    {
        let chunks = self.data.chunks_exact(T::LANES);
        let remainder = chunks.remainder();
        
        // Start with the identity element
        let mut acc = T::Simd::splat(identity);
        
        // Process full SIMD chunks
        for chunk in chunks {
            let simd_chunk = unsafe { T::Simd::from_slice_aligned_unchecked(chunk) };
            acc = f(acc, simd_chunk);
        }
        
        // Horizontal reduction
        let mut result = identity;
        for i in 0..T::LANES {
            result = result + unsafe { acc.extract(i) };
        }
        
        // Process remaining elements
        for &x in remainder {
            result = result + x;
        }
        
        result
    }
}

/// SIMD-accelerated mathematical operations.
pub mod math {
    use super::*;
    
    /// Element-wise addition of two slices using SIMD.
    pub fn add<T: SimdElement>(
        a: &[T::Scalar],
        b: &[T::Scalar],
    ) -> Vec<T::Scalar> 
    where
        T::Scalar: std::ops::Add<Output = T::Scalar>,
    {
        assert_eq!(a.len(), b.len(), "Input slices must have the same length");
        
        let a_simd = SimdVector::<T>::new(a);
        a_simd.map(|x, y| x + y)
    }
    
    /// Element-wise multiplication of two slices using SIMD.
    pub fn mul<T: SimdElement>(
        a: &[T::Scalar],
        b: &[T::Scalar],
    ) -> Vec<T::Scalar>
    where
        T::Scalar: std::ops::Mul<Output = T::Scalar>,
    {
        assert_eq!(a.len(), b.len(), "Input slices must have the same length");
        
        let a_simd = SimdVector::<T>::new(a);
        a_simd.map(|x, y| x * y)
    }
    
    /// Sum of all elements in the slice using SIMD.
    pub fn sum<T: SimdElement>(data: &[T::Scalar]) -> T::Scalar
    where
        T::Scalar: std::ops::Add<Output = T::Scalar> + Default,
    {
        let vec = SimdVector::<T>::new(data);
        vec.reduce(T::Scalar::default(), |acc, x| acc + x)
    }
}

/// SIMD-accelerated comparison operations.
pub mod compare {
    use super::*;
    
    /// Element-wise equality comparison using SIMD.
    pub fn eq<T: SimdElement>(
        a: &[T::Scalar],
        b: &[T::Scalar],
    ) -> Vec<bool>
    where
        T::Scalar: PartialEq + Default,
    {
        assert_eq!(a.len(), b.len(), "Input slices must have the same length");
        
        let a_simd = SimdVector::<T>::new(a);
        a_simd.map_with(b, |x, y| x == y)
    }
    
    /// Element-wise greater than comparison using SIMD.
    pub fn gt<T: SimdElement>(
        a: &[T::Scalar],
        b: &[T::Scalar],
    ) -> Vec<bool>
    where
        T::Scalar: PartialOrd + Default,
    {
        assert_eq!(a.len(), b.len(), "Input slices must have the same length");
        
        let a_simd = SimdVector::<T>::new(a);
        a_simd.map_with(b, |x, y| x > y)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_simd_vector_map() {
        let data = vec![1.0f32, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
        let vec = SimdVector::<f32>::new(&data);
        
        let result = vec.map(|x| x * Simd::splat(2.0));
        
        let expected: Vec<f32> = data.iter().map(|&x| x * 2.0).collect();
        assert_eq!(result, expected);
    }
    
    #[test]
    fn test_simd_vector_reduce() {
        let data = vec![1.0f32, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
        let vec = SimdVector::<f32>::new(&data);
        
        let result = vec.reduce(0.0, |acc, x| acc + x);
        
        let expected: f32 = data.iter().sum();
        assert_eq!(result, expected);
    }
    
    #[test]
    fn test_math_add() {
        let a = vec![1.0f32, 2.0, 3.0, 4.0];
        let b = vec![5.0f32, 6.0, 7.0, 8.0];
        
        let result = math::add::<f32>(&a, &b);
        let expected: Vec<f32> = a.iter().zip(b.iter()).map(|(&x, &y)| x + y).collect();
        
        assert_eq!(result, expected);
    }
    
    #[test]
    fn test_math_sum() {
        let data = vec![1.0f32, 2.0, 3.0, 4.0];
        let result = math::sum::<f32>(&data);
        let expected: f32 = data.iter().sum();
        
        assert_eq!(result, expected);
    }
    
    #[test]
    fn test_compare_eq() {
        let a = vec![1.0f32, 2.0, 3.0, 4.0];
        let b = vec![1.0f32, 5.0, 3.0, 6.0];
        
        let result = compare::eq::<f32>(&a, &b);
        let expected: Vec<bool> = a.iter().zip(b.iter()).map(|(&x, &y)| x == y).collect();
        
        assert_eq!(result, expected);
    }
}

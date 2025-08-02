#pragma once

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#define WIN_EXPORT __declspec(dllexport)
#else
#define WIN_EXPORT __attribute__((visibility("default")))
#endif

#include <cstdint>
#include <cstddef>

#ifdef __cplusplus
extern "C" {
#endif

// Core engine functions
WIN_EXPORT void* engine_create();
WIN_EXPORT void engine_destroy(void* engine);
WIN_EXPORT int engine_process(void* engine, const char* input, size_t input_len, char** output, size_t* output_len);

// Memory management
WIN_EXPORT void* memory_alloc(size_t size);
WIN_EXPORT void memory_free(void* ptr);

// SIMD-accelerated operations
WIN_EXPORT void simd_process_f32(float* input, float* output, size_t count);
WIN_EXPORT void simd_process_f64(double* input, double* output, size_t count);

#ifdef __cplusplus
} // extern "C"
#endif

---
id: "05-numba-jit"
title: "Numba JIT Compilation"
concepts:
  - jit-compilation
  - nopython-mode
  - parallel-loops
  - numba-types
why: "Numba compiles Python functions to machine code at runtime -- giving you C-level speed without leaving Python, especially for numerical loops that can't be easily vectorized."
prerequisites:
  - 04-numpy-performance
sources:
  - repo: "numba/numba"
    section: "User Guide"
    license: "BSD-2-Clause"
  - repo: "cupy/cupy"
    section: "Interoperability"
    license: "MIT"
---

# Numba JIT Compilation

Sometimes NumPy vectorization isn't enough. When you have complex loops that can't be expressed as array operations, Numba's JIT (Just-In-Time) compiler transforms your Python code into fast machine code. The `@jit` decorator is all it takes.

## What is JIT Compilation?

Regular Python is interpreted line by line. JIT compilation analyzes your function the first time it runs, compiles it to optimized machine code, and uses that compiled version for all subsequent calls.

```python
# Simulating the concept of JIT compilation
import time

def slow_function(n):
    """Pure Python -- interpreted line by line."""
    total = 0
    for i in range(n):
        total += i * i
    return total

# In real Numba:
# from numba import jit
#
# @jit(nopython=True)
# def fast_function(n):
#     total = 0
#     for i in range(n):
#         total += i * i
#     return total
#
# # First call: compile (slow)
# # Subsequent calls: use compiled code (fast)

start = time.time()
result = slow_function(10000000)
elapsed = time.time() - start
print(f"Python loop: {elapsed:.3f}s, result={result}")
```

## The @jit Decorator

```python
# How Numba is used in real code:
# from numba import jit, prange
#
# @jit(nopython=True)
# def compute_mandelbrot(xmin, xmax, ymin, ymax, width, height, max_iter):
#     result = np.zeros((height, width))
#     for i in range(height):
#         for j in range(width):
#             x = xmin + j * (xmax - xmin) / width
#             y = ymin + i * (ymax - ymin) / height
#             c = complex(x, y)
#             z = 0j
#             for k in range(max_iter):
#                 z = z * z + c
#                 if abs(z) > 2:
#                     result[i, j] = k
#                     break
#     return result

# For learning, we'll simulate the performance characteristics:
def simulate_jit_effect(func, n, warmup=True):
    """Show how JIT affects execution time."""
    if warmup:
        print("First call (compilation):", end=" ")
        start = time.time()
        func(n // 100)  # Smaller run for "compilation"
        compile_time = time.time() - start
        print(f"{compile_time:.4f}s")

    print("Subsequent call (compiled):", end=" ")
    start = time.time()
    result = func(n)
    run_time = time.time() - start
    print(f"{run_time:.4f}s")
    return result
```

## nopython Mode

The `nopython=True` flag (or `@njit`) tells Numba to compile everything to machine code with no Python fallback. If Numba can't compile a part, it raises an error instead of silently falling back to slow Python:

```python
# @jit(nopython=True) -- will error if it can't fully compile
# @njit -- shorthand for nopython=True

# WORKS in nopython mode:
# - Numeric operations (int, float, complex)
# - NumPy arrays and most NumPy functions
# - Standard math operations
# - Simple control flow (if, for, while)
# - Tuples (fixed-type)

# DOESN'T WORK in nopython mode:
# - Dictionaries (use numba.typed.Dict)
# - Lists of mixed types
# - String operations
# - Most Python standard library
# - Custom classes (use @jitclass)

# Example of what works:
def mandelbrot_point(c, max_iter):
    """Compute Mandelbrot iteration count for a single point."""
    z = 0j
    for i in range(max_iter):
        z = z * z + c
        if abs(z) > 2:
            return i
    return max_iter

# Test it
result = mandelbrot_point(complex(-0.5, 0.5), 100)
print(f"Iterations for (-0.5+0.5j): {result}")
result = mandelbrot_point(complex(0, 0), 100)
print(f"Iterations for (0+0j): {result}")
```

## Parallel Loops with prange

Numba can automatically parallelize loops using `prange`:

```python
# from numba import jit, prange
#
# @jit(nopython=True, parallel=True)
# def parallel_sum(arr):
#     total = 0.0
#     for i in prange(len(arr)):  # prange instead of range
#         total += arr[i] * arr[i]
#     return total

# Simulating the concept:
def sequential_sum(arr):
    """Sequential version -- processes elements one by one."""
    total = 0.0
    for x in arr:
        total += x * x
    return total

# With prange, Numba splits the loop across CPU cores
# On a 4-core machine, a loop of 1M iterations becomes
# 4 loops of 250K iterations running simultaneously

import time
data = list(range(1000000))

start = time.time()
result = sequential_sum(data)
elapsed = time.time() - start
print(f"Sequential: {elapsed:.3f}s (result: {result:.0f})")
```

## Type Specialization

Numba generates specialized code for the types it encounters:

```python
# Numba infers types from the first call:
# @jit(nopython=True)
# def add(a, b):
#     return a + b
#
# add(1, 2)      # Compiles for (int64, int64)
# add(1.0, 2.0)  # Compiles again for (float64, float64)
# add(1, 2.0)    # Compiles again for (int64, float64)

# You can also specify types explicitly:
# @jit(int64(int64, int64), nopython=True)
# def add_ints(a, b):
#     return a + b

# Simulating type specialization
def type_info(func_name, *args):
    types = tuple(type(a).__name__ for a in args)
    print(f"{func_name}({', '.join(types)}) -> compiled")

type_info("add", 1, 2)
type_info("add", 1.0, 2.0)
type_info("add", 1, 2.0)
```

## When to Use Numba

```python
# USE Numba when:
# 1. You have numeric loops that can't be vectorized with NumPy
# 2. You need element-wise operations on arrays
# 3. You need to parallelize independent iterations
# 4. Performance matters and you want to stay in Python

# DON'T USE Numba when:
# 1. NumPy vectorization works fine
# 2. You need complex Python objects (dicts, custom classes)
# 3. Your code is I/O-bound (file reading, network, etc.)
# 4. First-call compilation time is unacceptable

# Performance hierarchy (fastest to slowest):
# 1. CUDA/GPU (for massive parallelism)
# 2. Numba @njit with parallel=True
# 3. Numba @njit
# 4. NumPy vectorized
# 5. Pure Python loops

hierarchy = [
    ("CUDA/GPU", "1000x"),
    ("Numba parallel", "100-200x"),
    ("Numba JIT", "50-100x"),
    ("NumPy vectorized", "10-50x"),
    ("Pure Python", "1x (baseline)"),
]
print("Performance hierarchy:")
for method, speedup in hierarchy:
    print(f"  {method:20s} {speedup}")
```

## Common Mistakes

**Expecting instant speedup**: The first call to a JIT-compiled function includes compilation time. Benchmark subsequent calls.

**Using unsupported types**: Numba's nopython mode doesn't support dictionaries, sets, or most Python objects. Use NumPy arrays.

**JIT-compiling I/O-bound code**: Numba speeds up computation, not I/O. If your bottleneck is file reading or network, Numba won't help.

## Key Takeaways

- Numba's `@jit(nopython=True)` compiles Python to machine code at runtime
- First call includes compilation time; subsequent calls use cached compiled code
- `prange` parallelizes loops across CPU cores automatically
- nopython mode requires numeric types, NumPy arrays, and simple control flow
- Use Numba for loops that can't be vectorized with NumPy
- Performance hierarchy: CUDA > Numba parallel > Numba > NumPy > Python

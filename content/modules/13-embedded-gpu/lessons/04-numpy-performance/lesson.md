---
id: "04-numpy-performance"
title: "High-Performance NumPy"
concepts:
  - vectorization
  - broadcasting
  - memory-layout
  - numpy-optimization
why: "NumPy is the foundation of scientific Python -- understanding vectorization, broadcasting, and memory layout can make your code 100x faster than pure Python loops."
prerequisites:
  - 03-iot-networking
sources:
  - repo: "numpy/numpy"
    section: "User Guide"
    license: "BSD-3-Clause"
  - repo: "cupy/cupy"
    section: "NumPy Compatibility"
    license: "MIT"
---

# High-Performance NumPy

NumPy's power comes from operating on entire arrays at once instead of looping through elements one by one. This lesson covers the techniques that unlock NumPy's full performance: vectorization, broadcasting, and memory-aware programming.

## Vectorization: Arrays, Not Loops

The most important NumPy optimization is replacing Python loops with array operations:

```python
import numpy as np
import time

# SLOW: Python loop
def sum_squares_loop(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

# FAST: NumPy vectorized
def sum_squares_numpy(n):
    arr = np.arange(n)
    return np.sum(arr * arr)

n = 1000000

start = time.time()
result_loop = sum_squares_loop(n)
loop_time = time.time() - start

start = time.time()
result_numpy = sum_squares_numpy(n)
numpy_time = time.time() - start

print(f"Loop:  {loop_time:.4f}s (result: {result_loop})")
print(f"NumPy: {numpy_time:.4f}s (result: {result_numpy})")
print(f"Speedup: {loop_time/numpy_time:.1f}x")
```

Typical output: NumPy is 50-100x faster than pure Python loops for large arrays.

## Broadcasting

Broadcasting lets NumPy perform operations between arrays of different shapes without copying data:

```python
import numpy as np

# Scalar broadcast: multiply every element
a = np.array([1, 2, 3, 4])
print(a * 10)  # [10, 20, 30, 40]

# 1D + 2D broadcasting
row = np.array([1, 2, 3])
matrix = np.array([[10, 20, 30],
                   [40, 50, 60]])
print(matrix + row)
# [[11, 22, 33],
#  [41, 52, 63]]

# Column broadcast
col = np.array([[100], [200]])
print(matrix + col)
# [[110, 120, 130],
#  [240, 250, 260]]
```

Broadcasting rules:
1. Arrays are compared from their trailing dimensions
2. Dimensions are compatible if they are equal or one of them is 1
3. The smaller array is "stretched" to match the larger one

```python
# Distance matrix using broadcasting (no loops!)
points = np.array([[0, 0], [1, 1], [2, 0], [3, 3]])
# Shape: (4, 2)

# Reshape for broadcasting: (4, 1, 2) - (1, 4, 2) = (4, 4, 2)
diff = points[:, np.newaxis, :] - points[np.newaxis, :, :]
distances = np.sqrt(np.sum(diff ** 2, axis=2))
print("Distance matrix:")
print(np.round(distances, 2))
```

## Memory Layout: C vs Fortran Order

NumPy arrays can be stored row-major (C order) or column-major (Fortran order). Accessing data along the memory layout is faster:

```python
import numpy as np

# C order (row-major): rows are contiguous
c_array = np.zeros((1000, 1000), order='C')

# Fortran order (column-major): columns are contiguous
f_array = np.zeros((1000, 1000), order='F')

# Row access is fast for C order, column access for F order
print(f"C order, row contiguous: {c_array.flags['C_CONTIGUOUS']}")
print(f"F order, col contiguous: {f_array.flags['F_CONTIGUOUS']}")
```

## In-Place Operations

In-place operations avoid creating temporary arrays, saving memory:

```python
import numpy as np

a = np.ones(1000000)

# BAD: Creates a temporary array
# b = a * 2 + 1  # allocates new arrays for (a*2) and (+1)

# GOOD: In-place operations
a *= 2     # Modifies a directly
a += 1     # No temporary array

# np.add, np.multiply with 'out' parameter
x = np.ones(1000000)
result = np.empty_like(x)
np.multiply(x, 2, out=result)  # Write directly to result
np.add(result, 1, out=result)  # Reuse result buffer
print(f"Result: {result[:5]}")  # [3. 3. 3. 3. 3.]
```

## Avoiding Copies

Understanding when NumPy copies data vs creating views is critical for performance:

```python
import numpy as np

a = np.arange(12).reshape(3, 4)

# Views (no copy, share memory)
b = a[1:3]        # Slicing creates a view
c = a.reshape(4, 3)  # Reshape creates a view (usually)
d = a.T            # Transpose creates a view

# Copies (new memory allocation)
e = a.copy()       # Explicit copy
f = a[[0, 2]]     # Fancy indexing creates a copy
g = a[a > 5]      # Boolean indexing creates a copy

print(f"b shares memory with a: {np.shares_memory(a, b)}")  # True
print(f"e shares memory with a: {np.shares_memory(a, e)}")  # False
print(f"f shares memory with a: {np.shares_memory(a, f)}")  # False
```

## Structured Arrays

For tabular data with mixed types, structured arrays are more memory-efficient than lists of dicts:

```python
import numpy as np

# Define a structured dtype
dt = np.dtype([("name", "U10"), ("age", "i4"), ("score", "f8")])
students = np.array([
    ("Alice", 20, 92.5),
    ("Bob", 21, 88.0),
    ("Carol", 19, 95.5),
], dtype=dt)

# Access by field name
print(f"Names: {students['name']}")
print(f"Mean score: {students['score'].mean():.1f}")

# Boolean indexing
top_students = students[students["score"] > 90]
print(f"Top students: {top_students['name']}")
```

## Common Mistakes

**Using Python loops over arrays**: Always look for a vectorized NumPy function first. Element-wise loops throw away NumPy's speed advantage.

**Ignoring dtypes**: Using float64 when float32 would suffice wastes memory and bandwidth. Choose the smallest dtype that fits.

**Unnecessary copies**: Slicing returns a view (fast), but fancy indexing returns a copy (slow). Be aware of which operations copy.

## Key Takeaways

- Vectorization replaces Python loops with array operations for 50-100x speedup
- Broadcasting lets different-shaped arrays interact without explicit loops
- C-order (row-major) arrays access rows fast; F-order access columns fast
- In-place operations (`*=`, `+=`, `out=`) avoid temporary array allocations
- Slicing creates views (shared memory); fancy indexing creates copies
- Choose the smallest dtype that fits your data to save memory and bandwidth

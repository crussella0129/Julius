---
id: "01-numpy-fundamentals"
title: "NumPy Fundamentals"
concepts:
  - ndarray
  - array-operations
  - broadcasting
  - indexing-slicing
why: "NumPy is the foundation of Python's scientific computing stack -- every data science and ML library builds on its fast array operations."
prerequisites:
  - 08-deployment
sources:
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Introduction to NumPy"
    license: "MIT"
---

# NumPy Fundamentals

NumPy (Numerical Python) provides the `ndarray` -- a fast, memory-efficient multidimensional array. Operations on NumPy arrays are typically 10-100x faster than equivalent Python loops because they run in optimized C code.

## Creating Arrays

```python
import numpy as np

# From a list
a = np.array([1, 2, 3, 4, 5])
print(a)  # [1 2 3 4 5]

# Zeros and ones
zeros = np.zeros(5)        # [0. 0. 0. 0. 0.]
ones = np.ones((2, 3))     # 2x3 matrix of ones

# Ranges
r = np.arange(0, 10, 2)    # [0 2 4 6 8]
lin = np.linspace(0, 1, 5) # [0.   0.25 0.5  0.75 1.  ]

# Random
rng = np.random.default_rng(42)
rand = rng.random(5)       # 5 random floats [0, 1)
```

## Array Properties

```python
a = np.array([[1, 2, 3], [4, 5, 6]])

print(a.shape)   # (2, 3) -- 2 rows, 3 columns
print(a.ndim)    # 2 -- number of dimensions
print(a.size)    # 6 -- total elements
print(a.dtype)   # int64 -- data type
```

## Vectorized Operations

NumPy operations apply to every element without explicit loops:

```python
a = np.array([1, 2, 3, 4])
b = np.array([10, 20, 30, 40])

print(a + b)   # [11 22 33 44]
print(a * b)   # [10 40 90 160]
print(a ** 2)  # [1 4 9 16]
print(np.sqrt(a))  # [1. 1.414 1.732 2.]
```

This is called **vectorization** -- it replaces slow Python loops with fast C operations.

## Broadcasting

When arrays have different shapes, NumPy "broadcasts" the smaller one:

```python
a = np.array([[1, 2, 3],
              [4, 5, 6]])  # shape (2, 3)

# Scalar broadcast
print(a + 10)   # [[11 12 13] [14 15 16]]

# 1D array broadcast across rows
row = np.array([100, 200, 300])  # shape (3,)
print(a + row)  # [[101 202 303] [104 205 306]]
```

Broadcasting rules: dimensions are compared from right to left. They are compatible if they are equal or one of them is 1.

## Indexing and Slicing

NumPy supports Python-style indexing plus multi-dimensional access:

```python
a = np.array([10, 20, 30, 40, 50])

print(a[0])      # 10
print(a[-1])     # 50
print(a[1:4])    # [20 30 40]

# 2D indexing
m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(m[0, 1])   # 2 (row 0, column 1)
print(m[:, 0])   # [1 4 7] (all rows, column 0)
print(m[1, :])   # [4 5 6] (row 1, all columns)
```

## Boolean Indexing

Filter arrays with conditions:

```python
a = np.array([15, 22, 8, 33, 11, 45])

mask = a > 20
print(mask)      # [False True False True False True]
print(a[mask])   # [22 33 45]

# Combine conditions
print(a[(a > 10) & (a < 35)])  # [15 22 33 11]
```

## Aggregation Functions

```python
a = np.array([4, 7, 2, 9, 1])

print(np.sum(a))    # 23
print(np.mean(a))   # 4.6
print(np.std(a))    # 2.87
print(np.min(a))    # 1
print(np.max(a))    # 9
print(np.argmax(a)) # 3 (index of max value)
```

For 2D arrays, specify `axis`:

```python
m = np.array([[1, 2], [3, 4]])
print(np.sum(m, axis=0))  # [4 6] -- sum each column
print(np.sum(m, axis=1))  # [3 7] -- sum each row
```

## Reshaping

```python
a = np.arange(12)
m = a.reshape(3, 4)   # 3 rows, 4 columns
print(m)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]

flat = m.flatten()     # Back to 1D
```

## Key Takeaways

- NumPy arrays are faster than Python lists for numerical computation
- Vectorized operations replace explicit loops
- Broadcasting lets you combine arrays of different shapes
- Boolean indexing filters arrays by conditions
- Aggregation functions summarize data along any axis

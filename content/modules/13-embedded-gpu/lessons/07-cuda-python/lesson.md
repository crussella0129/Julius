---
id: "07-cuda-python"
title: "CUDA Python Custom Kernels"
concepts:
  - cuda-kernels
  - thread-blocks
  - grid-stride-loops
  - kernel-optimization
why: "Custom CUDA kernels let you write GPU programs that go beyond what CuPy provides -- when you need maximum performance or custom parallel algorithms, kernel programming is the answer."
prerequisites:
  - 06-cupy-gpu
sources:
  - repo: "cupy/cupy"
    section: "User-Defined Kernels"
    license: "MIT"
  - repo: "numba/numba"
    section: "CUDA Python"
    license: "BSD-2-Clause"
---

# CUDA Python Custom Kernels

While CuPy handles most GPU computations with its NumPy-like API, sometimes you need custom GPU programs (kernels) for maximum performance or specialized algorithms. CUDA kernels run thousands of threads in parallel, each processing a portion of the data.

## GPU Execution Model

A GPU organizes work into a hierarchy:

```python
# GPU execution hierarchy:
# Grid -> Blocks -> Threads
#
# Grid:    The entire computation
# Block:   A group of threads that can cooperate (share memory)
# Thread:  A single execution unit
#
# Example: Processing 1,000,000 elements
# - 3906 blocks of 256 threads each
# - Each thread processes one element

class CUDAGrid:
    """Simulate the CUDA grid/block/thread hierarchy."""

    def __init__(self, total_elements, threads_per_block=256):
        self.total = total_elements
        self.tpb = threads_per_block
        self.blocks = (total_elements + threads_per_block - 1) // threads_per_block

    def info(self):
        print(f"Elements: {self.total:,}")
        print(f"Threads per block: {self.tpb}")
        print(f"Blocks: {self.blocks:,}")
        print(f"Total threads: {self.blocks * self.tpb:,}")

grid = CUDAGrid(1000000)
grid.info()
```

Output:
```
Elements: 1,000,000
Threads per block: 256
Blocks: 3,907
Total threads: 1,000,192
```

## Writing a CUDA Kernel with CuPy

CuPy lets you write CUDA kernels as strings:

```python
# import cupy as cp
#
# # Element-wise kernel: each thread processes one element
# add_kernel = cp.ElementwiseKernel(
#     'float32 x, float32 y',    # input types
#     'float32 z',                # output type
#     'z = x + y',                # operation
#     'add_kernel'                # kernel name
# )
#
# a = cp.array([1, 2, 3, 4], dtype=cp.float32)
# b = cp.array([10, 20, 30, 40], dtype=cp.float32)
# c = add_kernel(a, b)
# print(c)  # [11, 22, 33, 44]

# Simulating the concept with NumPy:
import numpy as np

def simulate_elementwise_kernel(operation, *arrays):
    """Simulate an element-wise GPU kernel."""
    result = np.empty_like(arrays[0])
    n = len(arrays[0])

    # Each "thread" processes one element
    for thread_id in range(n):
        # In real CUDA, thousands of these run simultaneously
        x = arrays[0][thread_id]
        y = arrays[1][thread_id] if len(arrays) > 1 else 0
        if operation == "add":
            result[thread_id] = x + y
        elif operation == "square":
            result[thread_id] = x * x

    return result

a = np.array([1, 2, 3, 4], dtype=np.float32)
b = np.array([10, 20, 30, 40], dtype=np.float32)
c = simulate_elementwise_kernel("add", a, b)
print(f"Result: {c}")
```

## Raw CUDA Kernels

For more control, write raw CUDA C kernels:

```python
# import cupy as cp
#
# raw_kernel = cp.RawKernel(r'''
# extern "C" __global__
# void vector_add(const float* a, const float* b, float* c, int n) {
#     int tid = blockDim.x * blockIdx.x + threadIdx.x;
#     if (tid < n) {
#         c[tid] = a[tid] + b[tid];
#     }
# }
# ''', 'vector_add')
#
# n = 1000
# a = cp.random.randn(n, dtype=cp.float32)
# b = cp.random.randn(n, dtype=cp.float32)
# c = cp.empty(n, dtype=cp.float32)
#
# threads_per_block = 256
# blocks = (n + threads_per_block - 1) // threads_per_block
# raw_kernel((blocks,), (threads_per_block,), (a, b, c, n))

# Understanding thread indexing:
def simulate_thread_indexing(n, threads_per_block=4):
    """Show how CUDA threads are indexed."""
    blocks = (n + threads_per_block - 1) // threads_per_block

    print(f"Grid: {blocks} blocks x {threads_per_block} threads")
    print()

    for block_id in range(blocks):
        for thread_id in range(threads_per_block):
            global_id = block_id * threads_per_block + thread_id
            if global_id < n:
                print(f"  Block {block_id}, Thread {thread_id} "
                      f"-> Global ID {global_id} -> data[{global_id}]")

simulate_thread_indexing(10, threads_per_block=4)
```

## Grid-Stride Loops

For processing more elements than threads, use grid-stride loops:

```python
def simulate_grid_stride(data, num_threads=4):
    """Simulate a grid-stride loop pattern.

    Each thread processes multiple elements by striding through the array.
    """
    n = len(data)
    result = [0] * n

    print(f"Data size: {n}, Threads: {num_threads}")
    for tid in range(num_threads):
        # Grid-stride: start at tid, step by num_threads
        idx = tid
        while idx < n:
            result[idx] = data[idx] * data[idx]
            print(f"  Thread {tid}: data[{idx}] = {data[idx]} -> {result[idx]}")
            idx += num_threads

    return result

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
result = simulate_grid_stride(data, num_threads=4)
print(f"Squared: {result}")
```

## Reduction Kernels

Reductions (sum, max, min) require thread cooperation:

```python
import numpy as np

def parallel_reduction_sum(data, block_size=4):
    """Simulate a parallel reduction sum.

    Each step, half the threads add pairs of values.
    """
    n = len(data)
    work = list(data)
    step = 0

    print(f"Input: {work}")

    stride = 1
    while stride < n:
        new_work = list(work)
        for i in range(0, n, stride * 2):
            if i + stride < n:
                new_work[i] = work[i] + work[i + stride]
        work = new_work
        step += 1
        print(f"Step {step}: {work}")
        stride *= 2

    print(f"Sum: {work[0]}")
    return work[0]

parallel_reduction_sum([1, 2, 3, 4, 5, 6, 7, 8])
```

## Kernel Optimization Tips

```python
# 1. Choose the right threads-per-block (usually 128, 256, or 512)
def optimal_block_size(n, warp_size=32):
    """Calculate a good block size for a given problem."""
    # Threads per block should be a multiple of warp size (32)
    candidates = [128, 256, 512]
    for tpb in candidates:
        blocks = (n + tpb - 1) // tpb
        occupancy = n / (blocks * tpb) * 100
        print(f"  TPB={tpb}: {blocks} blocks, {occupancy:.1f}% occupancy")

print("Block size analysis for N=10000:")
optimal_block_size(10000)

# 2. Minimize divergent branches (all threads in a warp should follow same path)
# 3. Coalesce memory accesses (adjacent threads access adjacent memory)
# 4. Use shared memory for data reused within a block
# 5. Minimize CPU-GPU synchronization
```

## When to Write Custom Kernels

```python
decision_tree = {
    "NumPy function exists in CuPy": "Use CuPy directly",
    "Custom element-wise operation": "Use cp.ElementwiseKernel",
    "Custom reduction (sum/max/min)": "Use cp.ReductionKernel",
    "Complex algorithm with shared memory": "Use cp.RawKernel",
    "Need Numba-style Python syntax": "Use numba.cuda.jit",
}

print("When to use what:")
for scenario, solution in decision_tree.items():
    print(f"  {scenario}")
    print(f"    -> {solution}")
```

## Common Mistakes

**Too few threads**: GPUs need thousands of threads to hide memory latency. Don't launch kernels with only a few threads.

**Ignoring warp divergence**: Threads in the same warp (32 threads) should follow the same execution path. Branching within a warp serializes execution.

**Forgetting bounds checking**: Always check `if (tid < n)` in kernels. The grid may have more threads than data elements.

## Key Takeaways

- CUDA organizes computation into grids of blocks of threads
- Thread ID = blockIdx * blockDim + threadIdx
- CuPy provides ElementwiseKernel, ReductionKernel, and RawKernel
- Grid-stride loops let a fixed number of threads process any amount of data
- Threads per block should be a multiple of 32 (warp size)
- Always bounds-check thread IDs: `if (tid < n)`
- Custom kernels are for when CuPy's built-in functions aren't enough

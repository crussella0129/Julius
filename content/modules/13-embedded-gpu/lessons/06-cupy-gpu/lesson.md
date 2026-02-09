---
id: "06-cupy-gpu"
title: "CuPy GPU Computing"
concepts:
  - gpu-arrays
  - cupy-api
  - host-device-transfer
  - gpu-acceleration
why: "CuPy provides a NumPy-compatible API that runs on NVIDIA GPUs -- you can accelerate your existing NumPy code by simply replacing 'numpy' with 'cupy' for 10-1000x speedups on large arrays."
prerequisites:
  - 05-numba-jit
sources:
  - repo: "cupy/cupy"
    section: "User Guide"
    license: "MIT"
  - repo: "numpy/numpy"
    section: "NumPy API Reference"
    license: "BSD-3-Clause"
---

# CuPy GPU Computing

CuPy is a GPU-accelerated array library that mirrors NumPy's API. If you know NumPy, you already know CuPy -- just change `import numpy as np` to `import cupy as cp` and your code runs on the GPU. The GPU's massive parallelism makes CuPy 10-1000x faster than NumPy for large arrays.

## CPU vs GPU Architecture

```python
# CPUs: Few powerful cores (4-16), good at sequential tasks
# GPUs: Thousands of simple cores (1000-16000), good at parallel tasks

# Analogy:
# CPU = A few brilliant mathematicians doing complex problems
# GPU = An army of calculators doing simple math in parallel

architecture = {
    "CPU (i7)": {"cores": 8, "clock_ghz": 4.5, "best_for": "sequential, branching"},
    "GPU (RTX 4090)": {"cores": 16384, "clock_ghz": 2.5, "best_for": "parallel, uniform"},
    "GPU (Jetson Orin)": {"cores": 2048, "clock_ghz": 1.3, "best_for": "edge AI, embedded"},
}

for name, specs in architecture.items():
    print(f"{name}: {specs['cores']} cores @ {specs['clock_ghz']} GHz ({specs['best_for']})")
```

## CuPy Basics

```python
# CuPy mirrors NumPy's API exactly:
# import cupy as cp
#
# # Create arrays on GPU
# a = cp.array([1, 2, 3, 4, 5])
# b = cp.ones((3, 3))
# c = cp.random.randn(1000, 1000)
#
# # Operations run on GPU automatically
# result = cp.dot(c, c.T)
# mean = cp.mean(result)
# print(f"Mean: {mean}")  # Still a CuPy scalar

# For learning, we'll simulate the concept:
import numpy as np

class SimGPUArray:
    """Simulate a GPU array to understand the concept."""

    def __init__(self, data, device="gpu"):
        self.data = np.array(data)
        self.device = device
        self.shape = self.data.shape

    def __repr__(self):
        return f"GPUArray({self.data}, device='{self.device}')"

    def to_cpu(self):
        """Transfer data from GPU to CPU (cupy.asnumpy equivalent)."""
        print(f"Transfer: GPU -> CPU ({self.data.nbytes} bytes)")
        return self.data.copy()

    @staticmethod
    def from_numpy(arr):
        """Transfer data from CPU to GPU (cupy.asarray equivalent)."""
        print(f"Transfer: CPU -> GPU ({arr.nbytes} bytes)")
        return SimGPUArray(arr)

# Simulate GPU workflow
cpu_data = np.random.randn(1000)
gpu_data = SimGPUArray.from_numpy(cpu_data)
print(f"Array on: {gpu_data.device}, shape: {gpu_data.shape}")
result_cpu = gpu_data.to_cpu()
print(f"Result shape: {result_cpu.shape}")
```

## Host-Device Transfer

The biggest performance pitfall in GPU computing is unnecessary data transfer between CPU (host) and GPU (device):

```python
import numpy as np

def simulate_transfer_cost(data_size_mb):
    """Show the cost of data transfer vs computation."""
    # PCIe 4.0: ~25 GB/s transfer speed
    # GPU compute: ~30 TFLOPS

    transfer_time = data_size_mb / 25000  # seconds
    compute_time = data_size_mb * 1e6 / 30e12  # very rough

    ratio = transfer_time / compute_time if compute_time > 0 else float('inf')
    print(f"Data: {data_size_mb} MB")
    print(f"  Transfer: {transfer_time*1000:.3f} ms")
    print(f"  Compute:  {compute_time*1000:.6f} ms")
    print(f"  Transfer is {ratio:.0f}x slower than compute")

simulate_transfer_cost(1)
simulate_transfer_cost(100)
simulate_transfer_cost(1000)
```

Rules for minimizing transfer overhead:
1. Move data to GPU once, do all computation there
2. Only move results back to CPU when you need to display or save them
3. Use larger batches to amortize transfer costs

## CuPy Operations

```python
# All NumPy operations have CuPy equivalents:
# cp.sum(), cp.mean(), cp.std()
# cp.dot(), cp.matmul()
# cp.fft.fft(), cp.fft.ifft()
# cp.linalg.solve(), cp.linalg.eig()
# cp.sort(), cp.argsort()
# cp.where(), cp.clip()

# Example: Matrix multiplication benchmark
import numpy as np
import time

def benchmark_matmul(n):
    """Benchmark matrix multiplication (simulated)."""
    a = np.random.randn(n, n).astype(np.float32)
    b = np.random.randn(n, n).astype(np.float32)

    start = time.time()
    c = np.dot(a, b)
    cpu_time = time.time() - start

    # GPU would be: cp.dot(cp.array(a), cp.array(b))
    # Typical GPU speedup for large matrices: 10-100x
    estimated_gpu = cpu_time / 50  # Conservative estimate

    print(f"  {n}x{n}: CPU={cpu_time:.4f}s, GPU~{estimated_gpu:.4f}s")

print("Matrix multiplication benchmark:")
for n in [100, 500, 1000]:
    benchmark_matmul(n)
```

## Memory Management

GPUs have limited memory. Monitor and manage it carefully:

```python
# CuPy memory management:
# mempool = cp.get_default_memory_pool()
# print(f"Used: {mempool.used_bytes() / 1e6:.1f} MB")
# print(f"Total: {mempool.total_bytes() / 1e6:.1f} MB")
# mempool.free_all_blocks()  # Release unused memory

class GPUMemorySimulator:
    """Simulate GPU memory management."""

    def __init__(self, total_mb):
        self.total = total_mb * 1024 * 1024
        self.used = 0
        self.allocations = {}

    def allocate(self, name, shape, dtype_bytes=4):
        """Allocate GPU memory for an array."""
        import math
        size = math.prod(shape) * dtype_bytes
        if self.used + size > self.total:
            raise MemoryError(f"GPU OOM: need {size/1e6:.1f} MB, "
                            f"have {(self.total-self.used)/1e6:.1f} MB free")
        self.used += size
        self.allocations[name] = size
        print(f"Allocated '{name}': {size/1e6:.1f} MB "
              f"({self.used/self.total*100:.1f}% used)")

    def free(self, name):
        if name in self.allocations:
            self.used -= self.allocations.pop(name)
            print(f"Freed '{name}' ({self.used/self.total*100:.1f}% used)")

# 8 GB GPU
gpu = GPUMemorySimulator(8192)
gpu.allocate("model_weights", (1000000, 512))
gpu.allocate("input_batch", (64, 3, 224, 224))
gpu.allocate("gradients", (1000000, 512))
```

## Converting Between CuPy and NumPy

```python
import numpy as np

# In real code:
# import cupy as cp
#
# # NumPy -> CuPy (CPU to GPU)
# np_array = np.array([1, 2, 3])
# cp_array = cp.asarray(np_array)
#
# # CuPy -> NumPy (GPU to CPU)
# result_np = cp.asnumpy(cp_array)
# # or: result_np = cp_array.get()
#
# # Works with any NumPy-compatible code:
# def my_function(xp, data):
#     """xp can be numpy or cupy."""
#     return xp.sum(data ** 2)
#
# result_cpu = my_function(np, np_array)
# result_gpu = my_function(cp, cp_array)

# The xp pattern: write once, run on CPU or GPU
def compute(xp, data):
    """Array library agnostic computation."""
    squared = xp.sum(data ** 2)
    mean = xp.mean(data)
    return squared, mean

data = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
sq, mn = compute(np, data)
print(f"Sum of squares: {sq}, Mean: {mn}")
```

## Common Mistakes

**Transferring data back and forth**: Every CPU-GPU transfer is expensive. Keep data on the GPU as long as possible.

**Small arrays on GPU**: GPU overhead makes small arrays slower on GPU than CPU. Use GPU for arrays larger than ~10,000 elements.

**Running out of GPU memory**: GPU memory is limited (4-24 GB typically). Monitor usage and free unused arrays.

## Key Takeaways

- CuPy mirrors NumPy's API: change `numpy` to `cupy` for GPU acceleration
- GPUs excel at parallel computation on large, uniform data
- Minimize CPU-GPU data transfers -- they're the biggest bottleneck
- Use `cp.asarray()` to move to GPU, `cp.asnumpy()` to move back to CPU
- The xp pattern (`def f(xp, data)`) lets code run on either CPU or GPU
- GPU memory is limited; monitor and free unused allocations

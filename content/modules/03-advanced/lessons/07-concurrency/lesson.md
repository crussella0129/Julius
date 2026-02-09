---
id: "07-concurrency"
title: "Concurrency in Python"
concepts:
  - threading-module
  - asyncio-basics
  - multiprocessing-module
  - global-interpreter-lock
  - concurrent-futures
why: "Concurrency lets your programs do multiple things at once -- essential for responsive applications, network services, and taking full advantage of modern multi-core hardware."
prerequisites:
  - 06-design-patterns
sources:
  - repo: "cosmicpython/book"
    section: "Concurrency Patterns"
    license: "CC BY-NC-ND"
  - repo: "dabeaz-course/python-mastery"
    section: "Concurrency"
    license: "CC BY-SA 4.0"
---

# Concurrency in Python

**Concurrency** means dealing with multiple things at once. Python offers three main approaches: **threading** (for I/O-bound tasks), **asyncio** (for cooperative I/O), and **multiprocessing** (for CPU-bound tasks).

## The Global Interpreter Lock (GIL)

Python's GIL allows only one thread to execute Python bytecode at a time. This means:

- **Threading** does NOT speed up CPU-bound work (math, data processing)
- **Threading** DOES help with I/O-bound work (network requests, file I/O) because threads release the GIL while waiting
- For true parallelism on CPU-bound tasks, use **multiprocessing**

```python
# This is I/O-bound: threading helps
# Waiting for network responses, file reads, etc.

# This is CPU-bound: threading does NOT help
# Crunching numbers, image processing, etc.
```

## Threading Basics

Threads run concurrently within the same process and share memory:

```python
import threading
import time

def worker(name, delay):
    print(f"{name} starting")
    time.sleep(delay)  # Simulates I/O
    print(f"{name} done")

t1 = threading.Thread(target=worker, args=("Task-A", 2))
t2 = threading.Thread(target=worker, args=("Task-B", 1))

t1.start()
t2.start()

t1.join()  # Wait for t1 to finish
t2.join()  # Wait for t2 to finish
print("All done")
```

Without threading, this would take 3 seconds. With threading, both tasks overlap, finishing in about 2 seconds.

## Thread Safety with Locks

When threads share data, you need locks to prevent race conditions:

```python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1

t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start()
t2.start()
t1.join()
t2.join()
print(counter)  # 200000 (correct, thanks to the lock)
```

Without the lock, the final count would be unpredictable because both threads could read and write `counter` simultaneously.

## `concurrent.futures`: High-Level Threading

The `concurrent.futures` module provides a clean interface for running tasks in parallel:

```python
from concurrent.futures import ThreadPoolExecutor
import time

def fetch_url(url):
    time.sleep(1)  # Simulates network I/O
    return f"Data from {url}"

urls = ["site-a.com", "site-b.com", "site-c.com"]

with ThreadPoolExecutor(max_workers=3) as executor:
    results = executor.map(fetch_url, urls)

for result in results:
    print(result)
# All three "fetches" complete in ~1 second instead of ~3
```

`ThreadPoolExecutor` manages a pool of threads for you. Use `executor.map()` for simple cases or `executor.submit()` for more control.

## Asyncio: Cooperative Concurrency

`asyncio` uses a single thread with an event loop. Functions voluntarily yield control with `await`:

```python
import asyncio

async def fetch_data(name, delay):
    print(f"{name}: starting")
    await asyncio.sleep(delay)  # Non-blocking sleep
    print(f"{name}: done")
    return f"{name} result"

async def main():
    results = await asyncio.gather(
        fetch_data("A", 2),
        fetch_data("B", 1),
        fetch_data("C", 1.5),
    )
    for r in results:
        print(r)

asyncio.run(main())
```

Key concepts:
- `async def` defines a coroutine
- `await` pauses the coroutine and lets others run
- `asyncio.gather()` runs multiple coroutines concurrently
- `asyncio.run()` starts the event loop

## Multiprocessing: True Parallelism

`multiprocessing` runs code in separate processes, each with its own Python interpreter and GIL:

```python
from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(4) as pool:
        results = pool.map(square, range(10))
    print(results)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

Use multiprocessing for CPU-intensive tasks like data processing, image manipulation, or scientific computation.

## `ProcessPoolExecutor`

The `concurrent.futures` module also offers a process-based executor with the same interface:

```python
from concurrent.futures import ProcessPoolExecutor

def heavy_computation(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(heavy_computation, [10**6] * 4))
    print(len(results))  # 4
```

Swap `ThreadPoolExecutor` for `ProcessPoolExecutor` when your task is CPU-bound -- the API is identical.

## Choosing the Right Approach

| Task Type | Best Approach | Why |
|-----------|--------------|-----|
| Network I/O | asyncio or threading | Waiting for responses, GIL released |
| File I/O | threading | GIL released during I/O |
| CPU-bound | multiprocessing | Bypasses the GIL entirely |
| Simple parallel I/O | ThreadPoolExecutor | Clean API, automatic pooling |

## Common Mistakes

**Using threads for CPU-bound work:**
```python
# This will NOT be faster with threading due to the GIL
# Use multiprocessing instead for CPU-bound tasks
```

**Forgetting `if __name__ == "__main__":` with multiprocessing:**
```python
# On some platforms, multiprocessing spawns new Python processes
# that re-import your module. Without the guard, it recurses forever.
```

**Mixing `await` with blocking calls:**
```python
async def bad():
    time.sleep(5)  # BLOCKS the entire event loop!
    # Use: await asyncio.sleep(5)
```

## Key Takeaways

- The GIL means threads cannot run CPU-bound Python code in parallel
- Use **threading** for I/O-bound tasks (network, files, database)
- Use **asyncio** for high-concurrency I/O with cooperative scheduling
- Use **multiprocessing** for CPU-bound tasks that need true parallelism
- `concurrent.futures` provides a unified API for both thread and process pools
- Always protect shared mutable state with locks when using threads
- Always use `if __name__ == "__main__":` with multiprocessing

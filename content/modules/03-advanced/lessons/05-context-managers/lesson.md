---
id: "05-context-managers"
title: "Advanced Context Managers"
concepts:
  - with-statement
  - enter-exit-methods
  - contextlib-contextmanager
  - resource-management
why: "Context managers guarantee that resources like files, connections, and locks are properly cleaned up, even when errors occur -- preventing leaks and subtle bugs."
prerequisites:
  - 04-generators
sources:
  - repo: "dabeaz-course/python-mastery"
    section: "Context Managers"
    license: "CC BY-SA 4.0"
---

# Advanced Context Managers

A **context manager** is an object that defines setup and teardown actions for a `with` block. You have already used one: `open()` for files. Now you will learn how they work and how to write your own.

## The `with` Statement

The `with` statement guarantees cleanup code runs, even if an exception occurs:

```python
# Without context manager (risky)
f = open("data.txt", "w")
f.write("hello")
# If an error happens here, f.close() is never called!
f.close()

# With context manager (safe)
with open("data.txt", "w") as f:
    f.write("hello")
# f.close() is called automatically, even if write() raises an error
```

## The Protocol: `__enter__` and `__exit__`

Any object with `__enter__` and `__exit__` methods can be used as a context manager:

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        print("Timer started")
        return self  # This becomes the 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        elapsed = time.time() - self.start
        print(f"Timer stopped: {elapsed:.4f}s")
        return False  # Don't suppress exceptions

with Timer() as t:
    total = sum(range(1_000_000))
# Timer started
# Timer stopped: 0.0312s
```

- `__enter__` runs when entering the `with` block. Its return value is bound to the `as` variable.
- `__exit__` runs when leaving the `with` block, whether normally or via an exception.

## Understanding `__exit__` Parameters

`__exit__` receives information about any exception that occurred:

```python
class SafeBlock:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"Caught: {exc_type.__name__}: {exc_val}")
            return True  # Suppress the exception
        print("No errors")
        return False

with SafeBlock():
    print("Working...")
    # raise ValueError("oops")  # Uncomment to test exception handling
```

- `exc_type`: The exception class (or `None` if no exception)
- `exc_val`: The exception instance
- `exc_tb`: The traceback
- Return `True` to suppress the exception, `False` to let it propagate

## Using `contextlib.contextmanager`

Writing a class with `__enter__` and `__exit__` can be verbose. The `contextlib` module lets you write context managers as generator functions:

```python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    print("Timer started")
    yield  # Control passes to the with block here
    elapsed = time.time() - start
    print(f"Timer stopped: {elapsed:.4f}s")

with timer():
    total = sum(range(1_000_000))
```

Everything before `yield` is `__enter__`. Everything after `yield` is `__exit__`. The yielded value becomes the `as` variable.

## Yielding a Value

```python
from contextlib import contextmanager

@contextmanager
def temp_list():
    data = []
    print("List created")
    yield data        # 'data' is the 'as' variable
    print(f"Cleaning up {len(data)} items")
    data.clear()

with temp_list() as items:
    items.append("hello")
    items.append("world")
    print(items)
# List created
# ['hello', 'world']
# Cleaning up 2 items
```

## Handling Exceptions in `contextlib`

Wrap the `yield` in a `try`/`finally` to ensure cleanup even on errors:

```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    print("Acquiring resource")
    resource = {"active": True}
    try:
        yield resource
    finally:
        resource["active"] = False
        print("Resource released")

with managed_resource() as r:
    print(r)  # {'active': True}
    # Even if an exception occurs here, 'finally' still runs
# Resource released
```

## Nesting Context Managers

You can nest `with` statements or combine them:

```python
with open("input.txt") as fin, open("output.txt", "w") as fout:
    for line in fin:
        fout.write(line.upper())
```

## Real-World Uses

- **File handling**: `open()` closes the file automatically
- **Database connections**: commit or rollback transactions
- **Locks**: `threading.Lock()` acquires and releases
- **Temporary changes**: change directory, modify settings, then restore

## Common Mistakes

**Forgetting to `yield` in a `@contextmanager`:**
```python
@contextmanager
def broken():
    print("Setup")
    # Forgot yield! This will raise a RuntimeError
    print("Teardown")
```

**Not using `try`/`finally` for cleanup:**
```python
@contextmanager
def risky():
    resource = acquire()
    yield resource
    release(resource)  # Skipped if an exception occurs!

# Fix:
@contextmanager
def safe():
    resource = acquire()
    try:
        yield resource
    finally:
        release(resource)  # Always runs
```

## Key Takeaways

- `with` guarantees cleanup code runs, even during exceptions
- Implement `__enter__` and `__exit__` to make any class a context manager
- `__exit__` returns `True` to suppress exceptions, `False` to propagate
- `@contextmanager` from `contextlib` is a simpler way to write context managers
- Code before `yield` is setup; code after `yield` is teardown
- Always use `try`/`finally` in `@contextmanager` functions for safe cleanup

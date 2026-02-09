---
id: "04-generators"
title: "Generators and Iterators"
concepts:
  - yield-keyword
  - generator-expressions
  - itertools-module
  - lazy-evaluation
  - next-function
why: "Generators let you produce values one at a time instead of all at once, making it possible to work with huge or infinite sequences without running out of memory."
prerequisites:
  - 03-decorators
sources:
  - repo: "dabeaz-course/python-mastery"
    section: "Generators"
    license: "CC BY-SA 4.0"
---

# Generators and Iterators

A **generator** is a special kind of function that produces a sequence of values lazily -- one at a time, on demand -- instead of computing them all at once and storing them in a list.

## The Iterator Protocol

Any object that implements `__iter__()` and `__next__()` is an iterator. Python's `for` loop uses this protocol behind the scenes:

```python
nums = [1, 2, 3]
it = iter(nums)       # Get an iterator
print(next(it))       # 1
print(next(it))       # 2
print(next(it))       # 3
# next(it)            # StopIteration
```

## Generator Functions with `yield`

A function with `yield` becomes a generator. Each call to `next()` runs the function until the next `yield`:

```python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

gen = count_up_to(3)
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
```

When the function returns (or falls off the end), `StopIteration` is raised automatically. You can loop over a generator directly:

```python
for num in count_up_to(5):
    print(num, end=" ")
# 1 2 3 4 5
```

## How Generators Save Memory

Compare a list vs. a generator for a million numbers:

```python
# List: stores ALL numbers in memory at once
big_list = [x * x for x in range(1_000_000)]  # ~8 MB

# Generator: produces numbers one at a time
big_gen = (x * x for x in range(1_000_000))    # ~100 bytes
```

The generator uses almost no memory regardless of how many values it can produce.

## Generator Expressions

Just like list comprehensions, but with parentheses:

```python
squares_list = [x**2 for x in range(5)]   # [0, 1, 4, 9, 16]
squares_gen  = (x**2 for x in range(5))   # <generator object>

print(sum(squares_gen))  # 30  (consumed lazily)
```

You can pass a generator expression directly to functions:

```python
total = sum(x**2 for x in range(100))  # No extra brackets needed
```

## The `yield` Pause-and-Resume

The key insight: `yield` pauses the function, saves its state, and resumes from exactly where it left off:

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(8):
    print(next(fib), end=" ")
# 0 1 1 2 3 5 8 13
```

This generator is infinite! It never runs out because it only computes the next value when asked.

## Using `itertools`

The `itertools` module provides powerful tools for working with iterators:

```python
import itertools

# Count from 10 forever
for i in itertools.count(10):
    if i > 13:
        break
    print(i, end=" ")  # 10 11 12 13

# Repeat a value
list(itertools.repeat("hello", 3))  # ['hello', 'hello', 'hello']

# Chain multiple iterables together
list(itertools.chain([1, 2], [3, 4], [5]))  # [1, 2, 3, 4, 5]

# Take first N items from any iterable
list(itertools.islice(fibonacci(), 6))  # [0, 1, 1, 2, 3, 5]
```

## Generators as Pipelines

You can chain generators to process data in stages:

```python
def read_lines(lines):
    for line in lines:
        yield line.strip()

def filter_nonempty(lines):
    for line in lines:
        if line:
            yield line

def to_upper(lines):
    for line in lines:
        yield line.upper()

data = ["  hello  ", "", "  world  ", "", "  python  "]
pipeline = to_upper(filter_nonempty(read_lines(data)))

for line in pipeline:
    print(line)
# HELLO
# WORLD
# PYTHON
```

Each stage processes one item at a time. No intermediate lists are created.

## Common Mistakes

**Trying to reuse a generator:**
```python
gen = (x for x in range(3))
print(list(gen))  # [0, 1, 2]
print(list(gen))  # []  -- already exhausted!
```

**Forgetting that generators are lazy:**
```python
def debug_gen():
    print("Starting")  # Only prints when you first call next()
    yield 1
    print("Middle")
    yield 2

gen = debug_gen()  # Nothing printed yet!
next(gen)          # "Starting" printed, returns 1
```

## Key Takeaways

- `yield` turns a function into a generator that produces values lazily
- Generators use almost no memory regardless of sequence length
- Generator expressions use `()` instead of `[]`
- `next()` advances a generator; `StopIteration` signals the end
- Generators can only be consumed once -- they are single-pass
- `itertools` provides powerful tools for composing and transforming iterators
- Chain generators together to build memory-efficient data pipelines

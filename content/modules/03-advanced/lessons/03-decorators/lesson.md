---
id: "03-decorators"
title: "Decorators"
concepts:
  - closures
  - decorator-syntax
  - functools-wraps
  - decorators-with-arguments
why: "Decorators let you modify or extend function behavior without changing the function itself, enabling clean separation of concerns like logging, timing, and access control."
prerequisites:
  - 02-oop-inheritance
sources:
  - repo: "dabeaz-course/python-mastery"
    section: "Closures and Decorators"
    license: "CC BY-SA 4.0"
---

# Decorators

A **decorator** is a function that takes another function, adds some behavior, and returns a modified version. They are one of Python's most elegant patterns for extending functionality.

## Functions Are Objects

In Python, functions are objects. You can assign them to variables and pass them as arguments:

```python
def greet(name):
    return f"Hello, {name}!"

say_hello = greet  # Assign function to variable
print(say_hello("Alice"))  # Hello, Alice!

def call_twice(func, arg):
    print(func(arg))
    print(func(arg))

call_twice(greet, "Bob")
# Hello, Bob!
# Hello, Bob!
```

## Closures

A **closure** is a function defined inside another function that remembers the outer function's variables:

```python
def make_multiplier(n):
    def multiply(x):
        return x * n  # n is remembered from the outer scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
```

`multiply` "closes over" the variable `n`. This is the foundation of decorators.

## Your First Decorator

A decorator wraps a function to add behavior before or after it runs:

```python
def loud(func):
    def wrapper(*args, **kwargs):
        print("BEFORE the function")
        result = func(*args, **kwargs)
        print("AFTER the function")
        return result
    return wrapper

def greet(name):
    print(f"Hello, {name}!")

greet = loud(greet)
greet("Alice")
# BEFORE the function
# Hello, Alice!
# AFTER the function
```

## The `@` Syntax

Python provides `@decorator` as syntactic sugar for the pattern above:

```python
def loud(func):
    def wrapper(*args, **kwargs):
        print("BEFORE the function")
        result = func(*args, **kwargs)
        print("AFTER the function")
        return result
    return wrapper

@loud
def greet(name):
    print(f"Hello, {name}!")

# @loud is equivalent to: greet = loud(greet)
greet("Alice")
```

## A Practical Example: Timing

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.5)
    return "done"

slow_function()  # slow_function took 0.5001s
```

## Preserving Function Identity with `functools.wraps`

Without `functools.wraps`, the wrapped function loses its original name and docstring:

```python
from functools import wraps

def timer(func):
    @wraps(func)  # Preserves func.__name__ and func.__doc__
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.4f}s")
        return result
    return wrapper

@timer
def my_function():
    """This is my function."""
    pass

print(my_function.__name__)  # my_function  (not 'wrapper')
print(my_function.__doc__)   # This is my function.
```

Always use `@wraps(func)` in your decorators.

## Decorators with Arguments

To pass arguments to a decorator, add an outer function:

```python
from functools import wraps

def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")

say_hello()
# Hello!
# Hello!
# Hello!
```

`@repeat(3)` first calls `repeat(3)` which returns `decorator`, then `@decorator` wraps `say_hello`.

## Stacking Decorators

You can apply multiple decorators. They apply from bottom to top:

```python
@decorator_a
@decorator_b
def my_function():
    pass

# Equivalent to: my_function = decorator_a(decorator_b(my_function))
```

## Common Mistakes

**Forgetting to call the original function inside the wrapper:**
```python
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        print("Decorated!")
        # Forgot to call func(*args, **kwargs)!
    return wrapper
```

**Forgetting to return the wrapper:**
```python
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    # Forgot: return wrapper
```

**Forgetting `*args, **kwargs`:**
```python
def bad_decorator(func):
    def wrapper():  # Only works for functions with no arguments!
        return func()
    return wrapper
```

## Key Takeaways

- Functions are objects that can be passed around and returned
- Closures are functions that remember their enclosing scope
- Decorators wrap a function to add behavior without modifying it
- `@decorator` is syntactic sugar for `func = decorator(func)`
- Always use `@functools.wraps(func)` to preserve function metadata
- Decorators with arguments need three levels of nesting

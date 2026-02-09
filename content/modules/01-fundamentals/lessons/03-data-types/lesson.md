---
id: "03-data-types"
title: "Data Types"
concepts:
  - integers
  - floats
  - strings
  - booleans
  - type-function
  - type-conversion
why: "Python handles different kinds of data differently. Understanding types prevents confusing errors and helps you write code that works as expected."
prerequisites:
  - 02-variables
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 2 - Data Types"
    license: "MIT"
  - repo: "trekhleb/learn-python"
    section: "Data Types"
    license: "MIT"
  - repo: "satwikkansal/wtfpython"
    section: "Type Coercion"
    license: "MIT"
---

# Data Types

Every value in Python has a **type** that determines what you can do with it. You wouldn't try to divide a sentence by two — Python won't either.

## The Four Basic Types

### Integers (`int`)

Whole numbers, positive or negative:

```python
age = 25
temperature = -10
population = 8000000
```

You can do arithmetic with integers:

```python
print(10 + 3)   # 13
print(10 - 3)   # 7
print(10 * 3)   # 30
print(10 // 3)  # 3 (integer division — rounds down)
print(10 % 3)   # 1 (remainder / modulo)
print(10 ** 3)  # 1000 (exponentiation)
```

### Floats (`float`)

Numbers with decimal points:

```python
price = 9.99
pi = 3.14159
tiny = 0.001
```

Regular division always produces a float:

```python
print(10 / 3)   # 3.3333333333333335
print(10 / 2)   # 5.0 (still a float!)
```

### Strings (`str`)

Text data, enclosed in quotes:

```python
name = "Alice"
greeting = 'Hello!'
paragraph = """This is a
multi-line string."""
```

Strings can be combined (**concatenated**) with `+`:

```python
first = "Hello"
second = "World"
print(first + " " + second)  # Hello World
```

You can also repeat strings with `*`:

```python
print("ha" * 3)  # hahaha
print("-" * 20)   # --------------------
```

### Booleans (`bool`)

`True` or `False` — used for decisions and conditions:

```python
is_sunny = True
is_raining = False
print(is_sunny)   # True
```

Booleans come from comparisons:

```python
print(5 > 3)      # True
print(10 == 10)   # True
print("a" == "b") # False
```

## Checking Types with `type()`

The `type()` function tells you what type a value is:

```python
print(type(42))        # <class 'int'>
print(type(3.14))      # <class 'float'>
print(type("hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>
```

## Type Conversion

Sometimes you need to convert between types:

```python
# String to integer
age_text = "25"
age = int(age_text)
print(age + 1)      # 26

# Integer to string
score = 100
print("Score: " + str(score))  # Score: 100

# Integer to float
x = float(5)
print(x)  # 5.0

# Float to integer (truncates, doesn't round)
y = int(3.9)
print(y)  # 3
```

## Common Type Errors

The most frequent type error is trying to mix strings and numbers:

```python
# This causes a TypeError:
# print("Age: " + 25)

# Fix with str() or f-strings:
print("Age: " + str(25))
print(f"Age: {25}")
```

## Key Takeaways

- Python has four basic types: `int`, `float`, `str`, `bool`
- `type()` tells you a value's type
- Division (`/`) always returns a float; use `//` for integer division
- Strings can be concatenated with `+` and repeated with `*`
- Convert between types with `int()`, `float()`, `str()`, `bool()`
- Use f-strings to easily combine text and other types

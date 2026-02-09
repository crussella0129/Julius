---
id: "08-functions"
title: "Functions and Scope"
concepts:
  - function-definition
  - parameters-arguments
  - return-values
  - variable-scope
why: "Functions let you organize code into reusable pieces. Instead of copying and pasting the same logic, you write it once and call it by name — making programs shorter, clearer, and easier to fix."
prerequisites:
  - 07-loops
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 11 - Functions"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Functions"
    license: "CC BY-SA 4.0"
---

# Functions and Scope

A **function** is a named block of code that performs a specific task. You've been using built-in functions like `print()`, `input()`, `int()`, and `range()`. Now you'll learn to write your own.

## Defining a Function

Use the `def` keyword:

```python
def greet():
    print("Hello, World!")

greet()  # Call the function
greet()  # Call it again
```

The function body is indented, just like `if` and `for` blocks.

## Parameters and Arguments

**Parameters** are the variables in the function definition. **Arguments** are the values you pass when calling it:

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")   # Hello, Alice!
greet("Bob")     # Hello, Bob!
```

Functions can have multiple parameters:

```python
def add(a, b):
    result = a + b
    print(f"{a} + {b} = {result}")

add(3, 5)   # 3 + 5 = 8
```

## Return Values

Functions can send a value back using `return`:

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)  # 8
```

Without `return`, a function returns `None`:

```python
def greet(name):
    print(f"Hello, {name}!")

x = greet("Alice")
print(x)  # None
```

`return` also exits the function immediately:

```python
def is_even(n):
    if n % 2 == 0:
        return True
    return False
```

## Default Parameter Values

Give parameters default values so they're optional:

```python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")                # Hello, Alice!
greet("Bob", "Good morning")  # Good morning, Bob!
```

Parameters with defaults must come after parameters without:

```python
# def greet(greeting="Hello", name):  # SyntaxError!
def greet(name, greeting="Hello"):    # Correct
    print(f"{greeting}, {name}!")
```

## Variable Scope

Variables created inside a function are **local** — they only exist within that function:

```python
def my_function():
    x = 10
    print(x)

my_function()   # 10
# print(x)      # NameError — x doesn't exist here
```

Variables created outside functions are accessible everywhere:

```python
message = "Hello"

def print_message():
    print(message)  # Can read outer variables

print_message()  # Hello
```

But you can't modify an outer variable without the `global` keyword (which you should generally avoid):

```python
count = 0

def increment():
    global count
    count += 1

increment()
print(count)  # 1
```

A better approach is to use return values:

```python
def increment(count):
    return count + 1

count = 0
count = increment(count)
print(count)  # 1
```

## Docstrings

Document what your function does with a **docstring** — a string as the first line of the function body:

```python
def calculate_area(width, height):
    """Calculate the area of a rectangle."""
    return width * height
```

## Functions Calling Functions

Functions can call other functions:

```python
def square(n):
    return n * n

def sum_of_squares(a, b):
    return square(a) + square(b)

print(sum_of_squares(3, 4))  # 25
```

## Common Mistakes

**Forgetting `return`:**
```python
def add(a, b):
    a + b        # Calculates but doesn't return!

result = add(3, 5)
print(result)    # None — not 8
```

**Calling before defining:**
```python
# greet()       # NameError — not defined yet
def greet():
    print("Hi!")
greet()          # Works
```

## Key Takeaways

- Define functions with `def name(parameters):`
- Parameters receive values; `return` sends values back
- Without `return`, a function returns `None`
- Default parameters make arguments optional
- Local variables exist only inside their function
- Prefer returning values over modifying global variables

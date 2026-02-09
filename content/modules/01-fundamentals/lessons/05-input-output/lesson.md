---
id: "05-input-output"
title: "User Input and Output"
concepts:
  - input-function
  - f-strings
  - string-formatting
  - type-conversion-input
why: "Interactive programs need to communicate with users. input() lets your program ask questions, and f-strings let it give polished answers."
prerequisites:
  - 04-operators
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 2 - Variables and Input"
    license: "MIT"
  - repo: "zhiwehu/Python-programming-exercises"
    section: "Input/Output Exercises"
    license: "MIT"
---

# User Input and Output

So far your programs have used hard-coded values. The `input()` function lets users type in their own data while the program is running.

## Getting User Input

`input()` pauses the program and waits for the user to type something:

```python
name = input("What is your name? ")
print(f"Hello, {name}!")
```

When this runs, the user sees `What is your name? ` and types their answer. Whatever they type becomes a string stored in `name`.

## Input is Always a String

This is the most important thing to remember: `input()` **always returns a string**, even if the user types a number:

```python
age = input("How old are you? ")
print(type(age))  # <class 'str'>
```

To do math with user input, you must convert it:

```python
age = int(input("How old are you? "))
birth_year = 2025 - age
print(f"You were born around {birth_year}.")
```

For decimal numbers, use `float()`:

```python
price = float(input("Enter the price: "))
tax = price * 0.08
total = price + tax
print(f"Total with tax: ${total:.2f}")
```

## F-String Formatting

F-strings (formatted string literals) let you embed expressions inside strings:

```python
name = "Alice"
score = 95
print(f"{name} scored {score} points.")
```

You can put any expression inside the braces:

```python
x = 10
y = 3
print(f"{x} divided by {y} is {x / y}")
print(f"{x} divided by {y} is {x / y:.2f}")  # 2 decimal places
```

### Useful Format Specifiers

```python
pi = 3.14159265
print(f"Pi is approximately {pi:.2f}")     # 3.14
print(f"Pi is approximately {pi:.4f}")     # 3.1416

big = 1000000
print(f"Population: {big:,}")               # 1,000,000

percentage = 0.856
print(f"Score: {percentage:.1%}")           # 85.6%
```

## Multiple Inputs

You can call `input()` multiple times:

```python
first = input("First name: ")
last = input("Last name: ")
age = int(input("Age: "))

print(f"{first} {last} is {age} years old.")
```

## The `print()` Function Revisited

`print()` has useful optional arguments:

```python
# sep changes the separator between arguments (default is space)
print("A", "B", "C", sep="-")  # A-B-C

# end changes what's printed at the end (default is newline)
print("Loading", end="...")
print("Done!")  # Loading...Done!
```

## Common Mistakes

**Forgetting to convert input:**
```python
age = input("Age: ")
# age + 1  # TypeError! Can't add string and int
age = int(input("Age: "))  # Convert first
```

**Invalid input crashes the program:**
```python
# If user types "abc" when you expect a number:
# int("abc")  # ValueError!
```

You'll learn to handle these errors gracefully in a later module.

## Key Takeaways

- `input()` always returns a string — convert with `int()` or `float()` for math
- F-strings: `f"text {expression}"` embed values into strings
- Format specifiers: `:.2f` for decimals, `:,` for thousands, `:.1%` for percentages
- `print()` accepts `sep` and `end` keyword arguments

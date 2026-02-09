---
id: "06-error-handling"
title: "Exceptions and Error Handling"
concepts:
  - try-except
  - exception-types
  - finally-else
  - raising-exceptions
why: "Every real program encounters errors -- bad user input, missing files, network failures. Exception handling lets you anticipate problems and respond gracefully instead of crashing."
prerequisites:
  - 05-comprehensions
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 15 - Python Type Errors"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Exceptions"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Exceptions"
    license: "MIT"
---

# Exceptions and Error Handling

When something goes wrong during program execution, Python raises an **exception**. Without handling, exceptions crash your program. With handling, you can recover gracefully.

## Common Exception Types

```python
# TypeError — wrong type for an operation
# "hello" + 5

# ValueError — right type, wrong value
# int("abc")

# KeyError — missing dictionary key
# {"a": 1}["b"]

# IndexError — list index out of range
# [1, 2, 3][10]

# ZeroDivisionError
# 10 / 0

# FileNotFoundError
# open("nonexistent.txt")

# NameError — using a variable that doesn't exist
# print(undefined_var)

# AttributeError — object doesn't have that method/attribute
# "hello".append("!")
```

## Try / Except

Wrap risky code in a `try` block and handle errors in `except`:

```python
try:
    number = int(input("Enter a number: "))
    print(f"You entered {number}")
except ValueError:
    print("That's not a valid number!")
```

### Catching Specific Exceptions

Always catch specific exceptions when you can:

```python
try:
    result = 10 / int(input("Divide 10 by: "))
    print(f"Result: {result}")
except ValueError:
    print("Please enter a valid number.")
except ZeroDivisionError:
    print("Cannot divide by zero!")
```

### Catching the Exception Object

Use `as` to access the error message:

```python
try:
    x = int("hello")
except ValueError as e:
    print(f"Error: {e}")
# Error: invalid literal for int() with base 10: 'hello'
```

### Catching Multiple Exceptions Together

```python
try:
    # some risky operation
    value = int("abc")
except (ValueError, TypeError) as e:
    print(f"Bad input: {e}")
```

## The Else Clause

Code in `else` runs only if no exception was raised:

```python
try:
    number = int("42")
except ValueError:
    print("Invalid!")
else:
    print(f"Success! Got {number}")
# Output: Success! Got 42
```

## The Finally Clause

Code in `finally` **always** runs, whether or not an exception occurred:

```python
try:
    f = open("data.txt")
    data = f.read()
except FileNotFoundError:
    print("File not found!")
finally:
    print("This always runs")
```

`finally` is useful for cleanup -- closing files, releasing resources, etc.

## The Full Pattern

```python
try:
    # Code that might fail
    result = 10 / 2
except ZeroDivisionError:
    # Handle the error
    print("Cannot divide by zero!")
else:
    # Runs if NO exception
    print(f"Result is {result}")
finally:
    # ALWAYS runs
    print("Done.")
```

## Raising Exceptions

Use `raise` to deliberately trigger an exception:

```python
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age > 150:
        raise ValueError("Age seems unrealistic")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(e)   # Age cannot be negative
```

## Custom Exceptions

Create your own exception types by extending `Exception`:

```python
class InsufficientFundsError(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(
            f"Cannot withdraw ${amount} from ${balance} balance"
        )
    return balance - amount

try:
    withdraw(100, 200)
except InsufficientFundsError as e:
    print(e)
```

## Best Practices

**Be specific with exceptions:**
```python
# Bad — catches EVERYTHING, even typos
try:
    do_something()
except:
    pass

# Better — catch what you expect
try:
    do_something()
except ValueError:
    handle_bad_value()
```

**Don't use exceptions for flow control:**
```python
# Bad
try:
    value = my_dict[key]
except KeyError:
    value = default

# Better
value = my_dict.get(key, default)
```

**Use LBYL or EAFP consistently:**
```python
# LBYL: Look Before You Leap
if key in my_dict:
    value = my_dict[key]

# EAFP: Easier to Ask Forgiveness than Permission
try:
    value = my_dict[key]
except KeyError:
    value = None
```

## Common Mistakes

**Bare except catches too much:**
```python
# This catches KeyboardInterrupt and SystemExit too!
try:
    something()
except:
    pass  # Never do this
```

**Forgetting that except runs only for matching types:**
```python
try:
    int("abc")
except TypeError:      # Wrong! int("abc") raises ValueError, not TypeError
    print("caught")
# ValueError is NOT caught — program crashes
```

## Key Takeaways

- Use `try`/`except` to handle expected errors gracefully
- Always catch specific exception types, not bare `except`
- `else` runs when no exception occurs; `finally` always runs
- Use `raise` to signal errors in your own functions
- Custom exceptions make your error handling more descriptive
- Don't silence exceptions without good reason

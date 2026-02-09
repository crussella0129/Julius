---
id: "06-conditionals"
title: "Conditionals and Decisions"
concepts:
  - if-statement
  - elif-statement
  - else-statement
  - boolean-expressions
why: "Programs need to make decisions. Conditionals let your code choose different paths based on conditions — like a fork in the road."
prerequisites:
  - 05-input-output
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 9 - Conditionals"
    license: "MIT"
  - repo: "trekhleb/learn-python"
    section: "Control Flow"
    license: "MIT"
---

# Conditionals and Decisions

Up to now, every line of your code runs in order, top to bottom. **Conditionals** let your program make decisions — executing some code only when certain conditions are met.

## The `if` Statement

The simplest conditional checks one condition:

```python
temperature = 35

if temperature > 30:
    print("It's hot outside!")
```

If the condition (`temperature > 30`) is `True`, the indented code runs. If `False`, it's skipped entirely.

**Indentation matters!** Python uses indentation (4 spaces) to define which code belongs to the `if` block:

```python
if temperature > 30:
    print("It's hot!")       # Inside the if block
    print("Stay hydrated!")  # Also inside
print("Have a good day!")    # Outside — always runs
```

## `if`/`else`

Use `else` to run code when the condition is `False`:

```python
age = 15

if age >= 18:
    print("You can vote.")
else:
    print("You're too young to vote.")
```

Exactly one branch will always execute — never both, never neither.

## `if`/`elif`/`else`

Use `elif` (short for "else if") to check multiple conditions:

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is {grade}.")
```

Python checks conditions from top to bottom and runs the **first** matching branch. Once a branch matches, the rest are skipped.

## Boolean Expressions

Conditions can be any expression that evaluates to `True` or `False`:

```python
x = 10
name = "Alice"

if x > 5 and x < 20:
    print("x is between 5 and 20")

if name == "Alice" or name == "Bob":
    print("Hi, friend!")

if not name == "Charlie":
    print("You're not Charlie.")
```

## Nested Conditionals

You can put `if` statements inside other `if` statements:

```python
age = 25
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Welcome to the show!")
    else:
        print("You need a ticket.")
else:
    print("Sorry, adults only.")
```

While nesting works, deep nesting gets hard to read. Often you can simplify with `and`:

```python
if age >= 18 and has_ticket:
    print("Welcome to the show!")
```

## Truthy and Falsy Values

Python treats some values as `False` in conditions:

```python
# These are all "falsy":
if not 0:        print("0 is falsy")
if not "":       print("Empty string is falsy")
if not []:       print("Empty list is falsy")
if not None:     print("None is falsy")

# Everything else is "truthy":
if 42:           print("Non-zero numbers are truthy")
if "hello":      print("Non-empty strings are truthy")
```

## Common Mistakes

**Missing colon:**
```python
# if x > 5     # SyntaxError — needs colon
if x > 5:      # Correct
    print("yes")
```

**Wrong indentation:**
```python
if x > 5:
print("yes")   # IndentationError — must be indented
```

**Using `=` instead of `==`:**
```python
# if x = 5:   # SyntaxError — use == for comparison
if x == 5:     # Correct
    print("yes")
```

## Key Takeaways

- `if` executes code when a condition is `True`
- `elif` checks additional conditions; `else` catches everything remaining
- Python checks conditions top to bottom, running only the first match
- Indentation (4 spaces) defines what's inside a block
- `0`, `""`, `[]`, and `None` are falsy; most other values are truthy

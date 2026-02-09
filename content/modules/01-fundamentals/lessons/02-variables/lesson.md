---
id: "02-variables"
title: "Variables and Assignment"
concepts:
  - variables
  - assignment
  - naming-conventions
  - print
why: "Variables let your programs remember things. Without them, every value would be used once and forgotten — like doing math without ever writing anything down."
prerequisites:
  - 01-hello-world
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 2 - Variables"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Variables and Simple Data Types"
    license: "CC BY-SA 4.0"
---

# Variables and Assignment

A **variable** is a name that refers to a value stored in your computer's memory. Think of it as a labeled box — you put something in, and later you can use the label to get it back.

## Creating Variables

In Python, you create a variable with the **assignment operator** `=`:

```python
message = "Hello, Python!"
print(message)
```

Output:
```
Hello, Python!
```

Notice: we wrote `message` (no quotes) in `print()`, not `"message"`. Without quotes, Python looks up the variable. With quotes, it treats it as literal text.

## Changing Variables

Variables can be **reassigned** — they can hold a new value at any time:

```python
score = 0
print(score)

score = 10
print(score)

score = score + 5
print(score)
```

Output:
```
0
10
15
```

The line `score = score + 5` means: "take the current value of `score` (10), add 5, and store the result (15) back in `score`."

## Multiple Variables

You can create as many variables as you need:

```python
name = "Alice"
age = 25
city = "Portland"

print(name)
print(age)
print(city)
```

## Variable Naming Rules

Python has rules for variable names:

1. **Must start with a letter or underscore** (`_`)
2. **Can contain letters, numbers, and underscores**
3. **Cannot be a Python keyword** (like `print`, `if`, `for`)
4. **Case-sensitive**: `name` and `Name` are different variables

```python
# Valid names
user_name = "Bob"
score1 = 100
_private = "hidden"

# Invalid names (these cause errors)
# 1st_place = "Alice"   # Can't start with a number
# my-score = 50          # Hyphens not allowed
# class = "Math"         # 'class' is a keyword
```

## Naming Conventions

By convention, Python programmers use **snake_case** for variable names — lowercase words separated by underscores:

```python
# Good (snake_case)
first_name = "Alice"
total_score = 95
is_active = True

# Works but not conventional
firstName = "Alice"    # camelCase — used in other languages
TOTAL_SCORE = 95       # ALL_CAPS — reserved for constants
```

## Using Variables in Print

You can combine variables with text using **f-strings** (formatted strings):

```python
name = "Alice"
age = 25
print(f"My name is {name} and I am {age} years old.")
```

Output:
```
My name is Alice and I am 25 years old.
```

The `f` before the quote makes it a formatted string. Anything inside `{}` is evaluated as Python code.

## Key Takeaways

- Variables are created with `=` (assignment)
- Variables can be reassigned to new values
- Use `snake_case` for variable names
- Names are case-sensitive and cannot start with numbers
- f-strings let you embed variables in text: `f"text {variable}"`

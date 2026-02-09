---
id: "01-hello-world"
title: "Hello, World!"
concepts:
  - print
  - strings
  - program-execution
why: "Every program needs output. print() is how Python talks back to you — it's the first tool you'll use to see what your code is doing."
prerequisites: []
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 1 - Introduction"
    license: "MIT"
  - repo: "trekhleb/learn-python"
    section: "Getting Started"
    license: "MIT"
---

# Hello, World!

The tradition of every programmer's first program goes back to 1978, when Brian Kernighan and Dennis Ritchie published *The C Programming Language*. The first example printed "hello, world" to the screen. We'll continue that tradition with Python.

## Your First Program

In Python, displaying text on the screen takes just one line:

```python
print("Hello, World!")
```

When you run this, Python will display:

```
Hello, World!
```

That's it — a complete program in one line. Let's break down what's happening.

## How `print()` Works

`print()` is a **function** — a reusable piece of code that performs an action. You'll learn to write your own functions later, but for now, think of `print()` as a built-in tool that displays text.

The text inside the parentheses is called an **argument** — it's the data you're giving to `print()`. The quotes around the text make it a **string** (Python's word for text data).

```python
print("This is a string")
print('Single quotes work too')
```

## Printing Multiple Lines

Each call to `print()` outputs on a new line:

```python
print("Line one")
print("Line two")
print("Line three")
```

Output:
```
Line one
Line two
Line three
```

## Printing Numbers

You can print numbers without quotes:

```python
print(42)
print(3.14)
```

## Empty Lines

Calling `print()` with no argument prints a blank line:

```python
print("Before")
print()
print("After")
```

Output:
```
Before

After
```

## Common Mistakes

**Forgetting quotes around text:**
```python
print(Hello)  # NameError — Python thinks Hello is a variable
```

**Mismatched quotes:**
```python
print("Hello')  # SyntaxError — quotes must match
```

**Missing parentheses:**
```python
print "Hello"  # SyntaxError — Python 3 requires parentheses
```

These errors are normal — even experienced programmers make them. Python's error messages will help you find and fix them.

## Key Takeaways

- `print()` displays output to the screen
- Text must be enclosed in quotes (single `'` or double `"`)
- Each `print()` call outputs on a new line
- Numbers don't need quotes
- Error messages tell you what went wrong and where

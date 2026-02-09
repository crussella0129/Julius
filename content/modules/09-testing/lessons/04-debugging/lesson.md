---
id: "04-debugging"
title: "Debugging Techniques"
concepts:
  - print-debugging
  - pdb-debugger
  - logging-module
  - traceback-reading
why: "Every programmer spends time debugging. Knowing how to systematically find and fix bugs using print statements, debuggers, and logging saves hours of frustration."
prerequisites:
  - 03-test-patterns
sources:
  - repo: "pytest-dev/pytest"
    section: "Debugging"
    license: "MIT"
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 15 - Python Type Errors"
    license: "MIT"
---

# Debugging Techniques

Debugging is the process of finding and fixing errors in your code. It is a skill that improves with practice. Python provides several tools to help, from simple print statements to full-featured debuggers.

## Reading Tracebacks

When Python hits an error, it shows a traceback. Read it from bottom to top:

```
Traceback (most recent call last):
  File "app.py", line 15, in main
    result = process_data(items)
  File "app.py", line 8, in process_data
    return total / count
ZeroDivisionError: division by zero
```

1. **Last line**: The error type and message (`ZeroDivisionError`)
2. **Stack frames**: Read upward to see the chain of function calls
3. **File and line**: Where exactly the error occurred

## Print Debugging

The simplest debugging technique. Add print statements to see what your code is doing:

```python
def find_average(numbers):
    print(f"DEBUG: numbers = {numbers}")        # What came in?
    total = sum(numbers)
    print(f"DEBUG: total = {total}")             # Is total correct?
    count = len(numbers)
    print(f"DEBUG: count = {count}")             # Is count correct?
    return total / count

# Later: remove or comment out debug prints
```

## Better Print Debugging with f-strings

```python
def process(data):
    for i, item in enumerate(data):
        print(f"DEBUG [{i}]: {item!r} (type: {type(item).__name__})")
        # !r shows the repr, which reveals hidden characters
```

## The `logging` Module

Logging is print debugging that you can leave in your code:

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def calculate(a, b, operation):
    logger.debug(f"calculate({a}, {b}, {operation})")

    if operation == "add":
        result = a + b
    elif operation == "divide":
        if b == 0:
            logger.error("Division by zero attempted!")
            return None
        result = a / b
    else:
        logger.warning(f"Unknown operation: {operation}")
        return None

    logger.info(f"Result: {result}")
    return result
```

## Logging Levels

```python
import logging

logging.debug("Detailed info for diagnosing")    # Level 10
logging.info("Confirmation things work")          # Level 20
logging.warning("Something unexpected happened")  # Level 30
logging.error("Something failed")                 # Level 40
logging.critical("Program cannot continue")       # Level 50
```

Set the level to control what gets displayed:
```python
logging.basicConfig(level=logging.WARNING)  # Only WARNING and above
```

## The `pdb` Debugger

Python's built-in debugger lets you pause execution and inspect state:

```python
def buggy_function(items):
    total = 0
    for item in items:
        breakpoint()  # Pause here (Python 3.7+)
        total += item["value"]
    return total
```

Useful pdb commands:
```
n        next line (step over)
s        step into function call
c        continue to next breakpoint
p expr   print an expression
pp expr  pretty-print an expression
l        show code around current line
q        quit debugger
```

## Using `breakpoint()`

```python
def find_bug(data):
    results = []
    for item in data:
        processed = item.strip().lower()
        if processed:
            breakpoint()  # Drops into debugger here
            results.append(processed)
    return results
```

## Debugging Strategies

**1. Reproduce the bug first:**
```python
# Write a minimal example that triggers the bug
def test_bug():
    result = broken_function([1, 2, 3])
    print(f"Got: {result}, Expected: 6")
```

**2. Binary search for the bug location:**
```python
# Add a print halfway through, then narrow down
def process(data):
    step1 = transform(data)
    print(f"After step1: {step1}")  # Is it correct here?
    step2 = filter_data(step1)
    step3 = aggregate(step2)
    return step3
```

**3. Check your assumptions:**
```python
def process(items):
    assert isinstance(items, list), f"Expected list, got {type(items)}"
    assert len(items) > 0, "Expected non-empty list"
    # Now proceed with confidence
```

## Logging to a File

```python
import logging

logging.basicConfig(
    filename="app.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logging.info("Application started")
logging.error("Something went wrong")
```

## Common Debugging Mistakes

**Not reading the full traceback:**
```python
# Don't just look at the error type — read the line numbers!
```

**Debugging the wrong thing:**
```python
# Verify the input first, then check the processing
def process(data):
    print(f"INPUT: {data!r}")  # Start here!
```

**Leaving debug prints in production:**
```python
# Use logging instead — you can turn it off without removing code
```

## Key Takeaways

- Read tracebacks from bottom to top: error type, then trace the call chain
- Print debugging is simple but effective; use f-strings with `!r` for clarity
- Use `logging` instead of print for permanent debugging hooks
- `breakpoint()` drops into the interactive debugger at any point
- Reproduce the bug with a minimal example before trying to fix it
- Check your assumptions about inputs with assert statements

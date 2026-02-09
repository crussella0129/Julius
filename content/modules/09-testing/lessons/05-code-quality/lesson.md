---
id: "05-code-quality"
title: "Code Quality Tools"
concepts:
  - linting
  - type-hints
  - code-formatting
  - docstrings
why: "Clean, consistent code is easier to read, review, and maintain. Linters catch bugs before you run the code, type hints document expected types, and formatters end style debates."
prerequisites:
  - 04-debugging
sources:
  - repo: "microsoft/python-type-stubs"
    section: "Type Hints"
    license: "MIT"
  - repo: "pytest-dev/pytest"
    section: "Code Quality"
    license: "MIT"
---

# Code Quality Tools

Code quality is not about cleverness. It is about clarity. Python has excellent tools for linting, formatting, and type checking that help you write code that other developers (and future you) can understand.

## PEP 8: Python's Style Guide

PEP 8 is the official Python style guide. Key rules:

```python
# Indentation: 4 spaces
def greet(name):
    print(f"Hello, {name}!")

# Line length: 79 characters max (or 88 with Black)

# Naming conventions
my_variable = 42         # snake_case for variables and functions
MY_CONSTANT = 3.14       # UPPER_CASE for constants
class MyClass:           # PascalCase for classes
    pass

# Blank lines
# 2 blank lines before top-level functions/classes
# 1 blank line between methods in a class
```

## Linting with `flake8`

A linter checks your code for style issues and potential bugs:

```bash
pip install flake8
flake8 my_script.py
```

Example output:
```
my_script.py:3:1: E302 expected 2 blank lines, found 1
my_script.py:7:80: E501 line too long (95 > 79 characters)
my_script.py:12:5: F841 local variable 'x' is assigned but never used
```

## Code Formatting with `black`

Black is an opinionated formatter. It rewrites your code to a consistent style:

```bash
pip install black
black my_script.py
```

Before:
```python
x = {  'a':37,'b':42,
'c':    927}
y = 'hello'+'world'
```

After:
```python
x = {"a": 37, "b": 42, "c": 927}
y = "hello" + "world"
```

Black removes style debates. Everyone's code looks the same.

## Type Hints

Type hints document what types a function expects and returns:

```python
def add(a: int, b: int) -> int:
    return a + b

def greet(name: str, times: int = 1) -> None:
    for _ in range(times):
        print(f"Hello, {name}!")

def find_max(numbers: list[int]) -> int | None:
    if not numbers:
        return None
    return max(numbers)
```

Type hints do not enforce types at runtime. They are documentation that tools can check.

## Common Type Hint Patterns

```python
from typing import Optional

# Optional means "this type or None"
def find_user(user_id: int) -> Optional[dict]:
    if user_id == 0:
        return None
    return {"id": user_id, "name": "Alice"}

# Lists, dicts, tuples
def process(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# Union types (Python 3.10+)
def display(value: int | float | str) -> str:
    return str(value)
```

## Type Checking with `mypy`

```bash
pip install mypy
mypy my_script.py
```

```python
def add(a: int, b: int) -> int:
    return a + b

add("hello", "world")  # mypy error: Argument 1 has incompatible type "str"
```

## Docstrings

Document your functions with docstrings:

```python
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate Body Mass Index.

    Args:
        weight_kg: Weight in kilograms.
        height_m: Height in meters.

    Returns:
        The BMI value as a float.

    Raises:
        ValueError: If height is zero or negative.
    """
    if height_m <= 0:
        raise ValueError("Height must be positive")
    return weight_kg / (height_m ** 2)
```

## Import Sorting with `isort`

```bash
pip install isort
isort my_script.py
```

Before:
```python
import os
from pathlib import Path
import sys
import json
from collections import Counter
```

After:
```python
import json
import os
import sys
from collections import Counter
from pathlib import Path
```

## Putting It All Together

A typical quality check workflow:

```bash
# Format code
black src/

# Sort imports
isort src/

# Check style
flake8 src/

# Check types
mypy src/

# Run tests
pytest tests/
```

## pre-commit Hooks

Automate quality checks before every commit:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
```

## Common Mistakes

**Ignoring type hint warnings:**
```python
def process(data):      # What type is data? Nobody knows
    return data.split()  # Crashes if data isn't a string

def process(data: str) -> list[str]:  # Clear contract
    return data.split()
```

**Inconsistent formatting in a team:**
```python
# Use black and commit a shared config — no more debates
```

## Key Takeaways

- Follow PEP 8 naming: `snake_case` for functions, `PascalCase` for classes
- Use `black` for automatic formatting; `flake8` for linting
- Add type hints to function parameters and return values
- Use `mypy` to check types statically, catching bugs before runtime
- Write docstrings for public functions using Google or NumPy style
- Automate all checks with pre-commit hooks

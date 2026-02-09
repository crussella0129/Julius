---
id: "02-unittest-pytest"
title: "pytest Fundamentals"
concepts:
  - pytest-basics
  - assert-introspection
  - fixtures
  - parametrize
why: "pytest is the most popular Python testing framework. Its plain assert statements, automatic test discovery, and powerful fixtures make writing and running tests effortless."
prerequisites:
  - 01-why-testing
sources:
  - repo: "pytest-dev/pytest"
    section: "Getting Started"
    license: "MIT"
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 26 - Python Web"
    license: "MIT"
---

# pytest Fundamentals

While Python ships with `unittest`, most Python developers prefer `pytest`. It requires less boilerplate, has better error messages, and offers powerful features like fixtures and parametrize.

## Installing pytest

```bash
pip install pytest
```

## Your First pytest Test

Create a file called `test_math.py`:

```python
# test_math.py
def add(a, b):
    return a + b

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -2) == -3

def test_add_zero():
    assert add(5, 0) == 5
```

Run it:
```bash
pytest test_math.py -v
```

Output:
```
test_math.py::test_add_positive PASSED
test_math.py::test_add_negative PASSED
test_math.py::test_add_zero PASSED
```

## pytest Discovery Rules

pytest automatically finds tests using these rules:
- Files named `test_*.py` or `*_test.py`
- Functions named `test_*`
- Classes named `Test*` with methods named `test_*`

## Assert Introspection

pytest's killer feature is smart assert messages. With plain `assert`:

```python
def test_greeting():
    result = "Hello, World"
    assert result == "Hello, World!"
    # AssertionError: assert 'Hello, World' == 'Hello, World!'
    #   - Hello, World!
    #   + Hello, World
```

pytest shows exactly what differed, with no special syntax needed.

## Testing Exceptions

Use `pytest.raises` to verify that code raises the expected exception:

```python
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
```

## Fixtures

Fixtures provide reusable setup for tests:

```python
import pytest

@pytest.fixture
def sample_list():
    return [3, 1, 4, 1, 5, 9, 2, 6]

def test_sort(sample_list):
    result = sorted(sample_list)
    assert result == [1, 1, 2, 3, 4, 5, 6, 9]

def test_length(sample_list):
    assert len(sample_list) == 8

def test_max(sample_list):
    assert max(sample_list) == 9
```

Each test gets a fresh copy of the fixture, so tests stay independent.

## Parametrize

Run the same test with multiple inputs:

```python
import pytest

def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

@pytest.mark.parametrize("text, expected", [
    ("racecar", True),
    ("hello", False),
    ("A man a plan a canal Panama", True),
    ("", True),
])
def test_palindrome(text, expected):
    assert is_palindrome(text) == expected
```

This creates 4 separate tests from one function.

## Setup and Teardown

Fixtures can include cleanup with `yield`:

```python
import pytest
from pathlib import Path

@pytest.fixture
def temp_file():
    path = Path("test_output.txt")
    path.write_text("test data")
    yield path          # Test runs here
    path.unlink()       # Cleanup after test

def test_read_file(temp_file):
    assert temp_file.read_text() == "test data"
```

## Comparing unittest and pytest

**unittest** (standard library):
```python
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

    def test_subtract(self):
        self.assertEqual(subtract(5, 3), 2)
```

**pytest** (third-party, simpler):
```python
def test_add():
    assert add(2, 3) == 5

def test_subtract():
    assert subtract(5, 3) == 2
```

pytest requires less code and gives better error messages.

## Useful pytest Options

```bash
pytest -v              # Verbose output
pytest -x              # Stop on first failure
pytest -k "test_add"   # Run tests matching a name pattern
pytest --tb=short      # Shorter tracebacks
pytest -q              # Quiet output (dots only)
```

## Common Mistakes

**Forgetting the `test_` prefix:**
```python
def check_add():       # pytest will NOT discover this
    assert add(2, 3) == 5

def test_add():        # pytest WILL discover this
    assert add(2, 3) == 5
```

**Mutating fixture data across tests:**
```python
@pytest.fixture
def items():
    return [1, 2, 3]

def test_append(items):
    items.append(4)
    assert len(items) == 4  # Passes, but items is fresh each time
```

## Key Takeaways

- pytest uses plain `assert` statements with smart error messages
- Test files must be named `test_*.py`, functions must start with `test_`
- Fixtures provide reusable test setup and teardown
- `@pytest.mark.parametrize` runs one test with multiple inputs
- `pytest.raises` verifies that expected exceptions are raised
- Use `yield` in fixtures for cleanup after tests run

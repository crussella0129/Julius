---
id: "03-test-patterns"
title: "Test Patterns and Mocking"
concepts:
  - arrange-act-assert
  - mocking
  - test-doubles
  - edge-cases
why: "Good test structure and mocking techniques let you test code in isolation, even when it depends on databases, APIs, or the filesystem. These patterns make tests reliable and maintainable."
prerequisites:
  - 02-unittest-pytest
sources:
  - repo: "pytest-dev/pytest"
    section: "Monkeypatching"
    license: "MIT"
  - repo: "microsoft/python-type-stubs"
    section: "Testing Patterns"
    license: "MIT"
---

# Test Patterns and Mocking

Writing tests is easy. Writing good tests requires patterns. The Arrange-Act-Assert pattern gives tests a clear structure, and mocking lets you test code without relying on external systems.

## Arrange-Act-Assert (AAA)

Every test should have three distinct phases:

```python
def test_sort_numbers():
    # Arrange — set up the data
    numbers = [5, 2, 8, 1, 9]

    # Act — perform the action
    result = sorted(numbers)

    # Assert — check the outcome
    assert result == [1, 2, 5, 8, 9]
```

This pattern makes tests readable and consistent.

## Testing Edge Cases

Edge cases are unusual inputs that often cause bugs:

```python
def divide(a, b):
    if b == 0:
        raise ValueError("Division by zero")
    return a / b

# Normal cases
def test_divide_positive():
    assert divide(10, 2) == 5.0

# Edge cases
def test_divide_by_zero():
    import pytest
    with pytest.raises(ValueError):
        divide(10, 0)

def test_divide_negative():
    assert divide(-10, 2) == -5.0

def test_divide_float():
    assert abs(divide(1, 3) - 0.3333) < 0.001

def test_divide_large_numbers():
    assert divide(1_000_000, 1_000) == 1_000.0
```

## What Is Mocking?

Mocking replaces real objects with controlled substitutes during testing. This lets you test your code without:
- Making real API calls
- Writing to real files
- Connecting to databases

## Using `unittest.mock`

```python
from unittest.mock import Mock

# Create a mock object
api = Mock()

# Configure what it returns
api.get_user.return_value = {"name": "Alice", "age": 30}

# Use it like a real object
user = api.get_user(42)
print(user["name"])  # Alice

# Verify it was called correctly
api.get_user.assert_called_once_with(42)
```

## Mocking with `patch`

`patch` temporarily replaces a real function with a mock:

```python
from unittest.mock import patch

def get_greeting():
    import datetime
    hour = datetime.datetime.now().hour
    if hour < 12:
        return "Good morning"
    return "Good afternoon"

# Test without depending on the actual time
@patch("datetime.datetime")
def test_morning_greeting(mock_dt):
    mock_dt.now.return_value.hour = 9
    assert get_greeting() == "Good morning"
```

## Mocking in pytest with `monkeypatch`

pytest's `monkeypatch` fixture is a simpler alternative:

```python
def fetch_data(url):
    import requests
    response = requests.get(url)
    return response.json()

def test_fetch_data(monkeypatch):
    class FakeResponse:
        def json(self):
            return {"status": "ok"}

    def fake_get(url):
        return FakeResponse()

    monkeypatch.setattr("requests.get", fake_get)
    result = fetch_data("https://api.example.com")
    assert result == {"status": "ok"}
```

## Test Doubles Vocabulary

| Type | Purpose | Example |
|------|---------|---------|
| **Stub** | Returns predefined data | Fake API that always returns `{"ok": True}` |
| **Mock** | Records calls for verification | Check that `send_email()` was called once |
| **Fake** | Working implementation (simplified) | In-memory database instead of PostgreSQL |
| **Spy** | Wraps real object, records calls | Real function that also logs arguments |

## Testing with Temporary Files

```python
import pytest
from pathlib import Path

def count_lines(filepath):
    return len(Path(filepath).read_text().splitlines())

def test_count_lines(tmp_path):
    # tmp_path is a built-in pytest fixture
    test_file = tmp_path / "data.txt"
    test_file.write_text("line 1\nline 2\nline 3\n")
    assert count_lines(test_file) == 3
```

## Testing Return Values vs Side Effects

**Return values** are straightforward to test:
```python
def test_add():
    assert add(2, 3) == 5
```

**Side effects** (printing, writing files, sending emails) need mocking:
```python
from unittest.mock import patch

def greet(name):
    print(f"Hello, {name}!")

@patch("builtins.print")
def test_greet(mock_print):
    greet("Alice")
    mock_print.assert_called_once_with("Hello, Alice!")
```

## Common Mistakes

**Testing too many things at once:**
```python
# Bad — tests sorting AND filtering AND formatting
def test_process_data():
    result = process_data([5, 2, 8, 1])
    assert result == "1, 2, 5, 8"

# Better — test each step separately
def test_sort_data():
    assert sort_data([5, 2, 8, 1]) == [1, 2, 5, 8]

def test_format_data():
    assert format_data([1, 2, 5, 8]) == "1, 2, 5, 8"
```

**Over-mocking:**
```python
# If you mock everything, you're testing nothing
```

## Key Takeaways

- Use Arrange-Act-Assert for consistent test structure
- Always test edge cases: empty inputs, zeros, negatives, large values
- Use mocking to isolate code from external dependencies
- `unittest.mock.patch` replaces real functions temporarily
- pytest's `monkeypatch` and `tmp_path` simplify common testing tasks
- Test one behavior per test function

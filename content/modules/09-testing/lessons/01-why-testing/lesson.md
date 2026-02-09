---
id: "01-why-testing"
title: "Why Testing Matters"
concepts:
  - testing-motivation
  - manual-vs-automated
  - test-types
  - regression-bugs
why: "Every developer introduces bugs. Testing catches them before users do. Automated tests let you change code confidently, knowing you will be alerted if something breaks."
prerequisites:
  - 06-automation-project
sources:
  - repo: "pytest-dev/pytest"
    section: "Getting Started"
    license: "MIT"
  - repo: "microsoft/python-type-stubs"
    section: "Type Safety"
    license: "MIT"
---

# Why Testing Matters

Testing is not just about finding bugs. It is about building confidence that your code works correctly today and will continue working tomorrow when you make changes.

## The Cost of Bugs

Bugs found later are more expensive to fix:

```
During coding:     minutes to fix
During code review: hours to fix
In production:     days to fix + angry users
```

Tests shift bug detection earlier, when fixes are cheap.

## Manual vs Automated Testing

**Manual testing** means running your program and checking output by hand:

```python
# You run this and eyeball the result
def add(a, b):
    return a + b

print(add(2, 3))   # "Is it 5? Looks right..."
print(add(-1, 1))  # "Is it 0? Yes..."
```

This works for small programs but breaks down quickly. You cannot manually re-check 50 functions every time you change one line.

**Automated testing** writes code to check your code:

```python
def add(a, b):
    return a + b

# Automated checks
assert add(2, 3) == 5
assert add(-1, 1) == 0
assert add(0, 0) == 0
print("All tests passed!")
```

## The `assert` Statement

`assert` is Python's simplest testing tool. It raises an `AssertionError` if the condition is false:

```python
assert 2 + 2 == 4          # Passes silently
assert 2 + 2 == 5          # AssertionError!

# With a message
assert len("hello") == 5, "Expected length 5"
```

## What Are Regression Bugs?

A **regression** is when working code breaks after a change. Example:

```python
# Version 1: works
def calculate_discount(price, percent):
    return price * (percent / 100)

# Version 2: "improved" but broken
def calculate_discount(price, percent):
    return price * (percent / 100)
    # Oops — someone later adds tax logic that changes the return
```

Tests catch regressions automatically:

```python
def test_discount():
    assert calculate_discount(100, 20) == 20.0
    assert calculate_discount(50, 10) == 5.0
```

If the function changes and breaks, the test fails immediately.

## Types of Tests

**Unit tests** test individual functions in isolation:
```python
def test_add():
    assert add(2, 3) == 5
```

**Integration tests** test multiple components working together:
```python
def test_checkout():
    cart = Cart()
    cart.add_item("widget", 9.99)
    order = checkout(cart, payment_method="card")
    assert order.total == 9.99
    assert order.status == "confirmed"
```

**End-to-end tests** test the full application from a user's perspective.

## Writing Your First Test File

By convention, test files start with `test_`:

```python
# math_utils.py
def multiply(a, b):
    return a * b

# test_math_utils.py
from math_utils import multiply

def test_multiply_positive():
    assert multiply(3, 4) == 12

def test_multiply_by_zero():
    assert multiply(5, 0) == 0

def test_multiply_negative():
    assert multiply(-2, 3) == -6
```

## What Makes a Good Test?

1. **Focused**: Tests one behavior at a time
2. **Independent**: Does not depend on other tests
3. **Repeatable**: Gives the same result every run
4. **Fast**: Runs in milliseconds, not seconds
5. **Readable**: Test name explains what it checks

```python
# Good test name
def test_empty_cart_has_zero_total():
    cart = Cart()
    assert cart.total == 0

# Bad test name
def test1():
    c = Cart()
    assert c.total == 0
```

## The Testing Pyramid

```
        /  E2E  \        Few, slow, expensive
       /----------\
      / Integration \    Some, moderate speed
     /----------------\
    /    Unit Tests     \  Many, fast, cheap
    ---------------------
```

Most tests should be unit tests. They are fastest and easiest to write.

## Common Mistakes

**Testing implementation, not behavior:**
```python
# Bad — tests HOW, not WHAT
def test_sort_uses_quicksort():
    assert sort.algorithm == "quicksort"

# Good — tests the result
def test_sort_returns_ordered_list():
    assert sort([3, 1, 2]) == [1, 2, 3]
```

**No tests at all:**
> "It works on my machine" is not a testing strategy.

## Key Takeaways

- Automated tests save time compared to manual checking
- `assert` is the simplest way to verify expected behavior
- Unit tests check individual functions; integration tests check components together
- Tests catch regression bugs when you change code
- Good tests are focused, independent, repeatable, fast, and readable
- Most of your tests should be unit tests

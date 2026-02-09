---
id: "04-operators"
title: "Operators and Expressions"
concepts:
  - arithmetic-operators
  - comparison-operators
  - logical-operators
  - operator-precedence
why: "Operators are how you tell Python to compute things. Every calculation, comparison, and decision in your programs relies on understanding how operators work and combine."
prerequisites:
  - 03-data-types
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 3 - Operators"
    license: "MIT"
  - repo: "trekhleb/learn-python"
    section: "Operators"
    license: "MIT"
---

# Operators and Expressions

An **expression** is any piece of code that produces a value. Operators are the symbols that combine values into expressions — like `+` for addition or `>` for comparison.

## Arithmetic Operators

You've already seen basic math. Here's the full set:

```python
print(10 + 3)   # 13   Addition
print(10 - 3)   # 7    Subtraction
print(10 * 3)   # 30   Multiplication
print(10 / 3)   # 3.33 Division (always returns float)
print(10 // 3)  # 3    Floor division (rounds down)
print(10 % 3)   # 1    Modulo (remainder)
print(10 ** 3)  # 1000 Exponentiation
```

**Floor division** (`//`) always rounds toward negative infinity:

```python
print(7 // 2)    # 3
print(-7 // 2)   # -4  (rounds down, not toward zero)
```

**Modulo** (`%`) is useful for checking divisibility:

```python
print(10 % 2)  # 0 — 10 is even
print(11 % 2)  # 1 — 11 is odd
```

## Comparison Operators

Comparisons produce `True` or `False`:

```python
x = 10
print(x == 10)   # True   Equal to
print(x != 5)    # True   Not equal to
print(x > 5)     # True   Greater than
print(x < 5)     # False  Less than
print(x >= 10)   # True   Greater than or equal
print(x <= 9)    # False  Less than or equal
```

A common mistake is confusing `=` (assignment) with `==` (comparison):

```python
x = 5     # Assigns 5 to x
x == 5    # Checks if x equals 5 (True)
```

## Logical Operators

Combine boolean values with `and`, `or`, and `not`:

```python
age = 25
has_license = True

print(age >= 18 and has_license)  # True — both must be true
print(age < 18 or has_license)    # True — at least one is true
print(not has_license)             # False — inverts the value
```

**`and`** returns `True` only if both sides are `True`.
**`or`** returns `True` if at least one side is `True`.
**`not`** flips `True` to `False` and vice versa.

## Operator Precedence

Python follows mathematical order of operations (PEMDAS):

1. `**` (exponentiation)
2. `*`, `/`, `//`, `%` (multiplication/division)
3. `+`, `-` (addition/subtraction)
4. `==`, `!=`, `<`, `>`, `<=`, `>=` (comparisons)
5. `not`
6. `and`
7. `or`

```python
result = 2 + 3 * 4     # 14, not 20
result = (2 + 3) * 4   # 20 — parentheses override precedence
```

When in doubt, use parentheses to make your intent clear.

## Augmented Assignment

Shorthand for updating a variable:

```python
score = 100
score += 10   # Same as: score = score + 10 → 110
score -= 5    # Same as: score = score - 5  → 105
score *= 2    # Same as: score = score * 2  → 210
score //= 3   # Same as: score = score // 3 → 70
```

## Common Mistakes

**Integer division surprise:**
```python
print(7 / 2)   # 3.5  (regular division — always float)
print(7 // 2)  # 3    (floor division — always integer)
```

**Chained comparisons work naturally:**
```python
x = 5
print(1 < x < 10)  # True — Python chains comparisons!
```

## Key Takeaways

- Arithmetic: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- Division (`/`) always returns a float; use `//` for integer division
- Comparison operators return `True` or `False`
- `and`, `or`, `not` combine boolean values
- Use parentheses to clarify operator precedence
- Augmented assignment (`+=`, `-=`, etc.) updates variables in place

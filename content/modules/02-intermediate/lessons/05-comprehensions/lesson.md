---
id: "05-comprehensions"
title: "Comprehensions"
concepts:
  - list-comprehensions
  - dict-comprehensions
  - conditional-comprehensions
  - generator-expressions
why: "Comprehensions let you build lists, dicts, and sets in a single readable line. They are one of Python's most distinctive features and replace many common for-loop patterns with cleaner, more Pythonic code."
prerequisites:
  - 04-dictionaries
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 13 - List Comprehension"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Comprehensions"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Comprehensions"
    license: "MIT"
---

# Comprehensions

A **comprehension** is a concise way to create a new collection by transforming and/or filtering an existing one. Python supports list, dict, and set comprehensions.

## List Comprehensions

The basic syntax is `[expression for item in iterable]`:

```python
# Without comprehension
squares = []
for x in range(5):
    squares.append(x ** 2)

# With comprehension
squares = [x ** 2 for x in range(5)]
print(squares)   # [0, 1, 4, 9, 16]
```

Both produce the same result, but the comprehension is shorter and often clearer.

## Adding a Condition (Filtering)

Use `if` to include only items that pass a test:

```python
# Only even numbers
evens = [x for x in range(10) if x % 2 == 0]
print(evens)   # [0, 2, 4, 6, 8]

# Words longer than 3 characters
words = ["hi", "hello", "hey", "greetings"]
long_words = [w for w in words if len(w) > 3]
print(long_words)   # ['hello', 'greetings']
```

## If-Else in Comprehensions

When you want to transform (not filter), put the `if-else` **before** the `for`:

```python
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
print(labels)   # ['even', 'odd', 'even', 'odd', 'even']
```

Note the difference:
- **Filter** (after for): `[x for x in items if condition]` -- skips items
- **Transform** (before for): `[a if condition else b for x in items]` -- keeps all items

## Transforming Data

```python
names = ["alice", "bob", "charlie"]
upper_names = [name.upper() for name in names]
print(upper_names)   # ['ALICE', 'BOB', 'CHARLIE']

temps_f = [32, 68, 100, 212]
temps_c = [(f - 32) * 5 / 9 for f in temps_f]
print(temps_c)   # [0.0, 20.0, 37.77..., 100.0]
```

## Nested Loops in Comprehensions

```python
# All combinations
pairs = [(x, y) for x in range(3) for y in range(3)]
print(pairs)
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# Flattening a matrix
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [num for row in matrix for num in row]
print(flat)   # [1, 2, 3, 4, 5, 6]
```

## Dictionary Comprehensions

Use `{key: value for item in iterable}`:

```python
# Square mapping
squares = {x: x ** 2 for x in range(5)}
print(squares)   # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Swap keys and values
original = {"a": 1, "b": 2, "c": 3}
flipped = {v: k for k, v in original.items()}
print(flipped)   # {1: 'a', 2: 'b', 3: 'c'}

# Filter a dictionary
scores = {"alice": 95, "bob": 60, "charlie": 85}
passing = {name: score for name, score in scores.items() if score >= 70}
print(passing)   # {'alice': 95, 'charlie': 85}
```

## Set Comprehensions

Use `{expression for item in iterable}`:

```python
words = ["hello", "world", "hello", "python"]
unique_lengths = {len(w) for w in words}
print(unique_lengths)   # {5, 6}
```

## Generator Expressions

Replace the brackets with parentheses for a **generator** -- it produces values one at a time instead of building the whole list in memory:

```python
total = sum(x ** 2 for x in range(1000000))  # No list created!
print(total)

# Generators are lazy — good for large data
gen = (x ** 2 for x in range(5))
print(next(gen))   # 0
print(next(gen))   # 1
```

## Common Mistakes

**Too complex -- use a regular loop instead:**
```python
# Hard to read:
result = [x * y for x in range(10) for y in range(10) if x != y and x + y > 5]

# Clearer as a loop:
result = []
for x in range(10):
    for y in range(10):
        if x != y and x + y > 5:
            result.append(x * y)
```

**Confusing filter vs transform placement:**
```python
# Filter (after for): skip items where condition is False
[x for x in range(10) if x > 5]       # [6, 7, 8, 9]

# Transform (before for): always include, but choose value
[x if x > 5 else 0 for x in range(10)]  # [0, 0, 0, 0, 0, 0, 6, 7, 8, 9]
```

## Key Takeaways

- List comprehensions replace append-in-a-loop patterns: `[expr for x in items]`
- Add `if` after `for` to filter; add `if-else` before `for` to transform
- Dict comprehensions: `{k: v for item in iterable}`
- Set comprehensions: `{expr for item in iterable}`
- Generator expressions use `()` and are memory-efficient for large data
- Keep comprehensions simple -- if it's hard to read, use a regular loop

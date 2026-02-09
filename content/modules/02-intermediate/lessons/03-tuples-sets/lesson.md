---
id: "03-tuples-sets"
title: "Tuples and Sets"
concepts:
  - tuples
  - sets
  - hashability
  - set-operations
why: "Tuples give you immutable sequences perfect for fixed data like coordinates or database rows. Sets give you blazing-fast membership checks and let you find unions, intersections, and differences between collections."
prerequisites:
  - 02-lists
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 6 - Tuples, Day 7 - Sets"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Tuples and Sets"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Sequences"
    license: "MIT"
---

# Tuples and Sets

Python has four built-in collection types. You already know lists and strings. Now meet **tuples** (immutable sequences) and **sets** (unordered collections of unique elements).

## Tuples

A tuple is like a list, but **immutable** -- once created, you cannot change its contents.

### Creating Tuples

```python
point = (3, 5)
rgb = (255, 128, 0)
single = (42,)         # Note the comma! Without it, (42) is just 42.
empty = ()
packed = 1, 2, 3       # Parentheses are optional
print(type(packed))    # <class 'tuple'>
```

### Accessing Elements

```python
colors = ("red", "green", "blue")
print(colors[0])     # red
print(colors[-1])    # blue
print(colors[0:2])   # ('red', 'green')
```

### Tuples Are Immutable

```python
point = (3, 5)
# point[0] = 10   # TypeError: 'tuple' does not support item assignment
```

### Tuple Unpacking

One of the most useful tuple features -- assigning each element to a variable:

```python
point = (3, 5)
x, y = point
print(x)   # 3
print(y)   # 5

# Swap variables without a temp variable
a, b = 1, 2
a, b = b, a
print(a, b)   # 2 1
```

### When to Use Tuples vs Lists

- **Tuples**: fixed data (coordinates, RGB colors, database rows, dictionary keys)
- **Lists**: collections that change (adding, removing, sorting)

Tuples are slightly faster and use less memory than lists. They can also be used as dictionary keys (lists cannot).

## Sets

A set is an **unordered** collection of **unique** elements.

### Creating Sets

```python
fruits = {"apple", "banana", "cherry"}
numbers = {1, 2, 3, 2, 1}     # Duplicates are removed
print(numbers)                  # {1, 2, 3}

empty_set = set()               # NOT {} — that creates an empty dict!
from_list = set([1, 2, 2, 3])  # Convert list to set
print(from_list)                # {1, 2, 3}
```

### Adding and Removing

```python
colors = {"red", "green"}
colors.add("blue")
print(colors)             # {'red', 'green', 'blue'}

colors.discard("green")   # Remove (no error if missing)
colors.remove("red")      # Remove (KeyError if missing)
print(colors)             # {'blue'}
```

### Membership Testing (Very Fast)

Sets use hash tables, making `in` checks much faster than lists:

```python
big_set = set(range(1000000))
print(999999 in big_set)   # True — almost instant
```

### Set Operations

This is where sets really shine:

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)    # Union:        {1, 2, 3, 4, 5, 6}
print(a & b)    # Intersection: {3, 4}
print(a - b)    # Difference:   {1, 2}
print(b - a)    # Difference:   {5, 6}
print(a ^ b)    # Symmetric difference: {1, 2, 5, 6}
```

You can also use method syntax:

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a.union(b))              # {1, 2, 3, 4, 5, 6}
print(a.intersection(b))      # {3, 4}
print(a.difference(b))        # {1, 2}
print(a.symmetric_difference(b))  # {1, 2, 5, 6}
```

### Subset and Superset

```python
a = {1, 2, 3}
b = {1, 2, 3, 4, 5}

print(a.issubset(b))    # True — all of a is in b
print(b.issuperset(a))  # True — b contains all of a
print(a.isdisjoint({4, 5}))  # True — no common elements
```

## Hashability

Only **hashable** objects can be set elements or dictionary keys. Immutable types (int, float, str, tuple) are hashable. Mutable types (list, dict, set) are not:

```python
valid = {1, "hello", (1, 2)}   # All hashable
# invalid = {[1, 2]}           # TypeError: unhashable type: 'list'
```

## Common Mistakes

**Creating an empty set wrong:**
```python
not_a_set = {}           # This is an empty DICT
actual_set = set()       # This is an empty SET
```

**Forgetting that sets are unordered:**
```python
s = {3, 1, 2}
# s[0]  # TypeError: 'set' does not support indexing
```

**Forgetting the comma in single-element tuples:**
```python
t = (42)     # This is just the integer 42
t = (42,)    # THIS is a tuple containing 42
```

## Key Takeaways

- Tuples are immutable sequences; use them for fixed data and as dict keys
- Tuple unpacking (`x, y = point`) is a powerful Python idiom
- Sets store unique elements and provide fast membership testing
- Set operations (union, intersection, difference) solve many real problems
- Only hashable (immutable) objects can go in sets or be dict keys
- Use `set()` for empty sets, not `{}`

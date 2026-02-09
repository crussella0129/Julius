---
id: "04-dictionaries"
title: "Dictionaries"
concepts:
  - dict-creation
  - dict-methods
  - dict-iteration
  - nested-dicts
why: "Dictionaries map keys to values, making them the go-to structure for lookups, configurations, JSON data, and any situation where you need to associate one piece of data with another."
prerequisites:
  - 03-tuples-sets
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 8 - Dictionaries"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Dictionaries"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Dictionaries"
    license: "MIT"
---

# Dictionaries

A **dictionary** is an unordered collection of **key-value pairs**. Think of it like a real dictionary: you look up a word (the key) and get its definition (the value).

## Creating Dictionaries

```python
person = {"name": "Alice", "age": 30, "city": "Portland"}
scores = {"math": 95, "english": 87, "science": 92}
empty = {}
```

Keys must be hashable (strings, numbers, tuples). Values can be anything.

## Accessing Values

```python
person = {"name": "Alice", "age": 30}

print(person["name"])      # Alice
# print(person["email"])   # KeyError!

# Safer access with .get()
print(person.get("name"))      # Alice
print(person.get("email"))     # None (no error)
print(person.get("email", "N/A"))  # N/A (custom default)
```

## Adding and Updating

```python
person = {"name": "Alice", "age": 30}

person["email"] = "alice@example.com"   # Add new key
person["age"] = 31                       # Update existing key
print(person)
# {'name': 'Alice', 'age': 31, 'email': 'alice@example.com'}

# Update multiple keys at once
person.update({"age": 32, "city": "Portland"})
print(person["age"])    # 32
print(person["city"])   # Portland
```

## Removing Items

```python
person = {"name": "Alice", "age": 30, "city": "Portland"}

del person["city"]                # Remove by key
print(person)                     # {'name': 'Alice', 'age': 30}

age = person.pop("age")          # Remove and return value
print(age)                        # 30
print(person)                     # {'name': 'Alice'}

value = person.pop("missing", "default")  # No error with default
print(value)                      # default
```

## Dictionary Methods

```python
person = {"name": "Alice", "age": 30, "city": "Portland"}

print(person.keys())     # dict_keys(['name', 'age', 'city'])
print(person.values())   # dict_values(['Alice', 30, 'Portland'])
print(person.items())    # dict_items([('name', 'Alice'), ('age', 30), ('city', 'Portland')])
```

## Iterating Over Dictionaries

```python
person = {"name": "Alice", "age": 30, "city": "Portland"}

# Iterate over keys (default)
for key in person:
    print(key)

# Iterate over values
for value in person.values():
    print(value)

# Iterate over key-value pairs
for key, value in person.items():
    print(f"{key}: {value}")
```

## Checking Membership

```python
person = {"name": "Alice", "age": 30}

print("name" in person)     # True
print("email" in person)    # False
print("Alice" in person)    # False — checks KEYS, not values
```

## Nested Dictionaries

Dictionaries can contain other dictionaries:

```python
students = {
    "alice": {"grade": "A", "age": 20},
    "bob": {"grade": "B", "age": 22},
}

print(students["alice"]["grade"])   # A

# Adding to nested dict
students["charlie"] = {"grade": "A", "age": 21}
```

## Building Dictionaries

```python
# From a list of tuples
pairs = [("a", 1), ("b", 2), ("c", 3)]
d = dict(pairs)
print(d)   # {'a': 1, 'b': 2, 'c': 3}

# From two parallel lists using zip
keys = ["name", "age", "city"]
values = ["Alice", 30, "Portland"]
person = dict(zip(keys, values))
print(person)  # {'name': 'Alice', 'age': 30, 'city': 'Portland'}

# Using fromkeys
defaults = dict.fromkeys(["a", "b", "c"], 0)
print(defaults)  # {'a': 0, 'b': 0, 'c': 0}
```

## Counting with Dictionaries

A very common pattern:

```python
text = "hello world"
counts = {}
for char in text:
    counts[char] = counts.get(char, 0) + 1
print(counts)
# {'h': 1, 'e': 1, 'l': 3, 'o': 2, ' ': 1, 'w': 1, 'r': 1, 'd': 1}
```

## Common Mistakes

**Using `[]` on a missing key:**
```python
d = {"a": 1}
# print(d["b"])   # KeyError
print(d.get("b", 0))  # 0 — safe
```

**Checking for values instead of keys:**
```python
d = {"name": "Alice"}
print("Alice" in d)   # False — `in` checks keys!
print("Alice" in d.values())  # True
```

## Key Takeaways

- Dictionaries store key-value pairs; keys must be hashable
- Use `.get(key, default)` to avoid KeyError on missing keys
- `.keys()`, `.values()`, `.items()` give you different views
- `for key, value in d.items()` is the standard iteration pattern
- `in` checks keys, not values
- Nested dicts are common for structured data (like JSON)

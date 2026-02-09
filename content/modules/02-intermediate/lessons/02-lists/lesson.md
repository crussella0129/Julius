---
id: "02-lists"
title: "Lists and List Operations"
concepts:
  - list-creation
  - list-methods
  - list-mutability
  - list-indexing
why: "Lists are Python's most versatile data structure. Almost every real program needs to store and process collections of items -- from user inputs to database results to lines of a file."
prerequisites:
  - 01-strings-deep
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 5 - Lists"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Lists"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Lists"
    license: "MIT"
---

# Lists and List Operations

A **list** is an ordered, mutable collection of items. Lists can hold any type, and they can even mix types (though usually you won't).

## Creating Lists

```python
numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Charlie"]
mixed = [1, "hello", True, 3.14]
empty = []
```

## Indexing and Slicing

Lists use the same indexing and slicing as strings:

```python
colors = ["red", "green", "blue", "yellow"]
print(colors[0])      # red
print(colors[-1])     # yellow
print(colors[1:3])    # ['green', 'blue']
```

## Lists Are Mutable

Unlike strings, you **can** change list elements in place:

```python
fruits = ["apple", "banana", "cherry"]
fruits[1] = "blueberry"
print(fruits)   # ['apple', 'blueberry', 'cherry']
```

## Adding Elements

```python
pets = ["cat", "dog"]
pets.append("fish")          # Add to end
print(pets)                  # ['cat', 'dog', 'fish']

pets.insert(1, "hamster")    # Insert at index 1
print(pets)                  # ['cat', 'hamster', 'dog', 'fish']

pets.extend(["bird", "snake"])  # Add multiple items
print(pets)                  # ['cat', 'hamster', 'dog', 'fish', 'bird', 'snake']
```

## Removing Elements

```python
items = ["a", "b", "c", "d", "e"]

items.remove("c")       # Remove by value (first occurrence)
print(items)             # ['a', 'b', 'd', 'e']

popped = items.pop()     # Remove and return last item
print(popped)            # e
print(items)             # ['a', 'b', 'd']

popped = items.pop(0)    # Remove and return item at index 0
print(popped)            # a
print(items)             # ['b', 'd']
```

## Useful List Operations

```python
numbers = [3, 1, 4, 1, 5, 9]

print(len(numbers))       # 6
print(min(numbers))       # 1
print(max(numbers))       # 9
print(sum(numbers))       # 23
print(sorted(numbers))    # [1, 1, 3, 4, 5, 9] (new list)
print(numbers)            # [3, 1, 4, 1, 5, 9] (unchanged)

numbers.sort()             # Sorts in place
print(numbers)             # [1, 1, 3, 4, 5, 9]

numbers.reverse()          # Reverses in place
print(numbers)             # [9, 5, 4, 3, 1, 1]
```

## Checking Membership

```python
colors = ["red", "green", "blue"]
print("red" in colors)      # True
print("yellow" in colors)   # False
print("red" not in colors)  # False
```

## Iterating Over Lists

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)

# With index using enumerate
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
```

## Copying Lists

Assigning a list to a new variable creates a **reference**, not a copy:

```python
a = [1, 2, 3]
b = a           # b points to the SAME list
b.append(4)
print(a)        # [1, 2, 3, 4] — a is also changed!
```

To make an independent copy:

```python
a = [1, 2, 3]
b = a.copy()    # Or: b = a[:] or b = list(a)
b.append(4)
print(a)        # [1, 2, 3] — a is unchanged
print(b)        # [1, 2, 3, 4]
```

## Nested Lists

Lists can contain other lists:

```python
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
print(matrix[0])      # [1, 2, 3]
print(matrix[1][2])   # 6
```

## Common Mistakes

**Modifying a list while iterating:**
```python
numbers = [1, 2, 3, 4, 5]
# DON'T do this:
# for n in numbers:
#     if n % 2 == 0:
#         numbers.remove(n)  # Skips elements!

# DO this instead:
numbers = [n for n in numbers if n % 2 != 0]
```

**Confusing `sort()` and `sorted()`:**
```python
nums = [3, 1, 2]
result = nums.sort()  # Returns None, modifies nums in place
print(result)          # None

nums = [3, 1, 2]
result = sorted(nums)  # Returns new list, nums unchanged
print(result)           # [1, 2, 3]
```

## Key Takeaways

- Lists are ordered, mutable sequences created with `[]`
- Use `append()`, `insert()`, and `extend()` to add elements
- Use `remove()`, `pop()`, and `del` to remove elements
- `sort()` modifies in place (returns None); `sorted()` returns a new list
- Assigning a list creates a reference -- use `.copy()` for independent copies
- `len()`, `min()`, `max()`, `sum()` work on lists

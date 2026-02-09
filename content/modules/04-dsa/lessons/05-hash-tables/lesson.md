---
id: "05-hash-tables"
title: "Hash Tables"
concepts:
  - hash-function
  - collision-handling
  - dict-internals
  - frequency-counting
why: "Hash tables power Python's dict and set, giving O(1) average-case lookups -- understanding them is essential for writing efficient code."
prerequisites:
  - 04-stacks-queues
sources:
  - repo: "TheAlgorithms/Python"
    section: "Data Structures - Hash Table"
    license: "MIT"
  - repo: "donnemartin/interactive-coding-challenges"
    section: "Hash Tables"
    license: "Apache-2.0"
---

# Hash Tables

A hash table stores key-value pairs and provides O(1) average-time lookups, insertions, and deletions. Python's `dict` and `set` are both implemented as hash tables.

## How Hash Tables Work

1. A **hash function** converts a key into an integer (the hash).
2. The hash is mapped to an index in an internal array (the bucket).
3. The value is stored at that index.

```python
# Python's built-in hash function
print(hash("hello"))   # some large integer
print(hash(42))        # 42
print(hash((1, 2)))    # tuples are hashable
# hash([1, 2])         # TypeError: lists are NOT hashable
```

## Building a Simple Hash Table

```python
class SimpleHashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def put(self, key, value):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                self.table[idx][i] = (key, value)
                return
        self.table[idx].append((key, value))

    def get(self, key):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key:
                return v
        raise KeyError(key)
```

Each bucket is a list of (key, value) pairs. This is called **chaining**.

## Collision Handling

A **collision** occurs when two different keys hash to the same bucket.

**Chaining** (used above): each bucket holds a list of entries. Worst case is O(n) if all keys collide, but with a good hash function this is rare.

**Open addressing** (used by CPython's dict): if a slot is taken, probe the next slot using a formula. Python uses a sophisticated probing sequence to minimize clustering.

## Python Dict Internals

Python's `dict` is heavily optimized:

```python
# O(1) average for all operations
d = {}
d["name"] = "Alice"     # insert: O(1)
print(d["name"])         # lookup: O(1)
del d["name"]            # delete: O(1)
print("name" in d)       # membership: O(1)
```

Dicts preserve insertion order (guaranteed since Python 3.7). They automatically resize when the load factor exceeds about 2/3.

## Frequency Counting

The most common hash table pattern: count occurrences.

```python
def char_frequency(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq

print(char_frequency("banana"))
# {'b': 1, 'a': 3, 'n': 2}
```

Or use `collections.Counter`:

```python
from collections import Counter
print(Counter("banana"))
# Counter({'a': 3, 'n': 2, 'b': 1})
```

## Two Sum with a Hash Table

The classic problem solved in O(n) time:

```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
```

Without a hash table, you would need O(n^2) with nested loops.

## Sets: Hash Tables Without Values

A `set` is a hash table that stores only keys (no values):

```python
# O(1) membership testing
primes = {2, 3, 5, 7, 11}
print(5 in primes)    # True
print(4 in primes)    # False

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a & b)  # {3, 4} intersection
print(a | b)  # {1, 2, 3, 4, 5, 6} union
print(a - b)  # {1, 2} difference
```

## Hashability Rules

To be used as a dict key or set element, an object must be **hashable**:
- Immutable types are hashable: `int`, `float`, `str`, `tuple` (if contents are hashable), `frozenset`.
- Mutable types are NOT hashable: `list`, `dict`, `set`.

```python
# Valid dict keys
d = {(1, 2): "tuple", "hello": "string", 42: "int"}

# Invalid -- raises TypeError
# d = {[1, 2]: "list"}
```

## Common Mistakes

**Mistake: using `defaultdict` without importing it**
```python
from collections import defaultdict
freq = defaultdict(int)  # missing values default to 0
```

**Mistake: assuming dict keys are sorted**
```python
# Dicts preserve insertion order, not sorted order
d = {3: "c", 1: "a", 2: "b"}
print(list(d.keys()))  # [3, 1, 2] -- insertion order
```

## Key Takeaways

- Hash tables provide O(1) average-case lookups, inserts, and deletes.
- Python `dict` uses open addressing; custom hash tables often use chaining.
- Frequency counting with `dict.get(key, 0)` or `Counter` is a universal pattern.
- Only immutable (hashable) objects can be dict keys or set elements.
- Two Sum is the classic demonstration of trading space for time with a hash table.

---
id: "01-complexity"
title: "Time and Space Complexity"
concepts:
  - big-o-notation
  - time-complexity
  - space-complexity
  - common-complexities
why: "Understanding complexity lets you predict how your code scales and choose the right algorithm before you start coding."
prerequisites:
  - 07-concurrency
sources:
  - repo: "TheAlgorithms/Python"
    section: "Big-O Analysis"
    license: "MIT"
  - repo: "donnemartin/interactive-coding-challenges"
    section: "Big-O"
    license: "Apache-2.0"
---

# Time and Space Complexity

When you write code, it is not enough for it to be correct. You also need to know how fast it runs and how much memory it uses, especially as your data grows.

## What Is Big-O Notation?

Big-O describes how an algorithm's running time or memory usage grows relative to the input size `n`. It captures the **worst-case** upper bound, ignoring constants and lower-order terms.

```python
# O(1) - Constant time: doesn't depend on n
def get_first(items):
    return items[0]

# O(n) - Linear time: grows proportionally with n
def find_max(items):
    biggest = items[0]
    for item in items:
        if item > biggest:
            biggest = item
    return biggest
```

## Common Complexities

From fastest to slowest growth:

| Big-O | Name | Example |
|-------|------|---------|
| O(1) | Constant | Dictionary lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop through data |
| O(n log n) | Linearithmic | Merge sort, Tim sort |
| O(n^2) | Quadratic | Nested loops |
| O(2^n) | Exponential | Recursive Fibonacci (naive) |
| O(n!) | Factorial | Generating all permutations |

## Analyzing Time Complexity

Count how many times the innermost operation executes as a function of `n`:

```python
# O(n) - one loop
def sum_list(nums):
    total = 0
    for x in nums:       # runs n times
        total += x        # O(1) per iteration
    return total          # Total: O(n)

# O(n^2) - nested loops
def has_duplicate(nums):
    for i in range(len(nums)):        # n times
        for j in range(i + 1, len(nums)):  # up to n times
            if nums[i] == nums[j]:
                return True
    return False                      # Total: O(n^2)
```

## Best, Worst, and Average Case

An algorithm can behave differently depending on the input:

```python
def linear_search(items, target):
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1
```

- **Best case**: O(1) -- target is the first element.
- **Worst case**: O(n) -- target is last or not present.
- **Average case**: O(n) -- on average, you check half the list.

Big-O usually refers to the **worst case** unless stated otherwise.

## Space Complexity

Space complexity measures the additional memory your algorithm uses beyond the input:

```python
# O(1) space - only a few variables
def find_max(nums):
    biggest = nums[0]
    for num in nums:
        if num > biggest:
            biggest = num
    return biggest

# O(n) space - creates a new list of size n
def double_all(nums):
    result = []
    for num in nums:
        result.append(num * 2)
    return result
```

## Simplification Rules

1. **Drop constants**: O(2n) becomes O(n).
2. **Drop lower-order terms**: O(n^2 + n) becomes O(n^2).
3. **Focus on the dominant term**: the one that grows fastest.

```python
# This is O(n), not O(3n + 5)
def example(nums):
    total = 0           # O(1)
    for x in nums:      # O(n)
        total += x
    for x in nums:      # O(n)
        total += x * 2
    for x in nums:      # O(n)
        total += x * 3
    return total         # 3 * O(n) = O(n)
```

## Common Mistakes

**Mistake: confusing O(n) and O(n^2)**
```python
# This looks like two loops, but it is O(n) + O(n) = O(n)
for x in data:
    process(x)
for x in data:
    cleanup(x)

# THIS is O(n^2) because the loops are nested
for x in data:
    for y in data:
        compare(x, y)
```

**Mistake: ignoring hidden costs**
```python
# list.insert(0, x) is O(n) because it shifts all elements
# Doing it n times gives O(n^2) total
for x in range(n):
    my_list.insert(0, x)  # O(n) each call!
```

## Key Takeaways

- Big-O describes how performance scales with input size.
- Always analyze the worst case unless told otherwise.
- O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!).
- Space complexity counts extra memory, not the input itself.
- Drop constants and lower-order terms when simplifying.

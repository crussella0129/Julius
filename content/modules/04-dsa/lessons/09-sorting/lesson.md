---
id: "09-sorting"
title: "Sorting Algorithms"
concepts:
  - merge-sort
  - quick-sort
  - stability
  - comparison-vs-non-comparison
why: "Sorting is the most studied problem in computer science -- understanding how sorts work reveals key algorithm design techniques like divide-and-conquer."
prerequisites:
  - 08-graphs
sources:
  - repo: "TheAlgorithms/Python"
    section: "Sorts"
    license: "MIT"
  - repo: "keon/algorithms"
    section: "Sort"
    license: "MIT"
---

# Sorting Algorithms

Sorting arranges elements in order. Python's built-in `sorted()` and `list.sort()` use **Timsort** (O(n log n)), but understanding classic sorting algorithms teaches divide-and-conquer, recursion, and algorithm analysis.

## Sorting Complexity Overview

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble Sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Selection Sort | O(n^2) | O(n^2) | O(n^2) | O(1) | No |
| Insertion Sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Timsort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

## Merge Sort

Merge sort uses **divide-and-conquer**: split the array in half, sort each half recursively, then merge the sorted halves.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
# [3, 9, 10, 27, 38, 43, 82]
```

**Time**: Always O(n log n). **Space**: O(n) for the merged arrays. **Stable**: Yes.

## Quick Sort

Quick sort picks a **pivot**, partitions elements into those smaller and larger than the pivot, then recursively sorts each partition.

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([38, 27, 43, 3, 9, 82, 10]))
# [3, 9, 10, 27, 38, 43, 82]
```

**Time**: O(n log n) average, O(n^2) worst case (bad pivot choices). **Space**: O(log n) for recursion. **Stable**: No (in typical implementations).

## Stability

A sort is **stable** if equal elements keep their original relative order:

```python
students = [("Alice", 85), ("Bob", 85), ("Charlie", 90)]

# Stable sort by grade preserves original order for ties:
# [("Alice", 85), ("Bob", 85), ("Charlie", 90)]
# Alice stays before Bob because she was first in the input

# Unstable sort might swap Alice and Bob
```

Python's `sorted()` is stable, which is why you can sort by multiple keys:

```python
data = [("B", 2), ("A", 3), ("A", 1)]
result = sorted(data, key=lambda x: x[0])
print(result)  # [('A', 3), ('A', 1), ('B', 2)]
# The two A's keep their relative order from the original
```

## Comparison vs Non-Comparison Sorts

**Comparison sorts** (merge, quick, heap) compare pairs of elements. They cannot beat O(n log n) in the worst case.

**Non-comparison sorts** can beat this limit for specific data types:

**Counting Sort** (O(n + k) where k is the range of values):

```python
def counting_sort(arr, max_val):
    counts = [0] * (max_val + 1)
    for x in arr:
        counts[x] += 1

    result = []
    for val, count in enumerate(counts):
        result.extend([val] * count)

    return result

print(counting_sort([4, 2, 2, 8, 3, 3, 1], 8))
# [1, 2, 2, 3, 3, 4, 8]
```

Non-comparison sorts only work when data has a known, bounded range.

## Insertion Sort -- Simple but Useful

Despite being O(n^2), insertion sort is excellent for small or nearly-sorted data:

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

print(insertion_sort([5, 2, 4, 6, 1, 3]))
# [1, 2, 3, 4, 5, 6]
```

Timsort actually uses insertion sort for small runs, combining it with merge sort for the best of both.

## Python's Built-In Sorting

```python
# sorted() returns a new list
nums = [3, 1, 4, 1, 5]
print(sorted(nums))           # [1, 1, 3, 4, 5]
print(sorted(nums, reverse=True))  # [5, 4, 3, 1, 1]

# .sort() modifies in place
nums.sort()
print(nums)  # [1, 1, 3, 4, 5]

# Custom key function
words = ["banana", "pie", "apple"]
print(sorted(words, key=len))  # ['pie', 'apple', 'banana']
```

## Common Mistakes

**Mistake: choosing the wrong sort**
```python
# For nearly-sorted data, insertion sort is faster than quick sort
# For guaranteed O(n log n), use merge sort (not quick sort)
# For Python code, just use sorted() unless you need to understand internals
```

**Mistake: in-place vs new list confusion**
```python
nums = [3, 1, 2]
result = nums.sort()  # returns None! modifies nums in place
print(result)  # None
# Use sorted(nums) if you need a new sorted list
```

## Key Takeaways

- Merge sort: always O(n log n), stable, O(n) space -- the safe choice.
- Quick sort: O(n log n) average, O(n^2) worst case, not stable -- fast in practice.
- Stability preserves the order of equal elements -- important for multi-key sorting.
- Comparison sorts cannot beat O(n log n); counting sort achieves O(n+k) for bounded integers.
- In Python, always prefer `sorted()` or `.sort()` unless the exercise asks otherwise.

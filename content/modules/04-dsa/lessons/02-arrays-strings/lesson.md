---
id: "02-arrays-strings"
title: "Arrays and String Algorithms"
concepts:
  - two-pointer
  - sliding-window
  - prefix-sum
  - in-place-manipulation
why: "Arrays and strings are the most common data structures in interviews and real code -- mastering a few key techniques unlocks dozens of problems."
prerequisites:
  - 01-complexity
sources:
  - repo: "TheAlgorithms/Python"
    section: "Strings and Arrays"
    license: "MIT"
  - repo: "donnemartin/interactive-coding-challenges"
    section: "Arrays and Strings"
    license: "Apache-2.0"
---

# Arrays and String Algorithms

Python lists act as dynamic arrays, and strings are immutable sequences of characters. Many classic problems can be solved efficiently with a handful of techniques.

## Two-Pointer Technique

Place one pointer at each end and move them inward. This solves many problems in O(n) time.

**Example: Check if a string is a palindrome**

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"))  # True
print(is_palindrome("hello"))    # False
```

**Example: Two sum on a sorted array**

```python
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        elif total < target:
            left += 1
        else:
            right -= 1
    return []

print(two_sum_sorted([1, 3, 5, 7, 11], 10))  # [1, 3]
```

## Sliding Window

Maintain a window of elements that slides across the array. Useful for subarray/substring problems.

**Example: Maximum sum of a subarray of size k**

```python
def max_subarray_sum(nums, k):
    window_sum = sum(nums[:k])
    best = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        best = max(best, window_sum)

    return best

print(max_subarray_sum([2, 1, 5, 1, 3, 2], 3))  # 9 (5+1+3)
```

Instead of recalculating the sum each time (O(n*k)), we slide the window by adding the new element and removing the old one: O(n).

## Prefix Sum

Pre-compute cumulative sums so any range sum becomes a single subtraction.

```python
def build_prefix_sum(nums):
    prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        prefix[i + 1] = prefix[i] + nums[i]
    return prefix

def range_sum(prefix, left, right):
    """Sum of nums[left:right+1] in O(1)."""
    return prefix[right + 1] - prefix[left]

nums = [3, 1, 4, 1, 5, 9]
prefix = build_prefix_sum(nums)
print(range_sum(prefix, 1, 3))  # 1 + 4 + 1 = 6
print(range_sum(prefix, 0, 5))  # 3+1+4+1+5+9 = 23
```

## In-Place Array Manipulation

Modifying an array without extra space keeps space complexity at O(1).

**Example: Reverse a list in place**

```python
def reverse_in_place(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1

data = [1, 2, 3, 4, 5]
reverse_in_place(data)
print(data)  # [5, 4, 3, 2, 1]
```

## String-Specific Tips

Strings in Python are **immutable**. Building a new string character by character with `+=` is O(n^2) because each concatenation creates a new string object. Use a list and `join` instead:

```python
# Slow: O(n^2)
result = ""
for ch in "hello":
    result += ch.upper()

# Fast: O(n)
result = "".join(ch.upper() for ch in "hello")
```

## Common Mistakes

**Mistake: off-by-one in sliding window**
```python
# Window of size k starts at index 0..k-1
# When sliding, add nums[i] and remove nums[i - k], not nums[i - k + 1]
```

**Mistake: modifying a list while iterating by index**
```python
# Removing elements shifts indices -- iterate in reverse or use a new list
```

## Key Takeaways

- Two pointers from opposite ends solve palindrome, pair-sum, and partition problems in O(n).
- Sliding window converts O(n*k) subarray problems into O(n).
- Prefix sums give O(1) range queries after O(n) preprocessing.
- For strings, always prefer `"".join(...)` over repeated `+=`.
- In-place techniques keep space at O(1) using swaps.

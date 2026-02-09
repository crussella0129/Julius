---
id: "10-dynamic-programming"
title: "Dynamic Programming"
concepts:
  - memoization
  - tabulation
  - optimal-substructure
  - overlapping-subproblems
why: "Dynamic programming transforms exponential brute-force solutions into efficient polynomial ones by storing and reusing sub-results."
prerequisites:
  - 09-sorting
sources:
  - repo: "TheAlgorithms/Python"
    section: "Dynamic Programming"
    license: "MIT"
  - repo: "donnemartin/interactive-coding-challenges"
    section: "Recursion and Dynamic Programming"
    license: "Apache-2.0"
---

# Dynamic Programming

Dynamic programming (DP) solves problems by breaking them into overlapping subproblems, solving each once, and storing the results. It turns exponential algorithms into polynomial ones.

## When to Use DP

A problem is a DP candidate when it has:

1. **Optimal substructure**: the optimal solution contains optimal solutions to subproblems.
2. **Overlapping subproblems**: the same subproblems are solved multiple times.

## The Fibonacci Example

Naive recursion computes the same values over and over:

```python
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

# fib_naive(5) makes 15 calls
# fib_naive(30) makes over 2 million calls
# Time: O(2^n) -- exponential!
```

The call tree shows massive duplication: `fib(3)` is computed multiple times when calculating `fib(5)`.

## Top-Down: Memoization

Store results as you compute them (top-down, recursive):

```python
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print(fib_memo(50))  # 12586269025 -- instant!
```

Each subproblem is computed exactly once. **Time: O(n). Space: O(n).**

Python also provides `functools.lru_cache` for automatic memoization:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n <= 1:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

print(fib_cached(100))  # 354224848179261915075
```

## Bottom-Up: Tabulation

Build the solution from the smallest subproblems up (iterative):

```python
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print(fib_tab(50))  # 12586269025
```

**Time: O(n). Space: O(n)**, but can be optimized to O(1):

```python
def fib_optimized(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev2 + prev1
    return prev1

print(fib_optimized(50))  # 12586269025
```

## Classic DP: Climbing Stairs

You can climb 1 or 2 stairs at a time. How many distinct ways to reach step n?

```python
def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print(climb_stairs(5))  # 8
# 5 stairs: 8 ways
```

This is structurally identical to Fibonacci. The key insight: to reach step i, you came from step i-1 (one step) or step i-2 (two steps).

## Classic DP: Coin Change

Find the minimum number of coins to make a given amount:

```python
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1

    return dp[amount] if dp[amount] != float('inf') else -1

print(coin_change([1, 5, 10, 25], 36))  # 3 (25 + 10 + 1)
```

`dp[i]` = minimum coins to make amount `i`. For each amount, try every coin and take the best.

## Classic DP: Longest Common Subsequence

Find the length of the longest subsequence common to two strings:

```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

print(lcs("ABCBDAB", "BDCAB"))  # 4 ("BCAB")
```

## The DP Recipe

1. **Define the subproblem**: what does `dp[i]` represent?
2. **Find the recurrence**: how does `dp[i]` relate to smaller subproblems?
3. **Set base cases**: what are the trivial answers?
4. **Determine the order**: solve smaller subproblems before larger ones.
5. **Optimize space** if possible (do you only need the previous row/value?).

## Common Mistakes

**Mistake: forgetting base cases**
```python
# dp[0] must be set correctly -- it's the foundation everything builds on
```

**Mistake: wrong recurrence direction**
```python
# Make sure you're building from solved subproblems, not unsolved ones
# Bottom-up: iterate forward; Top-down: recurse with memoization
```

## Key Takeaways

- DP applies when a problem has optimal substructure and overlapping subproblems.
- Memoization (top-down): add a cache to a recursive solution.
- Tabulation (bottom-up): fill an array iteratively from base cases.
- Fibonacci, climbing stairs, coin change, and LCS are classic DP patterns.
- Always define what `dp[i]` means before writing the recurrence.
- Space can often be optimized when you only need the previous few values.

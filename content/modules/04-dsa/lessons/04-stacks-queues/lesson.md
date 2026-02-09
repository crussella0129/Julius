---
id: "04-stacks-queues"
title: "Stacks and Queues"
concepts:
  - stack-lifo
  - queue-fifo
  - deque
  - monotonic-stack
why: "Stacks and queues are simple structures with powerful applications -- from undo systems and browser history to BFS and expression parsing."
prerequisites:
  - 03-linked-lists
sources:
  - repo: "TheAlgorithms/Python"
    section: "Data Structures - Stacks and Queues"
    license: "MIT"
  - repo: "keon/algorithms"
    section: "Stack and Queue"
    license: "MIT"
---

# Stacks and Queues

Stacks and queues restrict how you add and remove elements, which makes them both simple and powerful.

## Stacks: Last In, First Out (LIFO)

A stack works like a pile of plates: you can only add or remove from the top.

```python
stack = []
stack.append(1)   # push 1
stack.append(2)   # push 2
stack.append(3)   # push 3
print(stack.pop())  # 3 (last in, first out)
print(stack.pop())  # 2
print(stack)        # [1]
```

**Key operations** (all O(1)):
- `push`: add to the top (`append`)
- `pop`: remove from the top (`pop`)
- `peek`: look at the top without removing (`stack[-1]`)

### Classic Stack Application: Balanced Parentheses

```python
def is_balanced(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0

print(is_balanced("({[]})"))  # True
print(is_balanced("([)]"))    # False
```

## Queues: First In, First Out (FIFO)

A queue works like a line at a store: first person in line gets served first.

**Do not use a list as a queue.** `list.pop(0)` is O(n) because it shifts all elements. Use `collections.deque` instead:

```python
from collections import deque

queue = deque()
queue.append(1)     # enqueue
queue.append(2)
queue.append(3)
print(queue.popleft())  # 1 (first in, first out)
print(queue.popleft())  # 2
print(queue)            # deque([3])
```

**Key operations** (all O(1) with deque):
- `enqueue`: add to the back (`append`)
- `dequeue`: remove from the front (`popleft`)
- `peek`: look at the front (`queue[0]`)

## Deque: Double-Ended Queue

`collections.deque` supports O(1) operations at both ends:

```python
from collections import deque

d = deque([2, 3, 4])
d.appendleft(1)   # [1, 2, 3, 4]
d.append(5)       # [1, 2, 3, 4, 5]
d.popleft()       # removes 1
d.pop()           # removes 5
print(d)          # deque([2, 3, 4])
```

This makes deque suitable as both a stack and a queue.

## Stack with Min in O(1)

Track the minimum at every point by storing (value, current_min) pairs:

```python
class MinStack:
    def __init__(self):
        self.stack = []

    def push(self, val):
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self):
        return self.stack.pop()[0]

    def get_min(self):
        return self.stack[-1][1]

ms = MinStack()
ms.push(5)
ms.push(3)
ms.push(7)
print(ms.get_min())  # 3
ms.pop()
print(ms.get_min())  # 3
ms.pop()
print(ms.get_min())  # 5
```

## Monotonic Stack

A monotonic stack keeps elements in sorted order (either always increasing or always decreasing). It is used to find the next greater or smaller element efficiently.

```python
def next_greater_element(nums):
    result = [-1] * len(nums)
    stack = []  # stores indices

    for i in range(len(nums)):
        while stack and nums[i] > nums[stack[-1]]:
            idx = stack.pop()
            result[idx] = nums[i]
        stack.append(i)

    return result

print(next_greater_element([4, 2, 6, 1, 3]))
# [6, 6, -1, 3, -1]
```

For each element, the next greater element is found in O(1) amortized time, making the total O(n).

## When to Use Each

| Structure | Use When |
|-----------|----------|
| Stack | Undo/redo, bracket matching, DFS, expression evaluation |
| Queue | BFS, task scheduling, print queue, buffering |
| Deque | Sliding window maximum, palindrome checking |
| Monotonic Stack | Next greater/smaller element, histogram area |

## Common Mistakes

**Mistake: using a list as a queue**
```python
# Slow: O(n) per dequeue
queue = [1, 2, 3]
queue.pop(0)  # shifts all elements

# Fast: O(1) per dequeue
from collections import deque
queue = deque([1, 2, 3])
queue.popleft()
```

**Mistake: popping from an empty stack**
```python
# Always check before popping
if stack:
    stack.pop()
```

## Key Takeaways

- Stacks are LIFO: `append()` and `pop()` on a list, both O(1).
- Queues are FIFO: use `collections.deque` with `append()` and `popleft()`, both O(1).
- Never use `list.pop(0)` for a queue -- it is O(n).
- Monotonic stacks solve next-greater/smaller-element problems in O(n).
- A MinStack tracks the minimum at each level by storing (value, current_min) pairs.

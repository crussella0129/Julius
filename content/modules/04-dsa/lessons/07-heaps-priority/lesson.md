---
id: "07-heaps-priority"
title: "Heaps and Priority Queues"
concepts:
  - min-heap
  - max-heap
  - heapq-module
  - heap-sort
why: "Heaps efficiently track the smallest or largest element, powering priority queues, scheduling systems, and classic algorithms like Dijkstra's."
prerequisites:
  - 06-trees
sources:
  - repo: "TheAlgorithms/Python"
    section: "Data Structures - Heap"
    license: "MIT"
  - repo: "keon/algorithms"
    section: "Heap"
    license: "MIT"
---

# Heaps and Priority Queues

A **heap** is a complete binary tree where every parent is smaller (min-heap) or larger (max-heap) than its children. This guarantees that the root is always the extreme value.

## Min-Heap Property

In a min-heap, the smallest element is always at the root:

```
        1
       / \
      3   5
     / \
    7   9
```

Every parent is less than or equal to its children. This does NOT mean the tree is fully sorted -- only the root-to-leaf paths are partially ordered.

## Python's `heapq` Module

Python provides a min-heap through the `heapq` module. It works on regular lists:

```python
import heapq

heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 3)
heapq.heappush(heap, 7)
heapq.heappush(heap, 1)

print(heap[0])           # 1 (peek at minimum)
print(heapq.heappop(heap))  # 1 (remove minimum)
print(heapq.heappop(heap))  # 3
print(heapq.heappop(heap))  # 5
```

**Key operations:**
| Operation | Time |
|-----------|------|
| `heappush` | O(log n) |
| `heappop` | O(log n) |
| `heap[0]` (peek) | O(1) |
| `heapify` (build heap) | O(n) |

## Building a Heap from a List

```python
import heapq

data = [9, 4, 7, 1, 3]
heapq.heapify(data)
print(data)  # [1, 3, 7, 9, 4] -- heap-ordered, not sorted

# Pop all elements to get sorted order
sorted_data = []
while data:
    sorted_data.append(heapq.heappop(data))
print(sorted_data)  # [1, 3, 4, 7, 9]
```

`heapify` transforms a list into a heap in O(n) time, which is faster than pushing n elements one by one (O(n log n)).

## Simulating a Max-Heap

Python only provides a min-heap. To get a max-heap, negate the values:

```python
import heapq

max_heap = []
for val in [3, 1, 4, 1, 5]:
    heapq.heappush(max_heap, -val)

print(-heapq.heappop(max_heap))  # 5 (largest)
print(-heapq.heappop(max_heap))  # 4
```

## Finding the K Largest / Smallest

```python
import heapq

data = [10, 4, 3, 8, 2, 6, 1, 7, 9, 5]

print(heapq.nsmallest(3, data))  # [1, 2, 3]
print(heapq.nlargest(3, data))   # [10, 9, 8]
```

For small k relative to n, `nsmallest` and `nlargest` are efficient at O(n log k).

## Heap Sort

Heap sort works by building a heap, then repeatedly extracting the minimum:

```python
import heapq

def heap_sort(data):
    heap = data[:]
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]

print(heap_sort([5, 3, 8, 1, 2]))  # [1, 2, 3, 5, 8]
```

Time complexity: O(n log n). Space: O(n) for this version (in-place heap sort exists but is more complex).

## Priority Queue Pattern

Use a heap as a priority queue where lower numbers mean higher priority:

```python
import heapq

tasks = []
heapq.heappush(tasks, (3, "low priority task"))
heapq.heappush(tasks, (1, "urgent task"))
heapq.heappush(tasks, (2, "medium task"))

while tasks:
    priority, name = heapq.heappop(tasks)
    print(f"Processing: {name}")
```

Output:
```
Processing: urgent task
Processing: medium task
Processing: low priority task
```

## Merge K Sorted Lists

`heapq.merge` efficiently merges pre-sorted iterables:

```python
import heapq

list1 = [1, 4, 7]
list2 = [2, 5, 8]
list3 = [3, 6, 9]

merged = list(heapq.merge(list1, list2, list3))
print(merged)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

## Common Mistakes

**Mistake: treating a heapified list as sorted**
```python
# heapify gives heap order, NOT sorted order
data = [5, 3, 1, 4, 2]
heapq.heapify(data)
print(data)  # [1, 3, 5, 4, 2] -- NOT [1, 2, 3, 4, 5]
```

**Mistake: forgetting heapq is min-heap only**
```python
# For max-heap behavior, negate values or use nlargest
```

## Key Takeaways

- A heap is a complete binary tree with the min (or max) always at the root.
- Python's `heapq` is a min-heap: `heappush` and `heappop` are O(log n), peek is O(1).
- For a max-heap, negate values before pushing and after popping.
- `heapify` converts a list to a heap in O(n).
- Heaps power priority queues, heap sort, and k-smallest/k-largest queries.

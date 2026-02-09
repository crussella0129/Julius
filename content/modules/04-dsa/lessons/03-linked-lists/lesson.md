---
id: "03-linked-lists"
title: "Linked Lists"
concepts:
  - singly-linked-list
  - doubly-linked-list
  - node-traversal
  - insertion-deletion
why: "Linked lists teach pointer-based thinking and are the foundation for stacks, queues, and many tree structures."
prerequisites:
  - 02-arrays-strings
sources:
  - repo: "TheAlgorithms/Python"
    section: "Data Structures - Linked List"
    license: "MIT"
  - repo: "keon/algorithms"
    section: "Linked List"
    license: "MIT"
---

# Linked Lists

A linked list stores elements in **nodes** that are chained together by references (pointers). Unlike arrays, linked lists do not store elements in contiguous memory, so insertion and deletion at known positions are O(1).

## The Node Class

Every linked list is built from nodes. Each node holds a value and a reference to the next node:

```python
class Node:
    def __init__(self, val, next_node=None):
        self.val = val
        self.next = next_node
```

## Singly Linked List

In a singly linked list, each node points forward to the next node. The last node points to `None`.

```python
class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        new_node = Node(val)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def display(self):
        parts = []
        current = self.head
        while current:
            parts.append(str(current.val))
            current = current.next
        print(" -> ".join(parts))
```

```python
ll = LinkedList()
ll.append(1)
ll.append(2)
ll.append(3)
ll.display()  # 1 -> 2 -> 3
```

## Traversal

Walking through a linked list always follows the same pattern:

```python
def count_nodes(head):
    count = 0
    current = head
    while current:
        count += 1
        current = current.next
    return count
```

This is O(n) -- you must visit every node since there is no random access.

## Insertion

**At the beginning (O(1)):**

```python
def prepend(self, val):
    new_node = Node(val)
    new_node.next = self.head
    self.head = new_node
```

**At a specific position (O(n) to find the spot, O(1) to insert):**

```python
def insert_after(self, target_val, new_val):
    current = self.head
    while current:
        if current.val == target_val:
            new_node = Node(new_val, current.next)
            current.next = new_node
            return
        current = current.next
```

## Deletion

Remove a node by updating the previous node's `next` pointer to skip over it:

```python
def delete(self, val):
    if self.head and self.head.val == val:
        self.head = self.head.next
        return
    current = self.head
    while current and current.next:
        if current.next.val == val:
            current.next = current.next.next
            return
        current = current.next
```

## Doubly Linked List

Each node has both `next` and `prev` pointers, allowing traversal in both directions:

```python
class DNode:
    def __init__(self, val, prev_node=None, next_node=None):
        self.val = val
        self.prev = prev_node
        self.next = next_node
```

Advantages over singly linked: O(1) deletion if you have a reference to the node, and backward traversal. The cost is extra memory for the `prev` pointer.

## The Runner (Fast/Slow Pointer) Technique

Use two pointers moving at different speeds to solve cycle detection and midpoint problems:

```python
def find_middle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

# Build: 1 -> 2 -> 3 -> 4 -> 5
head = Node(1, Node(2, Node(3, Node(4, Node(5)))))
print(find_middle(head))  # 3
```

The slow pointer moves one step, fast moves two. When fast reaches the end, slow is at the middle.

## Comparison: Array vs Linked List

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at beginning | O(n) | O(1) |
| Insert at end | O(1) amortized | O(n) or O(1) with tail |
| Delete by value | O(n) | O(n) search + O(1) delete |
| Memory | Contiguous | Scattered, extra pointer overhead |

## Common Mistakes

**Mistake: losing the reference to the rest of the list**
```python
# Wrong: this orphans everything after current
current.next = new_node
# Right: first link new_node to the rest
new_node.next = current.next
current.next = new_node
```

**Mistake: not handling the empty list case**
```python
# Always check if self.head is None before traversing
```

## Key Takeaways

- Linked lists are chains of Node objects connected by `.next` references.
- Traversal is always O(n) -- no random access.
- Insertion and deletion at a known position are O(1).
- The fast/slow pointer technique finds midpoints and detects cycles.
- Doubly linked lists trade memory for bidirectional traversal.

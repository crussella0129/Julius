---
id: "06-trees"
title: "Trees and Binary Search Trees"
concepts:
  - binary-tree
  - bst
  - tree-traversal
  - recursion-on-trees
why: "Trees model hierarchical data from file systems to databases, and tree traversals are foundational for recursive problem-solving."
prerequisites:
  - 05-hash-tables
sources:
  - repo: "TheAlgorithms/Python"
    section: "Data Structures - Binary Tree"
    license: "MIT"
  - repo: "keon/algorithms"
    section: "Tree"
    license: "MIT"
---

# Trees and Binary Search Trees

A tree is a hierarchical data structure with a **root** node and child nodes branching downward. Unlike linked lists (linear), trees branch, making them perfect for hierarchical data.

## Binary Tree Basics

In a **binary tree**, each node has at most two children: left and right.

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

```python
#       1
#      / \
#     2   3
#    / \
#   4   5

root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3)
)
```

**Key terms:**
- **Root**: the topmost node (no parent).
- **Leaf**: a node with no children.
- **Depth**: distance from the root (root has depth 0).
- **Height**: longest path from a node to a leaf.

## Tree Traversals

There are three classic ways to visit every node, all using recursion:

### Inorder (Left, Root, Right)

```python
def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.val, end=" ")
    inorder(node.right)

inorder(root)  # 4 2 5 1 3
```

### Preorder (Root, Left, Right)

```python
def preorder(node):
    if node is None:
        return
    print(node.val, end=" ")
    preorder(node.left)
    preorder(node.right)

preorder(root)  # 1 2 4 5 3
```

### Postorder (Left, Right, Root)

```python
def postorder(node):
    if node is None:
        return
    postorder(node.left)
    postorder(node.right)
    print(node.val, end=" ")

postorder(root)  # 4 5 2 3 1
```

**Memory aid:** the name tells you when the root is visited -- **in**order = root in the middle, **pre**order = root first, **post**order = root last.

## Binary Search Tree (BST)

A BST enforces an ordering rule: for every node, all values in the left subtree are smaller, and all values in the right subtree are larger.

```python
#       8
#      / \
#     3   10
#    / \    \
#   1   6    14
```

This ordering makes search O(log n) on a balanced tree:

```python
def bst_search(node, target):
    if node is None:
        return False
    if target == node.val:
        return True
    elif target < node.val:
        return bst_search(node.left, target)
    else:
        return bst_search(node.right, target)
```

### BST Insertion

```python
def bst_insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        node.left = bst_insert(node.left, val)
    else:
        node.right = bst_insert(node.right, val)
    return node
```

### Inorder Traversal of a BST Gives Sorted Order

```python
# Inorder of the BST above: 1 3 6 8 10 14
```

This is a key property: inorder traversal of a valid BST always produces values in ascending order.

## Common Tree Problems

**Tree height:**

```python
def height(node):
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))
```

**Count nodes:**

```python
def count_nodes(node):
    if node is None:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)
```

## Level-Order Traversal (BFS)

Visit nodes level by level using a queue:

```python
from collections import deque

def level_order(root):
    if not root:
        return
    queue = deque([root])
    while queue:
        node = queue.popleft()
        print(node.val, end=" ")
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

level_order(root)  # 1 2 3 4 5
```

## Common Mistakes

**Mistake: forgetting the base case in recursion**
```python
# Without 'if node is None: return', recursion never stops
```

**Mistake: confusing BST property**
```python
# It's not just "left child < parent < right child"
# ALL nodes in left subtree must be less than the root
```

## Key Takeaways

- Binary trees have at most two children per node.
- Traversals: inorder (L-Root-R), preorder (Root-L-R), postorder (L-R-Root).
- BSTs order values so that left < root < right for every subtree.
- BST search and insert are O(log n) when balanced, O(n) when degenerate.
- Inorder traversal of a BST produces sorted output.
- Tree problems almost always use recursion with a base case of `node is None`.

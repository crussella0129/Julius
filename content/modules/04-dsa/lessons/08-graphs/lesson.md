---
id: "08-graphs"
title: "Graphs"
concepts:
  - adjacency-list
  - adjacency-matrix
  - bfs
  - dfs
  - connected-components
why: "Graphs model relationships between things -- social networks, maps, dependencies, and web links all become solvable once you understand BFS and DFS."
prerequisites:
  - 07-heaps-priority
sources:
  - repo: "TheAlgorithms/Python"
    section: "Graphs"
    license: "MIT"
  - repo: "donnemartin/interactive-coding-challenges"
    section: "Graphs and Trees"
    license: "Apache-2.0"
---

# Graphs

A graph consists of **vertices** (nodes) and **edges** (connections between nodes). Unlike trees, graphs can have cycles, multiple paths, and disconnected parts.

## Graph Terminology

- **Directed graph**: edges have a direction (A -> B does not imply B -> A).
- **Undirected graph**: edges go both ways.
- **Weighted graph**: edges have costs/distances.
- **Cycle**: a path that starts and ends at the same node.
- **Connected**: every node is reachable from every other node.

## Representing Graphs

### Adjacency List

The most common representation. A dictionary maps each vertex to its list of neighbors:

```python
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A', 'D'],
    'D': ['B', 'C', 'E'],
    'E': ['D']
}
```

Space: O(V + E) where V is vertices and E is edges.

### Adjacency Matrix

A 2D grid where `matrix[i][j] = 1` means there is an edge from i to j:

```python
#     A  B  C  D  E
# A [ 0, 1, 1, 0, 0 ]
# B [ 1, 0, 0, 1, 0 ]
# C [ 1, 0, 0, 1, 0 ]
# D [ 0, 1, 1, 0, 1 ]
# E [ 0, 0, 0, 1, 0 ]
```

Space: O(V^2). Better for dense graphs; adjacency lists are better for sparse graphs.

## Breadth-First Search (BFS)

BFS explores all neighbors at the current depth before moving deeper. It uses a **queue** and finds the shortest path in unweighted graphs.

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A', 'D'],
    'D': ['B', 'C', 'E'],
    'E': ['D']
}
print(bfs(graph, 'A'))  # ['A', 'B', 'C', 'D', 'E']
```

**Time**: O(V + E). **Space**: O(V).

## Depth-First Search (DFS)

DFS goes as deep as possible before backtracking. It uses a **stack** (or recursion).

### Iterative DFS

```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            order.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)

    return order

print(dfs_iterative(graph, 'A'))  # ['A', 'C', 'D', 'E', 'B']
```

### Recursive DFS

```python
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    print(node, end=" ")
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)

dfs_recursive(graph, 'A')  # A B D C E (order depends on adjacency list)
```

**Time**: O(V + E). **Space**: O(V).

## BFS vs DFS

| Feature | BFS | DFS |
|---------|-----|-----|
| Data structure | Queue | Stack / recursion |
| Explores | Level by level | Branch by branch |
| Shortest path? | Yes (unweighted) | No |
| Uses | Shortest path, level order | Cycle detection, topological sort |

## Connected Components

In an undirected graph, a connected component is a maximal group of nodes that can all reach each other:

```python
def count_components(graph):
    visited = set()
    count = 0

    for node in graph:
        if node not in visited:
            count += 1
            # BFS to mark all nodes in this component
            queue = deque([node])
            visited.add(node)
            while queue:
                current = queue.popleft()
                for neighbor in graph[current]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

    return count

disconnected = {
    1: [2], 2: [1],
    3: [4], 4: [3],
    5: []
}
print(count_components(disconnected))  # 3
```

## Shortest Path with BFS

```python
from collections import deque

def shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = {start}

    while queue:
        node, path = queue.popleft()
        if node == end:
            return path
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))

    return None  # no path exists
```

## Common Mistakes

**Mistake: forgetting the visited set**
```python
# Without tracking visited nodes, BFS/DFS will loop forever in cyclic graphs
```

**Mistake: adding to visited when popping instead of when enqueueing**
```python
# In BFS, mark as visited when adding to queue, not when removing
# Otherwise, the same node can be added multiple times
```

## Key Takeaways

- Graphs have vertices and edges; they can be directed, undirected, weighted, or cyclic.
- Adjacency lists use O(V+E) space and are best for sparse graphs.
- BFS uses a queue, explores level by level, and finds shortest paths.
- DFS uses a stack (or recursion), explores branch by branch.
- Both BFS and DFS run in O(V+E) time.
- Always use a `visited` set to avoid infinite loops in cyclic graphs.

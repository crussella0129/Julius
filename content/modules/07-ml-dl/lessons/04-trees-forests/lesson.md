---
id: "04-trees-forests"
title: "Decision Trees and Random Forests"
concepts:
  - decision-tree
  - information-gain
  - random-forest
  - ensemble-methods
why: "Decision trees are interpretable and powerful, and random forests are one of the most reliable ML algorithms for tabular data."
prerequisites:
  - 03-classification
sources:
  - repo: "rasbt/machine-learning-book"
    section: "A Tour of Machine Learning Classifiers"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Classification"
    license: "MIT"
---

# Decision Trees and Random Forests

Decision trees make predictions by learning a series of if-then rules from data. Random forests combine many trees to make more accurate, robust predictions.

## How Decision Trees Work

A decision tree splits data based on feature values, creating a flowchart-like structure:

```
Is temperature > 75?
├── Yes: Is humidity > 80?
│   ├── Yes: Don't play
│   └── No: Play
└── No: Is wind > 20?
    ├── Yes: Don't play
    └── No: Play
```

Each internal node tests a feature, each branch represents a condition, and each leaf is a prediction.

## Decision Trees in Scikit-learn

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

X = [[75, 80, 10], [80, 90, 5], [65, 70, 15], [70, 65, 20],
     [85, 85, 8], [60, 50, 25], [78, 75, 12], [90, 95, 3]]
y = [1, 0, 1, 1, 0, 1, 1, 0]  # 1=play, 0=don't play

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

tree = DecisionTreeClassifier(max_depth=3, random_state=42)
tree.fit(X_train, y_train)

print(f"Accuracy: {tree.score(X_test, y_test):.2f}")
```

## How Trees Choose Splits

The tree finds the best feature and threshold to split on by maximizing **information gain**. Information gain measures how much a split reduces impurity.

**Gini Impurity**: How often a randomly chosen element would be misclassified.

```python
def gini(labels):
    total = len(labels)
    if total == 0:
        return 0
    counts = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return 1 - sum((c/total)**2 for c in counts.values())

# Pure node: all same class
print(gini(["A", "A", "A"]))  # 0.0

# Impure node: mixed classes
print(gini(["A", "B", "A", "B"]))  # 0.5
```

## Controlling Tree Complexity

Unrestricted trees can overfit by memorizing every training example:

```python
# Prone to overfitting
tree = DecisionTreeClassifier()  # No limits

# Better: limit depth
tree = DecisionTreeClassifier(
    max_depth=5,            # Maximum tree depth
    min_samples_split=10,   # Minimum samples to split a node
    min_samples_leaf=5,     # Minimum samples in a leaf
)
```

## Random Forests

A random forest builds many decision trees and combines their predictions:

1. Create N random subsets of the training data (bootstrap sampling)
2. Train one decision tree on each subset
3. Each tree uses a random subset of features at each split
4. For prediction, all trees vote and the majority wins

```python
from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=10,          # Maximum depth per tree
    random_state=42,
)
forest.fit(X_train, y_train)
print(f"Accuracy: {forest.score(X_test, y_test):.2f}")
```

## Why Random Forests Work Better

Individual trees overfit. By training many trees on different random subsets and averaging their predictions, the random forest:
- Reduces overfitting (low variance)
- Maintains predictive power (low bias)
- Is robust to outliers and noise

## Feature Importance

Trees tell you which features matter most:

```python
importances = forest.feature_importances_
for name, imp in zip(feature_names, importances):
    print(f"{name}: {imp:.3f}")
```

## Decision Trees for Regression

Trees can also predict continuous values:

```python
from sklearn.tree import DecisionTreeRegressor

reg_tree = DecisionTreeRegressor(max_depth=5)
reg_tree.fit(X_train, y_train)
predictions = reg_tree.predict(X_test)
```

## Tree vs Forest Comparison

| Feature | Decision Tree | Random Forest |
|---------|--------------|---------------|
| Interpretability | High | Medium |
| Accuracy | Good | Better |
| Overfitting | Prone | Resistant |
| Speed | Fast | Slower |
| Feature importance | Yes | Yes |

## Key Takeaways

- Decision trees learn if-then rules by finding the best feature splits
- Gini impurity measures how mixed a node's classes are
- Limit tree depth to prevent overfitting
- Random forests combine many trees for better accuracy and robustness
- Feature importance shows which variables the model relies on most

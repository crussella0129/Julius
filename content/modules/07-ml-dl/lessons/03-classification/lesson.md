---
id: "03-classification"
title: "Classification"
concepts:
  - logistic-regression
  - knn-classifier
  - confusion-matrix
  - classification-metrics
why: "Classification is the most common ML task -- from spam detection to medical diagnosis, predicting categories from data is everywhere."
prerequisites:
  - 02-linear-regression
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Training Machine Learning Algorithms for Classification"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Classification"
    license: "MIT"
---

# Classification

Classification predicts which category an input belongs to. Unlike regression (which predicts numbers), classification outputs discrete labels like "spam" or "not spam", "cat" or "dog".

## Logistic Regression

Despite its name, logistic regression is a classification algorithm. It predicts the probability of belonging to a class:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import numpy as np

# Example: predicting pass/fail from study hours and attendance
X = np.array([[2, 60], [3, 70], [5, 80], [7, 90], [1, 50], [4, 75],
              [6, 85], [8, 95], [2, 55], [5, 70]])
y = np.array([0, 0, 1, 1, 0, 1, 1, 1, 0, 1])  # 0=fail, 1=pass

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

print(f"Accuracy: {model.score(X_test, y_test):.2f}")
```

## K-Nearest Neighbors (KNN)

KNN classifies by finding the k closest training examples and voting:

```python
from sklearn.neighbors import KNeighborsClassifier

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# For a new point, find 3 nearest neighbors and take majority vote
prediction = knn.predict([[4, 72]])
print(f"Prediction: {prediction[0]}")
```

How it works:
1. Calculate distance from new point to all training points
2. Find the k nearest neighbors
3. The most common label among neighbors is the prediction

## Distance Metrics

KNN uses distance to find neighbors:

```python
import math

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))

# Distance between (2, 3) and (5, 7)
d = euclidean_distance([2, 3], [5, 7])
print(f"Distance: {d:.2f}")  # 5.00
```

## Confusion Matrix

A confusion matrix shows how predictions compare to actual labels:

```
                Predicted
              Pos    Neg
Actual  Pos   TP     FN
        Neg   FP     TN
```

- **TP** (True Positive): Correctly predicted positive
- **TN** (True Negative): Correctly predicted negative
- **FP** (False Positive): Incorrectly predicted positive (Type I error)
- **FN** (False Negative): Incorrectly predicted negative (Type II error)

```python
from sklearn.metrics import confusion_matrix, classification_report

y_pred = model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)
print(cm)
print(classification_report(y_test, y_pred))
```

## Classification Metrics

```python
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

accuracy = accuracy_score(y_test, y_pred)    # Correct / Total
precision = precision_score(y_test, y_pred)  # TP / (TP + FP)
recall = recall_score(y_test, y_pred)        # TP / (TP + FN)
f1 = f1_score(y_test, y_pred)               # Harmonic mean of precision & recall
```

- **Accuracy**: Overall correctness
- **Precision**: Of those predicted positive, how many are correct?
- **Recall**: Of all actual positives, how many were found?
- **F1 Score**: Balance between precision and recall

## Multi-class Classification

When there are more than two classes:

```python
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target  # 3 classes: setosa, versicolor, virginica

model = LogisticRegression(max_iter=200)
model.fit(X_train, y_train)
```

## Choosing the Right Metric

| Scenario | Best Metric |
|----------|------------|
| Balanced classes | Accuracy |
| Imbalanced classes | F1, Precision, or Recall |
| Cost of false positive is high | Precision |
| Cost of false negative is high | Recall |

## Key Takeaways

- Classification predicts categories; logistic regression gives probabilities
- KNN classifies by majority vote of nearest neighbors
- The confusion matrix breaks down TP, TN, FP, FN
- Precision, recall, and F1 are critical for imbalanced datasets
- Choose metrics based on the cost of different types of errors

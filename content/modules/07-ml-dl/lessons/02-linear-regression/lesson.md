---
id: "02-linear-regression"
title: "Linear Regression"
concepts:
  - linear-model
  - cost-function
  - gradient-descent
  - sklearn-regression
why: "Linear regression is the simplest ML algorithm and the foundation for understanding all others -- if you understand it deeply, everything else builds on top."
prerequisites:
  - 01-ml-concepts
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Training Simple Machine Learning Algorithms"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Regression"
    license: "MIT"
---

# Linear Regression

Linear regression finds the best straight line through your data points. It predicts a continuous output (like price, temperature, or score) from one or more input features.

## The Idea

Given data points, find the line `y = mx + b` that best fits them:

- `m` is the **slope** (how much y changes per unit of x)
- `b` is the **intercept** (where the line crosses the y-axis)

```python
# Simple example: predicting test score from study hours
hours = [1, 2, 3, 4, 5, 6, 7, 8]
scores = [40, 45, 55, 60, 68, 72, 80, 85]
```

## Linear Regression with Scikit-learn

```python
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array(hours).reshape(-1, 1)  # Features must be 2D
y = np.array(scores)

model = LinearRegression()
model.fit(X, y)

print(f"Slope: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")

# Predict
predicted = model.predict([[5], [10]])
print(f"5 hours -> score: {predicted[0]:.1f}")
```

## The Cost Function

How do we know which line is "best"? We minimize the **Mean Squared Error** (MSE):

```
MSE = (1/n) * sum((actual - predicted)^2)
```

```python
def mse(actual, predicted):
    errors = [(a - p) ** 2 for a, p in zip(actual, predicted)]
    return sum(errors) / len(errors)
```

The best line is the one with the smallest MSE.

## How Linear Regression Works

The algorithm finds the slope and intercept that minimize MSE. There are two approaches:

**1. Normal Equation** (direct solution):
```python
# sklearn uses this internally for small datasets
# slope = sum((x - x_mean)(y - y_mean)) / sum((x - x_mean)^2)
# intercept = y_mean - slope * x_mean
```

**2. Gradient Descent** (iterative optimization):
```python
def gradient_descent(X, y, learning_rate=0.01, epochs=1000):
    m, b = 0.0, 0.0
    n = len(X)

    for _ in range(epochs):
        predictions = [m * x + b for x in X]
        dm = (-2/n) * sum(x * (a - p) for x, a, p in zip(X, y, predictions))
        db = (-2/n) * sum(a - p for a, p in zip(y, predictions))
        m -= learning_rate * dm
        b -= learning_rate * db

    return m, b
```

## Multiple Linear Regression

Predict from multiple features:

```python
# Predicting house price from sqft, bedrooms, age
X = np.array([
    [1200, 2, 20],
    [1800, 3, 10],
    [2400, 4, 5],
    [1000, 1, 30],
])
y = np.array([200000, 300000, 400000, 150000])

model = LinearRegression()
model.fit(X, y)

print(f"Coefficients: {model.coef_}")
print(f"Intercept: {model.intercept_:.0f}")
```

## Evaluating Regression

```python
from sklearn.metrics import mean_squared_error, r2_score

y_pred = model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

print(f"RMSE: {rmse:.2f}")
print(f"R-squared: {r2:.4f}")
```

- **RMSE**: Average prediction error (same units as y)
- **R-squared**: Fraction of variance explained (1.0 = perfect, 0.0 = no better than mean)

## Feature Scaling

When features have very different scales, scale them:

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model.fit(X_scaled, y_train)
```

## Polynomial Regression

For non-linear relationships, add polynomial features:

```python
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=2)
X_poly = poly.fit_transform(X)

model = LinearRegression()
model.fit(X_poly, y)
```

## Key Takeaways

- Linear regression fits a line (or hyperplane) to minimize prediction error
- MSE measures the average squared difference between predicted and actual values
- Scikit-learn makes it simple: `fit()`, `predict()`, `score()`
- R-squared tells you how much variance your model explains
- Use polynomial features for non-linear relationships

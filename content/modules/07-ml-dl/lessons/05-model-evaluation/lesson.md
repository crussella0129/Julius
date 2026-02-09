---
id: "05-model-evaluation"
title: "Model Evaluation"
concepts:
  - cross-validation
  - hyperparameter-tuning
  - learning-curves
  - model-selection
why: "A model is only as good as its evaluation -- proper validation techniques prevent you from deploying models that fail in production."
prerequisites:
  - 04-trees-forests
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Compiling a Good Training Set"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Techniques of Machine Learning"
    license: "MIT"
---

# Model Evaluation

Evaluating a model properly is just as important as building it. This lesson covers cross-validation, hyperparameter tuning, and techniques for comparing models fairly.

## Why a Simple Train-Test Split Is Not Enough

A single train-test split depends on which data ends up in which set. Different splits can give very different accuracy numbers, making it hard to trust any single result.

## Cross-Validation

K-fold cross-validation solves this by training and evaluating K times:

1. Split data into K equal parts (folds)
2. For each fold: train on K-1 folds, test on the remaining fold
3. Average the K scores for a reliable estimate

```python
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)
scores = cross_val_score(model, X, y, cv=5)

print(f"Scores: {scores}")
print(f"Mean: {scores.mean():.3f} (+/- {scores.std():.3f})")
```

## K-Fold Manually

```python
from sklearn.model_selection import KFold

kf = KFold(n_splits=5, shuffle=True, random_state=42)

for fold, (train_idx, test_idx) in enumerate(kf.split(X)):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Fold {fold+1}: {score:.3f}")
```

## Stratified K-Fold

For imbalanced datasets, stratified K-fold ensures each fold has the same class proportions:

```python
from sklearn.model_selection import StratifiedKFold

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=skf)
```

## Hyperparameter Tuning

Hyperparameters are settings you choose before training (unlike parameters the model learns). Finding the best combination is called tuning.

### Grid Search

Try every combination of specified hyperparameters:

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [3, 5, 10, None],
    "min_samples_split": [2, 5, 10],
}

grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring="accuracy",
)
grid.fit(X, y)

print(f"Best params: {grid.best_params_}")
print(f"Best score: {grid.best_score_:.3f}")
best_model = grid.best_estimator_
```

### Randomized Search

For large parameter spaces, random search is more efficient:

```python
from sklearn.model_selection import RandomizedSearchCV

param_distributions = {
    "n_estimators": [50, 100, 200, 500],
    "max_depth": [3, 5, 10, 20, None],
    "min_samples_split": range(2, 20),
}

random_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    param_distributions,
    n_iter=20,   # Try 20 random combinations
    cv=5,
    random_state=42,
)
random_search.fit(X, y)
```

## Learning Curves

Learning curves show how performance changes with more training data:

```python
from sklearn.model_selection import learning_curve

train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=[0.1, 0.25, 0.5, 0.75, 1.0],
)

print("Train sizes:", train_sizes)
print("Train scores:", train_scores.mean(axis=1))
print("Val scores:", val_scores.mean(axis=1))
```

Interpretation:
- **Gap between train and val**: overfitting -- try simpler model or more data
- **Both curves low**: underfitting -- try more complex model
- **Both curves high and close**: good fit

## Comparing Models

```python
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

models = {
    "Logistic Regression": LogisticRegression(max_iter=200),
    "Decision Tree": DecisionTreeClassifier(max_depth=5),
    "Random Forest": RandomForestClassifier(n_estimators=100),
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5)
    print(f"{name}: {scores.mean():.3f} +/- {scores.std():.3f}")
```

## Validation Set vs Test Set

Use three splits for proper evaluation:
- **Training set** (60%): Train the model
- **Validation set** (20%): Tune hyperparameters
- **Test set** (20%): Final evaluation (touch only once!)

## Key Takeaways

- Cross-validation gives more reliable performance estimates than a single split
- Use stratified K-fold for imbalanced datasets
- GridSearchCV tries all parameter combinations; RandomizedSearchCV samples randomly
- Learning curves diagnose overfitting and underfitting
- Always keep a held-out test set that you only evaluate on once

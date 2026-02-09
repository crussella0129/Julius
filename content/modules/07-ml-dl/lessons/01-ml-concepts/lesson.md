---
id: "01-ml-concepts"
title: "Machine Learning Concepts"
concepts:
  - supervised-learning
  - unsupervised-learning
  - train-test-split
  - overfitting
why: "Understanding ML concepts before diving into code prevents the most common mistakes beginners make -- like training and testing on the same data."
prerequisites:
  - 07-eda-project
sources:
  - repo: "microsoft/ML-For-Beginners"
    section: "Introduction to Machine Learning"
    license: "MIT"
  - repo: "rasbt/machine-learning-book"
    section: "Chapter 1"
    license: "MIT"
---

# Machine Learning Concepts

Machine learning is the science of getting computers to learn patterns from data without being explicitly programmed. Instead of writing rules by hand, you provide examples and the algorithm discovers the rules.

## What Is Machine Learning?

Traditional programming: **Rules + Data = Output**
Machine learning: **Data + Output = Rules**

```python
# Traditional: you write the rule
def is_spam(email):
    if "free money" in email.lower():
        return True
    return False

# ML: the algorithm learns the rule from examples
# model.fit(emails, labels)  # learns from data
# model.predict(new_email)   # applies learned rules
```

## Types of Machine Learning

### Supervised Learning

You provide labeled examples (input-output pairs), and the model learns the mapping:

- **Classification**: Predict a category (spam/not spam, cat/dog, positive/negative)
- **Regression**: Predict a number (house price, temperature, stock price)

```python
# Classification example
features = [[170, 70], [160, 55], [180, 85], [155, 50]]  # [height, weight]
labels = ["male", "female", "male", "female"]

# Regression example
house_features = [[1200, 2], [1800, 3], [2400, 4]]  # [sqft, bedrooms]
prices = [200000, 300000, 400000]
```

### Unsupervised Learning

No labels. The model finds structure on its own:

- **Clustering**: Group similar items (customer segments)
- **Dimensionality reduction**: Compress features (PCA)

### Reinforcement Learning

An agent learns by trial and error, receiving rewards or penalties.

## The ML Workflow

```
1. Collect data
2. Clean and prepare data (EDA)
3. Split into train/test sets
4. Choose a model
5. Train the model
6. Evaluate on test data
7. Tune and iterate
8. Deploy
```

## Train-Test Split

The most important concept: **never evaluate on training data**.

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)
# 80% for training, 20% for testing
```

Why? A model can memorize the training data (overfitting) and perform poorly on new data. The test set simulates real-world performance.

## Features and Labels

- **Features** (X): The input variables the model learns from
- **Labels** (y): The output the model predicts
- **Feature engineering**: Creating useful features from raw data

```python
# Raw data: "2024-01-15, New York, $450,000"
# Features: year=2024, month=1, city_code=1, ...
# Label: price=450000
```

## Overfitting vs Underfitting

**Overfitting**: The model memorizes training data but fails on new data (too complex).
**Underfitting**: The model is too simple to capture the patterns (too basic).

```
Training accuracy: 99%  |  Test accuracy: 60%  → Overfitting
Training accuracy: 55%  |  Test accuracy: 50%  → Underfitting
Training accuracy: 90%  |  Test accuracy: 87%  → Good fit
```

## Bias-Variance Tradeoff

- **High bias**: Underfitting. The model makes strong assumptions.
- **High variance**: Overfitting. The model is too sensitive to training data.
- **Goal**: Find the sweet spot between bias and variance.

## Scikit-learn Overview

Scikit-learn provides a consistent API for all ML models:

```python
from sklearn.tree import DecisionTreeClassifier

# 1. Create model
model = DecisionTreeClassifier()

# 2. Train
model.fit(X_train, y_train)

# 3. Predict
predictions = model.predict(X_test)

# 4. Evaluate
accuracy = model.score(X_test, y_test)
```

Every model in scikit-learn follows this same `fit` / `predict` / `score` pattern.

## Key Takeaways

- ML learns patterns from data instead of using handwritten rules
- Supervised learning needs labeled data; unsupervised learning finds structure without labels
- Always split data into training and test sets
- Overfitting means great training performance but poor test performance
- Scikit-learn provides a consistent API: fit, predict, score

---
id: "10-practical-ml"
title: "Practical ML Pipeline"
concepts:
  - ml-pipeline
  - feature-engineering
  - model-persistence
  - production-considerations
why: "Real ML projects require more than model.fit() -- data pipelines, feature engineering, and deployment considerations make the difference between a toy project and a production system."
prerequisites:
  - 09-cnn
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Embedding a Machine Learning Model"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Applied ML"
    license: "MIT"
---

# Practical ML Pipeline

Building a real ML system involves much more than choosing a model. This lesson covers the complete pipeline from raw data to deployed model, including feature engineering, pipelines, model persistence, and production considerations.

## The Complete ML Pipeline

```
Raw Data -> Clean -> Feature Engineering -> Split -> Train -> Evaluate -> Deploy -> Monitor
```

Each step matters. A well-engineered pipeline is reproducible, maintainable, and testable.

## Scikit-learn Pipelines

Pipelines chain preprocessing and modeling steps:

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=100)),
])

pipe.fit(X_train, y_train)
accuracy = pipe.score(X_test, y_test)
```

Pipelines prevent data leakage by ensuring preprocessing is fit only on training data.

## Feature Engineering

Creating good features often matters more than choosing the right model:

```python
import pandas as pd
import numpy as np

def engineer_features(df):
    # Date features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_weekend"] = df["day_of_week"] >= 5

    # Interaction features
    df["price_per_sqft"] = df["price"] / df["sqft"]

    # Binning
    df["age_group"] = pd.cut(df["age"], bins=[0, 25, 50, 75, 100],
                              labels=["young", "adult", "senior", "elderly"])

    # Log transform (for skewed distributions)
    df["log_income"] = np.log1p(df["income"])

    return df
```

## Handling Categorical Features

Convert categories to numbers for ML models:

```python
from sklearn.preprocessing import OneHotEncoder, LabelEncoder

# One-hot encoding (creates binary columns)
encoder = OneHotEncoder(sparse_output=False)
encoded = encoder.fit_transform(df[["color"]])

# Label encoding (assigns integer IDs)
le = LabelEncoder()
df["city_code"] = le.fit_transform(df["city"])
```

## Column Transformers

Apply different preprocessing to different columns:

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), ["age", "income", "score"]),
        ("cat", OneHotEncoder(), ["city", "gender"]),
    ]
)

pipe = Pipeline([
    ("preprocess", preprocessor),
    ("classifier", RandomForestClassifier()),
])
```

## Model Persistence

Save trained models for later use:

```python
import joblib

# Save
joblib.dump(pipe, "model.joblib")

# Load
loaded_model = joblib.load("model.joblib")
predictions = loaded_model.predict(new_data)
```

Or with pickle:

```python
import pickle

with open("model.pkl", "wb") as f:
    pickle.dump(pipe, f)

with open("model.pkl", "rb") as f:
    loaded = pickle.load(f)
```

## Serving Predictions

Wrap your model in an API:

```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()
model = joblib.load("model.joblib")

class PredictionInput(BaseModel):
    age: float
    income: float
    city: str

@app.post("/predict")
def predict(data: PredictionInput):
    features = [[data.age, data.income]]
    prediction = model.predict(features)
    return {"prediction": int(prediction[0])}
```

## Common Pitfalls

**Data leakage**: Using test data during training or preprocessing.
```python
# WRONG: fit scaler on all data
scaler.fit(X)  # Sees test data!

# RIGHT: fit only on training data
scaler.fit(X_train)
X_test_scaled = scaler.transform(X_test)
```

**Target leakage**: Including features that are derived from the target.

**Imbalanced classes**: When one class dominates.
```python
from sklearn.utils import resample

# Oversample minority class
minority_upsampled = resample(minority_df, n_samples=len(majority_df))
```

## Model Monitoring

In production, track:
- **Prediction latency**: How fast is the model?
- **Data drift**: Has the input distribution changed?
- **Performance metrics**: Is accuracy degrading over time?

```python
import time
import logging

logger = logging.getLogger(__name__)

def predict_with_monitoring(model, features):
    start = time.time()
    prediction = model.predict(features)
    latency = time.time() - start
    logger.info(f"Prediction: {prediction}, Latency: {latency:.3f}s")
    return prediction
```

## ML Project Checklist

1. Define the problem and success metrics
2. Collect and explore data (EDA)
3. Engineer features
4. Build a baseline model (simple first!)
5. Iterate: try different models and features
6. Evaluate properly (cross-validation, held-out test set)
7. Save the model and pipeline
8. Deploy behind an API
9. Monitor performance in production
10. Retrain periodically with new data

## Key Takeaways

- Scikit-learn pipelines chain preprocessing and modeling, preventing data leakage
- Feature engineering often matters more than model selection
- Use ColumnTransformer for mixed numeric/categorical data
- Save models with joblib for production deployment
- Monitor deployed models for drift and performance degradation

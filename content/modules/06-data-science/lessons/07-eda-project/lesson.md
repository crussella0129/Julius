---
id: "07-eda-project"
title: "Exploratory Data Analysis Project"
concepts:
  - eda-workflow
  - data-questions
  - insight-extraction
  - report-building
why: "EDA is where data science begins -- learning to systematically explore a dataset and extract insights is the core skill that drives all analysis."
prerequisites:
  - 06-seaborn
sources:
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Exploratory Data Analysis"
    license: "MIT"
  - repo: "pandas-dev/pandas"
    section: "Cookbook"
    license: "BSD-3-Clause"
---

# Exploratory Data Analysis Project

Exploratory Data Analysis (EDA) is the process of systematically investigating a dataset to discover patterns, spot anomalies, test hypotheses, and check assumptions. It combines all the skills from previous lessons into a practical workflow.

## The EDA Workflow

1. **Load and inspect** the data
2. **Clean** the data (missing values, types, duplicates)
3. **Understand** distributions of individual variables
4. **Explore** relationships between variables
5. **Ask questions** and find answers
6. **Summarize** findings

## Step 1: Load and Inspect

```python
import pandas as pd
import numpy as np

df = pd.read_csv("sales_data.csv")

# First look
print(df.shape)          # How many rows and columns?
print(df.head())         # What does the data look like?
print(df.dtypes)         # What types are the columns?
print(df.describe())     # Summary statistics
print(df.info())         # Non-null counts and memory
```

## Step 2: Clean

```python
# Check for missing values
print(df.isnull().sum())

# Handle missing values
df["price"] = df["price"].fillna(df["price"].median())
df = df.dropna(subset=["product_name"])

# Fix data types
df["date"] = pd.to_datetime(df["date"])
df["quantity"] = df["quantity"].astype(int)

# Remove duplicates
print(f"Duplicates: {df.duplicated().sum()}")
df = df.drop_duplicates()
```

## Step 3: Univariate Analysis

Examine each variable individually:

```python
# Numeric distributions
print(df["price"].describe())
df["price"].hist(bins=30)

# Categorical value counts
print(df["category"].value_counts())
df["category"].value_counts().plot(kind="bar")
```

Questions to ask:
- What is the range of each numeric variable?
- Are there outliers?
- What are the most common categories?
- Are distributions skewed?

## Step 4: Bivariate Analysis

Explore relationships between pairs of variables:

```python
# Numeric vs numeric
df.plot.scatter(x="price", y="quantity")
print(df[["price", "quantity"]].corr())

# Numeric vs categorical
df.groupby("category")["price"].mean().plot(kind="bar")

# Time series
df.groupby("date")["revenue"].sum().plot()
```

## Step 5: Ask Deeper Questions

Good EDA questions are specific and answerable from the data:

```python
# "Which category generates the most revenue?"
revenue_by_cat = df.groupby("category")["revenue"].sum().sort_values(ascending=False)
print(revenue_by_cat)

# "Is there a seasonal pattern?"
df["month"] = df["date"].dt.month
monthly = df.groupby("month")["revenue"].sum()
print(monthly)

# "Who are the top customers?"
top = df.groupby("customer")["revenue"].sum().nlargest(10)
print(top)
```

## Step 6: Summarize Findings

Structure your findings clearly:

```python
def eda_summary(df):
    summary = {
        "rows": len(df),
        "columns": len(df.columns),
        "missing_values": df.isnull().sum().sum(),
        "duplicates": df.duplicated().sum(),
        "numeric_cols": list(df.select_dtypes(include="number").columns),
        "categorical_cols": list(df.select_dtypes(include="object").columns),
    }
    return summary
```

## Common EDA Patterns

**Correlation check**: High correlations suggest redundancy or a relationship worth investigating.

**Outlier detection**: Values beyond 3 standard deviations or 1.5 * IQR from quartiles.

```python
def find_outliers_iqr(series):
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    return series[(series < lower) | (series > upper)]
```

**Feature engineering**: Creating new columns from existing data.

```python
df["revenue"] = df["price"] * df["quantity"]
df["day_of_week"] = df["date"].dt.day_name()
df["is_weekend"] = df["date"].dt.dayofweek >= 5
```

## The EDA Mindset

- Start broad, then narrow down
- Let the data guide your questions
- Visualize before calculating
- Look for what surprises you
- Document your findings as you go
- Be skeptical -- correlation is not causation

## Key Takeaways

- EDA follows a systematic workflow: load, clean, explore, question, summarize
- Univariate analysis examines single variables; bivariate examines relationships
- Ask specific questions and use groupby/aggregation to answer them
- Outlier detection and correlation analysis reveal hidden patterns
- Good EDA generates hypotheses for deeper analysis or modeling

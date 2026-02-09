---
id: "02-pandas-series"
title: "Pandas DataFrames"
concepts:
  - dataframe
  - series
  - column-operations
  - dataframe-indexing
why: "Pandas DataFrames are the workhorse of data analysis in Python -- nearly every data science workflow starts with loading data into a DataFrame."
prerequisites:
  - 01-numpy-fundamentals
sources:
  - repo: "pandas-dev/pandas"
    section: "Getting Started"
    license: "BSD-3-Clause"
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Data Manipulation with Pandas"
    license: "MIT"
---

# Pandas DataFrames

Pandas provides two core data structures: **Series** (1D labeled array) and **DataFrame** (2D labeled table). A DataFrame is like a spreadsheet or SQL table -- rows and columns with labels.

## Creating DataFrames

```python
import pandas as pd

# From a dictionary
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "age": [25, 30, 35],
    "city": ["NYC", "LA", "Chicago"],
})
print(df)
#       name  age     city
# 0    Alice   25      NYC
# 1      Bob   30       LA
# 2  Charlie   35  Chicago
```

## Series

A Series is a single column with an index:

```python
ages = pd.Series([25, 30, 35], name="age")
print(ages)
# 0    25
# 1    30
# 2    35
# Name: age, dtype: int64

# A DataFrame column is a Series
print(df["age"])
print(type(df["age"]))  # <class 'pandas.core.series.Series'>
```

## Loading Data

Pandas reads many file formats:

```python
# CSV
df = pd.read_csv("data.csv")

# Excel
df = pd.read_excel("data.xlsx")

# JSON
df = pd.read_json("data.json")

# From a URL
df = pd.read_csv("https://example.com/data.csv")
```

## Exploring Data

```python
df.head()        # First 5 rows
df.tail(3)       # Last 3 rows
df.shape         # (rows, columns)
df.columns       # Column names
df.dtypes        # Data types per column
df.info()        # Summary of the DataFrame
df.describe()    # Statistics for numeric columns
```

## Selecting Columns

```python
# Single column (returns Series)
names = df["name"]

# Multiple columns (returns DataFrame)
subset = df[["name", "age"]]
```

## Selecting Rows

```python
# By position (iloc)
first_row = df.iloc[0]       # First row as Series
rows = df.iloc[0:3]          # First 3 rows

# By label (loc)
df.index = ["a", "b", "c"]
row = df.loc["a"]            # Row with index "a"

# By condition
young = df[df["age"] < 30]
nyc = df[df["city"] == "NYC"]
```

## Adding and Modifying Columns

```python
# New column from calculation
df["birth_year"] = 2025 - df["age"]

# Conditional column
df["senior"] = df["age"] >= 65

# Apply a function
df["name_upper"] = df["name"].apply(str.upper)
```

## Sorting

```python
# Sort by a column
df_sorted = df.sort_values("age")
df_sorted = df.sort_values("age", ascending=False)

# Sort by multiple columns
df_sorted = df.sort_values(["city", "age"])
```

## Basic Statistics

```python
print(df["age"].mean())     # Average age
print(df["age"].median())   # Median age
print(df["age"].max())      # Maximum age
print(df["city"].value_counts())  # Count per city
```

## Key Takeaways

- A DataFrame is a labeled 2D table; a Series is a labeled 1D array
- Load data with `pd.read_csv()`, `pd.read_excel()`, etc.
- Select columns with `df["col"]`, rows with `df.iloc[]` or `df.loc[]`
- Boolean indexing filters rows: `df[df["age"] > 30]`
- Add columns with `df["new_col"] = ...`

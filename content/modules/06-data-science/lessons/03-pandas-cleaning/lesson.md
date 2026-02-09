---
id: "03-pandas-cleaning"
title: "Data Cleaning with Pandas"
concepts:
  - missing-data
  - type-conversion
  - string-methods
  - duplicates
why: "Real-world data is messy -- missing values, wrong types, and inconsistent formats are the norm, and cleaning them is where most analysis time is spent."
prerequisites:
  - 02-pandas-series
sources:
  - repo: "pandas-dev/pandas"
    section: "Working with missing data"
    license: "BSD-3-Clause"
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Handling Missing Data"
    license: "MIT"
---

# Data Cleaning with Pandas

Before you can analyze data, you need to clean it. Real datasets have missing values, inconsistent formats, wrong data types, and duplicates. Pandas provides tools to handle all of these.

## Detecting Missing Data

Pandas uses `NaN` (Not a Number) and `None` to represent missing values:

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name": ["Alice", "Bob", None, "Diana"],
    "age": [25, np.nan, 35, 28],
    "city": ["NYC", "LA", "Chicago", None],
})

print(df.isnull())       # True where values are missing
print(df.isnull().sum()) # Count missing per column
print(df.isna().any())   # True if column has any missing
```

## Handling Missing Values

**Drop** rows or columns with missing data:

```python
# Drop rows with any missing value
df_clean = df.dropna()

# Drop rows only if ALL values are missing
df_clean = df.dropna(how="all")

# Drop rows missing in specific columns
df_clean = df.dropna(subset=["name", "age"])
```

**Fill** missing values:

```python
# Fill with a constant
df["age"] = df["age"].fillna(0)

# Fill with the mean
df["age"] = df["age"].fillna(df["age"].mean())

# Fill with the previous value (forward fill)
df["city"] = df["city"].fillna(method="ffill")
```

## Type Conversion

Data often arrives as the wrong type:

```python
df = pd.DataFrame({
    "price": ["10.5", "20.0", "15.75", "invalid"],
    "quantity": ["5", "3", "8", "2"],
})

# Convert to numeric (errors='coerce' turns invalid values to NaN)
df["price"] = pd.to_numeric(df["price"], errors="coerce")
df["quantity"] = df["quantity"].astype(int)

# Convert to datetime
df["date"] = pd.to_datetime(df["date_str"], format="%Y-%m-%d")
```

## String Cleaning

The `.str` accessor provides string methods for Series:

```python
df = pd.DataFrame({
    "name": ["  Alice ", "BOB", "charlie", " Diana  "],
    "email": ["ALICE@Mail.com", "bob@mail.COM", "charlie@mail.com", None],
})

# Strip whitespace
df["name"] = df["name"].str.strip()

# Standardize case
df["name"] = df["name"].str.title()
df["email"] = df["email"].str.lower()

# Check patterns
df["is_gmail"] = df["email"].str.contains("gmail", na=False)

# Replace text
df["name"] = df["name"].str.replace("Bob", "Robert")
```

## Handling Duplicates

```python
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Alice", "Charlie"],
    "score": [85, 90, 85, 78],
})

# Check for duplicates
print(df.duplicated())          # Boolean mask
print(df.duplicated().sum())    # Count duplicates

# Remove duplicates
df_unique = df.drop_duplicates()

# Keep last occurrence instead of first
df_unique = df.drop_duplicates(keep="last")

# Check specific columns
df_unique = df.drop_duplicates(subset=["name"])
```

## Renaming Columns

```python
# Rename specific columns
df = df.rename(columns={"old_name": "new_name"})

# Clean all column names
df.columns = df.columns.str.lower().str.replace(" ", "_")
```

## Replacing Values

```python
# Replace specific values
df["status"] = df["status"].replace({"Y": "Yes", "N": "No"})

# Replace with regex
df["phone"] = df["phone"].str.replace(r"[^\d]", "", regex=True)
```

## A Cleaning Pipeline

Combine steps into a function:

```python
def clean_data(df):
    # Make a copy
    df = df.copy()
    # Standardize column names
    df.columns = df.columns.str.lower().str.strip()
    # Remove duplicates
    df = df.drop_duplicates()
    # Handle missing values
    df["age"] = df["age"].fillna(df["age"].median())
    df = df.dropna(subset=["name"])
    # Fix types
    df["age"] = df["age"].astype(int)
    return df
```

## Key Takeaways

- Use `isnull()` and `sum()` to find missing data patterns
- `dropna()` removes missing data; `fillna()` replaces it
- Convert types with `astype()`, `pd.to_numeric()`, and `pd.to_datetime()`
- The `.str` accessor provides vectorized string operations
- Always check for and handle duplicates before analysis

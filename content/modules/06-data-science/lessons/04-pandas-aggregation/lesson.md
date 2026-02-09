---
id: "04-pandas-aggregation"
title: "GroupBy and Aggregation"
concepts:
  - groupby
  - aggregation-functions
  - pivot-tables
  - merge-join
why: "Grouping and aggregating data is the most common analytical operation -- it transforms raw records into actionable summaries."
prerequisites:
  - 03-pandas-cleaning
sources:
  - repo: "pandas-dev/pandas"
    section: "Group by: split-apply-combine"
    license: "BSD-3-Clause"
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Aggregation and Grouping"
    license: "MIT"
---

# GroupBy and Aggregation

The groupby operation splits data into groups, applies a function to each group, and combines the results. This "split-apply-combine" pattern is fundamental to data analysis.

## The GroupBy Concept

```python
import pandas as pd

df = pd.DataFrame({
    "department": ["Sales", "Sales", "Engineering", "Engineering", "Sales"],
    "employee": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "salary": [70000, 65000, 95000, 90000, 72000],
})

# Group by department, compute mean salary
dept_avg = df.groupby("department")["salary"].mean()
print(dept_avg)
# department
# Engineering    92500.0
# Sales          69000.0
```

## How GroupBy Works

1. **Split**: Divide the data into groups based on a column
2. **Apply**: Run a function (mean, sum, count, etc.) on each group
3. **Combine**: Merge the results back into a single output

```python
# Multiple aggregations
summary = df.groupby("department")["salary"].agg(["mean", "min", "max", "count"])
print(summary)
```

## Grouping by Multiple Columns

```python
df = pd.DataFrame({
    "year": [2023, 2023, 2024, 2024, 2024],
    "quarter": ["Q1", "Q2", "Q1", "Q1", "Q2"],
    "revenue": [100, 150, 120, 130, 160],
})

result = df.groupby(["year", "quarter"])["revenue"].sum()
print(result)
```

## Named Aggregation

Use named aggregation for cleaner output:

```python
result = df.groupby("department").agg(
    avg_salary=("salary", "mean"),
    total_salary=("salary", "sum"),
    headcount=("employee", "count"),
)
```

## Common Aggregation Functions

| Function | Description |
|----------|-------------|
| `mean()` | Average |
| `sum()` | Total |
| `count()` | Number of values |
| `min()` / `max()` | Minimum / Maximum |
| `std()` | Standard deviation |
| `first()` / `last()` | First / Last value |
| `nunique()` | Number of unique values |

## Custom Aggregation

Apply any function with `agg()` or `apply()`:

```python
# Custom function
def salary_range(x):
    return x.max() - x.min()

df.groupby("department")["salary"].agg(salary_range)

# Lambda
df.groupby("department")["salary"].agg(lambda x: x.max() - x.min())
```

## Pivot Tables

Pivot tables reshape data for cross-tabulation:

```python
df = pd.DataFrame({
    "date": ["Mon", "Mon", "Tue", "Tue"],
    "product": ["A", "B", "A", "B"],
    "sales": [10, 20, 15, 25],
})

pivot = df.pivot_table(
    values="sales",
    index="date",
    columns="product",
    aggfunc="sum",
)
print(pivot)
# product   A   B
# date
# Mon      10  20
# Tue      15  25
```

## Merging DataFrames

Combine DataFrames like SQL joins:

```python
orders = pd.DataFrame({
    "order_id": [1, 2, 3],
    "customer_id": [101, 102, 101],
    "amount": [50, 75, 30],
})

customers = pd.DataFrame({
    "customer_id": [101, 102, 103],
    "name": ["Alice", "Bob", "Charlie"],
})

# Inner join (only matching rows)
merged = orders.merge(customers, on="customer_id")

# Left join (keep all orders)
merged = orders.merge(customers, on="customer_id", how="left")
```

## Key Takeaways

- `groupby()` splits data into groups for aggregation
- Use `.agg()` with multiple functions for rich summaries
- Pivot tables reshape data for cross-tabulation
- `merge()` combines DataFrames like SQL joins
- Named aggregation produces clean, readable output

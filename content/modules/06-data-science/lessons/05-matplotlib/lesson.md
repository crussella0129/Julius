---
id: "05-matplotlib"
title: "Matplotlib"
concepts:
  - line-plots
  - bar-charts
  - scatter-plots
  - plot-customization
why: "Visualization reveals patterns that numbers alone cannot -- matplotlib is the foundational plotting library that everything else builds on."
prerequisites:
  - 04-pandas-aggregation
sources:
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Visualization with Matplotlib"
    license: "MIT"
---

# Matplotlib

Matplotlib is Python's most widely used plotting library. It produces publication-quality figures in a wide variety of formats. Most other Python visualization libraries (seaborn, pandas plotting) are built on top of it.

## Basic Line Plot

```python
import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]

plt.plot(x, y)
plt.xlabel("X Axis")
plt.ylabel("Y Axis")
plt.title("Simple Line Plot")
plt.show()
```

## The Two Interfaces

Matplotlib has two interfaces:

**pyplot interface** (quick and simple):
```python
plt.plot(x, y)
plt.title("My Plot")
plt.show()
```

**Object-oriented interface** (more control):
```python
fig, ax = plt.subplots()
ax.plot(x, y)
ax.set_title("My Plot")
ax.set_xlabel("X")
ax.set_ylabel("Y")
plt.show()
```

The OO interface is preferred for complex figures.

## Line Plots

```python
import numpy as np

x = np.linspace(0, 10, 100)
plt.plot(x, np.sin(x), label="sin(x)")
plt.plot(x, np.cos(x), label="cos(x)")
plt.legend()
plt.title("Trigonometric Functions")
plt.grid(True)
plt.show()
```

Customize line style:
```python
plt.plot(x, y, color="red", linestyle="--", linewidth=2, marker="o")
```

## Bar Charts

```python
categories = ["Python", "JavaScript", "Rust", "Go"]
values = [35, 25, 20, 15]

plt.bar(categories, values, color=["blue", "orange", "red", "green"])
plt.ylabel("Popularity (%)")
plt.title("Language Popularity")
plt.show()
```

Horizontal bars:
```python
plt.barh(categories, values)
```

## Scatter Plots

```python
x = np.random.default_rng(42).normal(0, 1, 100)
y = x * 2 + np.random.default_rng(43).normal(0, 0.5, 100)

plt.scatter(x, y, alpha=0.6, c="blue", s=30)
plt.xlabel("X")
plt.ylabel("Y")
plt.title("Scatter Plot")
plt.show()
```

## Histograms

```python
data = np.random.default_rng(42).normal(100, 15, 1000)

plt.hist(data, bins=30, edgecolor="black", alpha=0.7)
plt.xlabel("Value")
plt.ylabel("Frequency")
plt.title("Distribution")
plt.show()
```

## Subplots

Create multiple plots in one figure:

```python
fig, axes = plt.subplots(1, 2, figsize=(10, 4))

axes[0].plot(x, y1)
axes[0].set_title("Plot 1")

axes[1].bar(categories, values)
axes[1].set_title("Plot 2")

plt.tight_layout()
plt.show()
```

A 2x2 grid:
```python
fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes[0, 0].plot(...)    # top-left
axes[0, 1].scatter(...) # top-right
axes[1, 0].bar(...)     # bottom-left
axes[1, 1].hist(...)    # bottom-right
```

## Customization

```python
plt.figure(figsize=(8, 5))
plt.plot(x, y, color="#2196F3", linewidth=2)
plt.title("Custom Plot", fontsize=16, fontweight="bold")
plt.xlabel("X", fontsize=12)
plt.ylabel("Y", fontsize=12)
plt.xlim(0, 10)
plt.ylim(0, 100)
plt.grid(True, alpha=0.3)
plt.savefig("plot.png", dpi=150, bbox_inches="tight")
```

## Plotting with Pandas

Pandas integrates directly with matplotlib:

```python
df = pd.DataFrame({"A": [1,3,2,4], "B": [4,2,3,1]})
df.plot(kind="bar")
df["A"].plot(kind="hist", bins=10)
df.plot(kind="scatter", x="A", y="B")
```

## Key Takeaways

- `plt.plot()` creates line plots; `plt.bar()`, `plt.scatter()`, `plt.hist()` for other types
- Use the object-oriented interface (`fig, ax = plt.subplots()`) for complex figures
- Customize with labels, titles, colors, grid, and legend
- `plt.subplots()` creates multi-panel figures
- `plt.savefig()` exports plots to files

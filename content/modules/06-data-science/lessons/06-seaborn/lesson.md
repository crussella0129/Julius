---
id: "06-seaborn"
title: "Seaborn"
concepts:
  - statistical-plots
  - distribution-plots
  - categorical-plots
  - heatmaps
why: "Seaborn builds on matplotlib to make statistical visualization effortless -- beautiful, informative plots with minimal code."
prerequisites:
  - 05-matplotlib
sources:
  - repo: "jakevdp/PythonDataScienceHandbook"
    section: "Visualization with Seaborn"
    license: "MIT"
---

# Seaborn

Seaborn is a statistical visualization library built on matplotlib. It provides a high-level interface for creating attractive, informative statistical graphics with much less code than raw matplotlib.

## Getting Started

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

# Seaborn comes with built-in datasets
tips = sns.load_dataset("tips")
print(tips.head())
```

## Distribution Plots

Visualize the distribution of a single variable:

```python
# Histogram with KDE (kernel density estimate)
sns.histplot(data=tips, x="total_bill", kde=True)
plt.title("Distribution of Total Bills")
plt.show()

# KDE plot only
sns.kdeplot(data=tips, x="total_bill")

# Box plot
sns.boxplot(data=tips, x="day", y="total_bill")
plt.show()

# Violin plot (box plot + KDE)
sns.violinplot(data=tips, x="day", y="total_bill")
plt.show()
```

## Categorical Plots

Compare categories:

```python
# Bar plot (shows mean + confidence interval)
sns.barplot(data=tips, x="day", y="total_bill")
plt.show()

# Count plot (bar chart of counts)
sns.countplot(data=tips, x="day")
plt.show()

# Strip plot (individual points)
sns.stripplot(data=tips, x="day", y="total_bill", jitter=True, alpha=0.5)
plt.show()

# Swarm plot (non-overlapping points)
sns.swarmplot(data=tips, x="day", y="total_bill")
plt.show()
```

## Relational Plots

Show relationships between variables:

```python
# Scatter plot with regression line
sns.regplot(data=tips, x="total_bill", y="tip")
plt.show()

# Scatter with hue (color by category)
sns.scatterplot(data=tips, x="total_bill", y="tip", hue="time")
plt.show()

# Line plot
sns.lineplot(data=flights, x="year", y="passengers")
plt.show()
```

## The `hue` Parameter

Add a third dimension with color:

```python
sns.boxplot(data=tips, x="day", y="total_bill", hue="sex")
plt.title("Bills by Day and Gender")
plt.show()

sns.histplot(data=tips, x="total_bill", hue="time", multiple="stack")
plt.show()
```

## Heatmaps

Visualize matrices and correlations:

```python
# Correlation matrix
numeric_cols = tips.select_dtypes(include="number")
corr = numeric_cols.corr()

sns.heatmap(corr, annot=True, cmap="coolwarm", vmin=-1, vmax=1)
plt.title("Correlation Matrix")
plt.show()
```

## Pair Plots

Explore all pairwise relationships at once:

```python
sns.pairplot(tips, hue="sex", diag_kind="kde")
plt.show()
```

This creates a grid of scatter plots for every pair of numeric columns, with histograms or KDE plots on the diagonal.

## FacetGrid

Create a grid of plots split by a categorical variable:

```python
g = sns.FacetGrid(tips, col="time", row="sex")
g.map(sns.histplot, "total_bill")
plt.show()
```

## Styling

Seaborn provides built-in themes:

```python
sns.set_theme(style="whitegrid")    # Clean grid
sns.set_theme(style="darkgrid")     # Dark grid
sns.set_theme(style="ticks")        # Ticks only

# Color palettes
sns.set_palette("husl")
sns.set_palette("Set2")
sns.color_palette("viridis", 5)     # 5 colors from viridis
```

## Seaborn vs Matplotlib

| Feature | Matplotlib | Seaborn |
|---------|-----------|---------|
| Level | Low-level | High-level |
| Data input | Arrays | DataFrames |
| Statistics | Manual | Built-in |
| Defaults | Plain | Beautiful |
| Use case | Full control | Quick exploration |

## Key Takeaways

- Seaborn works directly with pandas DataFrames
- Use `hue` to add a categorical dimension with color
- Distribution plots: `histplot`, `kdeplot`, `boxplot`, `violinplot`
- Categorical plots: `barplot`, `countplot`, `stripplot`
- Relational plots: `scatterplot`, `regplot`, `lineplot`
- `heatmap` visualizes correlations; `pairplot` shows all relationships

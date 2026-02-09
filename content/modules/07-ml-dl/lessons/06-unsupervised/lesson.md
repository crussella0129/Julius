---
id: "06-unsupervised"
title: "Unsupervised Learning"
concepts:
  - k-means
  - clustering
  - pca
  - dimensionality-reduction
why: "Not all data comes with labels -- unsupervised learning discovers hidden structure in unlabeled data, from customer segments to data compression."
prerequisites:
  - 05-model-evaluation
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Working with Unlabeled Data"
    license: "MIT"
  - repo: "microsoft/ML-For-Beginners"
    section: "Clustering"
    license: "MIT"
---

# Unsupervised Learning

Unsupervised learning finds patterns in data without labeled examples. The two main tasks are **clustering** (grouping similar items) and **dimensionality reduction** (compressing features while preserving structure).

## K-Means Clustering

K-means partitions data into K clusters by iteratively assigning points to the nearest cluster center:

1. Choose K random initial centroids
2. Assign each point to the nearest centroid
3. Recalculate centroids as the mean of assigned points
4. Repeat steps 2-3 until convergence

```python
from sklearn.cluster import KMeans
import numpy as np

X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8],
              [1, 0.6], [9, 11], [8, 2], [10, 2], [9, 3]])

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans.fit(X)

print(f"Labels: {kmeans.labels_}")
print(f"Centers: {kmeans.cluster_centers_}")
```

## How K-Means Works (Step by Step)

```python
def simple_kmeans(data, k, max_iters=100):
    # Step 1: Random initial centroids
    rng = np.random.default_rng(42)
    centroids = data[rng.choice(len(data), k, replace=False)]

    for _ in range(max_iters):
        # Step 2: Assign points to nearest centroid
        labels = []
        for point in data:
            distances = [np.sqrt(sum((point - c)**2)) for c in centroids]
            labels.append(distances.index(min(distances)))

        # Step 3: Recalculate centroids
        new_centroids = []
        for i in range(k):
            cluster_points = [data[j] for j in range(len(data)) if labels[j] == i]
            new_centroids.append(np.mean(cluster_points, axis=0))

        centroids = np.array(new_centroids)

    return labels, centroids
```

## Choosing K: The Elbow Method

Plot the sum of squared distances (inertia) for different K values:

```python
inertias = []
K_range = range(1, 11)

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertias.append(km.inertia_)

# Plot inertias vs K -- look for the "elbow"
```

The optimal K is where the inertia curve bends sharply (the elbow point).

## Principal Component Analysis (PCA)

PCA reduces dimensions by finding the directions of maximum variance:

```python
from sklearn.decomposition import PCA

# Reduce from many features to 2 for visualization
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

print(f"Original shape: {X.shape}")
print(f"Reduced shape: {X_reduced.shape}")
print(f"Variance explained: {pca.explained_variance_ratio_}")
```

## How PCA Works

1. Center the data (subtract the mean)
2. Compute the covariance matrix
3. Find eigenvectors (principal components) and eigenvalues
4. Keep the top N components that explain the most variance

```python
# Manual PCA for 2D data
X_centered = X - X.mean(axis=0)
cov_matrix = np.cov(X_centered.T)
eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

# Sort by eigenvalue (highest variance first)
idx = eigenvalues.argsort()[::-1]
components = eigenvectors[:, idx]
```

## Silhouette Score

Evaluate clustering quality without labels:

```python
from sklearn.metrics import silhouette_score

score = silhouette_score(X, kmeans.labels_)
print(f"Silhouette Score: {score:.3f}")
```

- Score near 1: Dense, well-separated clusters
- Score near 0: Overlapping clusters
- Score near -1: Likely misassigned points

## Other Clustering Algorithms

**DBSCAN** -- density-based clustering that finds arbitrary shapes:

```python
from sklearn.cluster import DBSCAN

db = DBSCAN(eps=0.5, min_samples=5)
labels = db.fit_predict(X)
```

**Hierarchical Clustering** -- builds a tree of nested clusters:

```python
from sklearn.cluster import AgglomerativeClustering

hc = AgglomerativeClustering(n_clusters=3)
labels = hc.fit_predict(X)
```

## Use Cases

| Task | Algorithm |
|------|-----------|
| Customer segmentation | K-Means |
| Anomaly detection | DBSCAN |
| Data visualization | PCA |
| Feature compression | PCA |
| Document grouping | K-Means |
| Image compression | PCA + K-Means |

## Key Takeaways

- K-means clusters data by iteratively assigning points to nearest centroids
- Use the elbow method to choose the number of clusters K
- PCA compresses features by keeping directions of maximum variance
- Silhouette score evaluates cluster quality without labels
- Unsupervised learning is essential for exploratory analysis and preprocessing

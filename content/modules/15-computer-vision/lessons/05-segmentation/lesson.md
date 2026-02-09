---
id: "05-segmentation"
title: "Image Segmentation"
concepts:
  - contour-detection
  - watershed
  - semantic-segmentation
  - connected-components
why: "Segmentation assigns a label to every pixel in an image -- it enables precise object boundaries for medical imaging, autonomous driving, and photo editing."
prerequisites:
  - 04-object-detection
sources:
  - repo: "opencv/opencv-python"
    section: "Image Segmentation"
    license: "Apache-2.0"
  - repo: "ultralytics/ultralytics"
    section: "Segmentation Models"
    license: "AGPL-3.0"
---

# Image Segmentation

While object detection draws boxes around objects, segmentation assigns a class label to every single pixel. This gives you precise object boundaries instead of rough rectangles.

## Types of Segmentation

- **Semantic segmentation**: Label every pixel with a class (all "person" pixels, all "car" pixels)
- **Instance segmentation**: Distinguish between different objects of the same class (person 1 vs person 2)
- **Panoptic segmentation**: Combines both -- every pixel gets a class label and an instance ID

## Thresholding as Simple Segmentation

The simplest segmentation method: separate foreground from background using a threshold:

```python
import numpy as np

def segment_threshold(image, threshold):
    """Binary segmentation using a global threshold."""
    mask = (image > threshold).astype(np.uint8)
    return mask

image = np.array([
    [30, 40, 200, 210],
    [35, 45, 195, 205],
    [180, 190, 50, 60],
    [185, 195, 55, 65],
], dtype=np.uint8)

mask = segment_threshold(image, 128)
print("Segmentation mask:")
print(mask)
# 1s mark the foreground, 0s mark the background
```

## Connected Components

After thresholding, connected component analysis groups touching foreground pixels into separate objects:

```python
def flood_fill(mask, row, col, label, output):
    """Fill connected region with a label using BFS."""
    h, w = mask.shape
    queue = [(row, col)]
    output[row, col] = label

    while queue:
        r, c = queue.pop(0)
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < h and 0 <= nc < w:
                if mask[nr, nc] == 1 and output[nr, nc] == 0:
                    output[nr, nc] = label
                    queue.append((nr, nc))

def connected_components(binary_mask):
    """Label connected components in a binary mask."""
    h, w = binary_mask.shape
    labels = np.zeros((h, w), dtype=int)
    current_label = 0

    for i in range(h):
        for j in range(w):
            if binary_mask[i, j] == 1 and labels[i, j] == 0:
                current_label += 1
                flood_fill(binary_mask, i, j, current_label, labels)

    return labels, current_label

# Binary mask with two separate objects
binary = np.array([
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1],
], dtype=np.uint8)

labels, num_objects = connected_components(binary)
print(f"Found {num_objects} objects")
print("Label map:")
print(labels)
```

## Contour Detection

Contours are the boundaries of segmented regions. Finding contours means tracing the edges of each object:

```python
def find_contour_pixels(binary_mask):
    """Find pixels on the boundary of foreground regions."""
    h, w = binary_mask.shape
    contour = np.zeros_like(binary_mask)

    for i in range(h):
        for j in range(w):
            if binary_mask[i, j] == 0:
                continue
            # Check if any 4-neighbor is background or boundary
            is_boundary = False
            for di, dj in [(-1,0), (1,0), (0,-1), (0,1)]:
                ni, nj = i + di, j + dj
                if ni < 0 or ni >= h or nj < 0 or nj >= w:
                    is_boundary = True
                elif binary_mask[ni, nj] == 0:
                    is_boundary = True
            if is_boundary:
                contour[i, j] = 1

    return contour

# Find contours of a filled rectangle
mask = np.zeros((7, 7), dtype=np.uint8)
mask[2:5, 2:5] = 1  # 3x3 filled square

contour = find_contour_pixels(mask)
print("Original mask:")
print(mask)
print("\nContour pixels:")
print(contour)
# The interior pixel (3,3) is NOT on the contour
```

## Contour Properties

Once you have contours, you can compute geometric properties:

```python
def contour_area(contour_points):
    """Compute area enclosed by contour using the Shoelace formula."""
    n = len(contour_points)
    if n < 3:
        return 0
    area = 0
    for i in range(n):
        j = (i + 1) % n
        area += contour_points[i][0] * contour_points[j][1]
        area -= contour_points[j][0] * contour_points[i][1]
    return abs(area) / 2

def bounding_rect(points):
    """Compute axis-aligned bounding rectangle."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys), max(xs), max(ys))

# OpenCV provides these as built-in functions:
# contours, hierarchy = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
# for contour in contours:
#     area = cv2.contourArea(contour)
#     perimeter = cv2.arcLength(contour, True)
#     x, y, w, h = cv2.boundingRect(contour)
```

## Region-Based Segmentation

Instead of just thresholding, we can grow regions from seed points:

```python
def region_growing(image, seed, threshold):
    """Grow a region from a seed pixel based on intensity similarity."""
    h, w = image.shape
    visited = np.zeros((h, w), dtype=bool)
    region = np.zeros((h, w), dtype=np.uint8)
    seed_value = float(image[seed[0], seed[1]])
    queue = [seed]
    visited[seed[0], seed[1]] = True

    while queue:
        r, c = queue.pop(0)
        if abs(float(image[r, c]) - seed_value) <= threshold:
            region[r, c] = 1
            for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < h and 0 <= nc < w and not visited[nr, nc]:
                    visited[nr, nc] = True
                    queue.append((nr, nc))

    return region

image = np.array([
    [100, 102, 105, 200, 210],
    [98,  103, 101, 205, 215],
    [105, 100, 104, 50,  55],
    [200, 205, 210, 52,  48],
    [195, 200, 208, 53,  50],
], dtype=np.uint8)

# Grow from top-left corner with threshold of 10
region = region_growing(image, (0, 0), threshold=10)
print("Region from seed (0,0):")
print(region)
```

## Semantic Segmentation with Neural Networks

Modern semantic segmentation uses deep learning. The model outputs a class probability for every pixel:

```python
def simulate_segmentation_output(h, w, num_classes):
    """Simulate a semantic segmentation model output."""
    np.random.seed(42)
    # Model outputs: (height, width, num_classes) probabilities
    logits = np.random.randn(h, w, num_classes)

    # Convert to class predictions (argmax)
    predictions = np.argmax(logits, axis=2)
    return predictions

class_names = {0: "background", 1: "person", 2: "car", 3: "tree"}
pred = simulate_segmentation_output(4, 4, 4)
print("Pixel-wise predictions:")
print(pred)

# Count pixels per class
for cls_id, name in class_names.items():
    count = np.sum(pred == cls_id)
    print(f"  {name}: {count} pixels")
```

## The Watershed Algorithm

Watershed treats the image as a topographic surface and "floods" from marker points to find boundaries:

```python
# Conceptual watershed:
# 1. Compute gradient magnitude (edges become ridges)
# 2. Place markers at known object centers
# 3. "Flood" from markers; boundaries form where floods meet

# In OpenCV:
# markers = np.zeros_like(gray, dtype=np.int32)
# markers[seed_region_1] = 1
# markers[seed_region_2] = 2
# cv2.watershed(color_image, markers)
# Boundary pixels are marked as -1
```

## Common Mistakes

- **Not preprocessing before segmentation**: Noise leads to fragmented segments. Always blur or denoise first.
- **Using global threshold on uneven lighting**: Use adaptive thresholding or local methods instead.
- **Ignoring small components**: Filter out tiny connected components that are likely noise.
- **Confusing semantic and instance segmentation**: Semantic segmentation does not distinguish between two cats; instance segmentation does.

## Key Takeaways

- Segmentation assigns a label to every pixel, giving precise object boundaries
- Connected components group touching foreground pixels into separate objects
- Contour detection traces object boundaries from binary masks
- Region growing expands from seed points based on pixel similarity
- Modern segmentation uses deep learning models that output per-pixel class probabilities
- Watershed is a classical method that segments using topographic flooding

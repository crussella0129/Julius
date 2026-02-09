---
id: "03-feature-detection"
title: "Feature Detection"
concepts:
  - harris-corners
  - feature-descriptors
  - template-matching
  - keypoints
why: "Feature detection finds distinctive points in images that can be matched across different views -- this is the basis for image stitching, object recognition, and tracking."
prerequisites:
  - 02-image-processing
sources:
  - repo: "opencv/opencv-python"
    section: "Feature Detection and Description"
    license: "Apache-2.0"
  - repo: "scikit-image/scikit-image"
    section: "Feature Detection"
    license: "BSD-3-Clause"
---

# Feature Detection

Feature detection identifies interesting, distinctive points in an image -- corners, edges, and blobs that can be reliably found even when the image is rotated, scaled, or viewed from a different angle.

## What Makes a Good Feature?

Not all pixels are equally useful for recognition:
- **Flat regions**: Shifting the window in any direction shows no change. Poor feature.
- **Edges**: Shifting along the edge shows no change. Medium feature.
- **Corners**: Shifting in any direction shows significant change. Excellent feature.

## The Harris Corner Detector

The Harris detector measures how much the image intensity changes when you shift a small window. At a corner, the intensity changes significantly in all directions.

```python
import numpy as np

def compute_gradients(image):
    """Compute horizontal and vertical gradients using Sobel-like operators."""
    sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
    sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])

    h, w = image.shape
    padded = np.pad(image.astype(float), 1, mode='reflect')
    ix = np.zeros((h, w))
    iy = np.zeros((h, w))

    for i in range(h):
        for j in range(w):
            region = padded[i:i+3, j:j+3]
            ix[i, j] = np.sum(region * sobel_x)
            iy[i, j] = np.sum(region * sobel_y)

    return ix, iy

def harris_corner_response(image, k=0.04, window_size=3):
    """Compute Harris corner response for each pixel."""
    ix, iy = compute_gradients(image)

    # Products of gradients
    ixx = ix * ix
    iyy = iy * iy
    ixy = ix * iy

    h, w = image.shape
    response = np.zeros((h, w))
    offset = window_size // 2

    for i in range(offset, h - offset):
        for j in range(offset, w - offset):
            # Sum over the window
            sxx = ixx[i-offset:i+offset+1, j-offset:j+offset+1].sum()
            syy = iyy[i-offset:i+offset+1, j-offset:j+offset+1].sum()
            sxy = ixy[i-offset:i+offset+1, j-offset:j+offset+1].sum()

            # Harris response: det(M) - k * trace(M)^2
            det = sxx * syy - sxy * sxy
            trace = sxx + syy
            response[i, j] = det - k * trace * trace

    return response

# Create an image with a clear corner
image = np.zeros((11, 11), dtype=float)
image[0:6, 0:6] = 255  # White square in top-left

response = harris_corner_response(image)
# Find the peak response (should be near the corner)
max_pos = np.unravel_index(response.argmax(), response.shape)
print(f"Strongest corner at: {max_pos}")
print(f"Response value: {response[max_pos]:.0f}")
```

## Non-Maximum Suppression

After computing corner responses, we need to keep only the local maxima:

```python
def non_max_suppression(response, threshold, window_size=3):
    """Keep only local maxima above threshold."""
    h, w = response.shape
    corners = []
    offset = window_size // 2

    for i in range(offset, h - offset):
        for j in range(offset, w - offset):
            if response[i, j] < threshold:
                continue
            local = response[i-offset:i+offset+1, j-offset:j+offset+1]
            if response[i, j] == local.max():
                corners.append((i, j, response[i, j]))

    return corners

# Find corners with NMS
corners = non_max_suppression(response, threshold=1000)
print(f"Found {len(corners)} corners")
for row, col, score in corners[:5]:
    print(f"  Corner at ({row}, {col}), score: {score:.0f}")
```

## Template Matching

Template matching finds a small template image within a larger image by sliding and comparing:

```python
def template_match(image, template):
    """Find template in image using sum of squared differences."""
    h, w = image.shape
    th, tw = template.shape
    result = np.zeros((h - th + 1, w - tw + 1))

    for i in range(result.shape[0]):
        for j in range(result.shape[1]):
            region = image[i:i+th, j:j+tw]
            # Sum of squared differences (lower = better match)
            ssd = np.sum((region.astype(float) - template.astype(float)) ** 2)
            result[i, j] = ssd

    return result

# Create an image with a pattern
image = np.zeros((10, 10), dtype=np.uint8)
image[3:6, 4:7] = 255  # White 3x3 block

# Template: the 3x3 white block
template = np.ones((3, 3), dtype=np.uint8) * 255

ssd_map = template_match(image, template)
min_pos = np.unravel_index(ssd_map.argmin(), ssd_map.shape)
print(f"Best match at: {min_pos}")  # (3, 4) -- top-left of the block
print(f"Match score (SSD): {ssd_map[min_pos]}")  # 0 = perfect match
```

## Normalized Cross-Correlation

A more robust matching method that handles brightness differences:

```python
def normalized_cross_correlation(image, template):
    """NCC template matching (higher = better match)."""
    h, w = image.shape
    th, tw = template.shape
    result = np.zeros((h - th + 1, w - tw + 1))

    t_mean = template.mean()
    t_std = template.std()
    if t_std == 0:
        return result

    for i in range(result.shape[0]):
        for j in range(result.shape[1]):
            region = image[i:i+th, j:j+tw].astype(float)
            r_mean = region.mean()
            r_std = region.std()
            if r_std == 0:
                continue
            ncc = np.sum((region - r_mean) * (template - t_mean)) / (th * tw * r_std * t_std)
            result[i, j] = ncc

    return result
```

## Feature Descriptors: The Concept

A **keypoint** is a location; a **descriptor** is a numerical signature that describes the local region around that keypoint. Two keypoints with similar descriptors likely correspond to the same real-world point.

```python
def simple_descriptor(image, row, col, patch_size=5):
    """Extract a simple descriptor: normalized pixel values in a patch."""
    half = patch_size // 2
    h, w = image.shape

    # Boundary check
    if row - half < 0 or row + half >= h or col - half < 0 or col + half >= w:
        return None

    patch = image[row-half:row+half+1, col-half:col+half+1].astype(float)
    # Normalize to zero mean, unit variance
    mean = patch.mean()
    std = patch.std()
    if std == 0:
        return patch.flatten() * 0
    return ((patch - mean) / std).flatten()

# SIFT, SURF, ORB are production feature descriptors in OpenCV:
# sift = cv2.SIFT_create()
# keypoints, descriptors = sift.detectAndCompute(gray_image, None)
```

## Matching Features Between Images

```python
def match_descriptors(desc1, desc2):
    """Match descriptors using brute-force nearest neighbor."""
    matches = []
    for i, d1 in enumerate(desc1):
        best_j = -1
        best_dist = float('inf')
        for j, d2 in enumerate(desc2):
            dist = np.sqrt(np.sum((d1 - d2) ** 2))
            if dist < best_dist:
                best_dist = dist
                best_j = j
        matches.append((i, best_j, best_dist))

    # Sort by distance (best matches first)
    matches.sort(key=lambda x: x[2])
    return matches
```

## Common Mistakes

- **Setting the Harris k parameter too high**: Typical values are 0.04-0.06. Too high misses real corners.
- **Skipping non-maximum suppression**: Without NMS, you get clusters of detections instead of clean points.
- **Template matching without normalization**: Raw SSD is sensitive to brightness changes; use NCC instead.
- **Using too small a patch for descriptors**: Small patches are ambiguous; larger patches are more distinctive.

## Key Takeaways

- Corners are the most reliable features because intensity changes in all directions
- The Harris detector measures corner strength using gradient products
- Non-maximum suppression keeps only the strongest local detections
- Template matching finds known patterns by sliding and comparing
- Feature descriptors encode the local region around keypoints for matching
- These concepts underpin image stitching, 3D reconstruction, and object recognition

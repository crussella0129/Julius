---
id: "02-image-processing"
title: "Image Processing"
concepts:
  - convolution
  - filters
  - thresholding
  - morphological-operations
why: "Filters and thresholding transform raw images into clean, structured data -- these operations are the preprocessing backbone of every computer vision pipeline."
prerequisites:
  - 01-opencv-basics
sources:
  - repo: "opencv/opencv-python"
    section: "Image Processing"
    license: "Apache-2.0"
  - repo: "scikit-image/scikit-image"
    section: "Filtering"
    license: "BSD-3-Clause"
---

# Image Processing

Image processing transforms images to enhance features, reduce noise, or extract structure. The fundamental operation is **convolution** -- sliding a small matrix (kernel) across the image and computing weighted sums at each position.

## Convolution: The Core Operation

A convolution applies a kernel (filter) to every pixel by multiplying overlapping values and summing the result:

```python
import numpy as np

def convolve2d(image, kernel):
    """Apply a 2D convolution to a grayscale image."""
    h, w = image.shape
    kh, kw = kernel.shape
    pad_h, pad_w = kh // 2, kw // 2

    # Pad the image with zeros
    padded = np.zeros((h + 2 * pad_h, w + 2 * pad_w))
    padded[pad_h:pad_h + h, pad_w:pad_w + w] = image

    output = np.zeros_like(image, dtype=float)
    for i in range(h):
        for j in range(w):
            region = padded[i:i + kh, j:j + kw]
            output[i, j] = np.sum(region * kernel)

    return output

# Test with a simple image
image = np.array([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 255, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
], dtype=float)

# Identity kernel (no change)
identity = np.array([[0, 0, 0], [0, 1, 0], [0, 0, 0]])
result = convolve2d(image, identity)
print(f"Center pixel (identity): {result[2, 2]}")  # 255.0
```

## Blur Filters

Blurring smooths an image by averaging neighboring pixels. It reduces noise but also softens edges.

```python
# Box blur: simple average of neighbors
box_blur = np.ones((3, 3)) / 9.0

# Gaussian blur: weighted average (center pixel has most influence)
gaussian_blur = np.array([
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
]) / 16.0

image = np.array([
    [10, 10, 10, 10, 10],
    [10, 10, 10, 10, 10],
    [10, 10, 200, 10, 10],
    [10, 10, 10, 10, 10],
    [10, 10, 10, 10, 10],
], dtype=float)

blurred = convolve2d(image, box_blur)
print(f"Center before blur: {image[2, 2]}")
print(f"Center after blur:  {blurred[2, 2]:.1f}")
# The bright center pixel spreads to neighbors
```

## Edge Detection

Edge detection finds boundaries where pixel values change sharply:

```python
# Sobel operators detect edges in horizontal and vertical directions
sobel_x = np.array([[-1, 0, 1],
                     [-2, 0, 2],
                     [-1, 0, 1]])

sobel_y = np.array([[-1, -2, -1],
                     [0,  0,  0],
                     [1,  2,  1]])

# Create an image with a vertical edge
image = np.zeros((5, 5), dtype=float)
image[:, 3:] = 255  # Right side is white

edges_x = convolve2d(image, sobel_x)
print("Horizontal edge detection:")
print(edges_x.astype(int))
# Strong response at the boundary column
```

## Sharpening

Sharpening enhances edges by amplifying the center pixel relative to neighbors:

```python
sharpen_kernel = np.array([
    [0,  -1,  0],
    [-1,  5, -1],
    [0,  -1,  0]
])

# The center weight (5) minus the sum of neighbors (-4) = 1
# This means: output = original + (original - blurred) = enhanced edges
```

## Thresholding

Thresholding converts a grayscale image to binary (black and white) based on a cutoff value:

```python
def threshold(image, thresh_value):
    """Simple binary thresholding."""
    return (image > thresh_value).astype(np.uint8) * 255

# Grayscale image with varying intensities
image = np.array([
    [50,  100, 150],
    [200, 25,  175],
    [75,  225, 130]
], dtype=np.uint8)

binary = threshold(image, 128)
print("Original:")
print(image)
print("\nBinary (threshold=128):")
print(binary)
# Values > 128 become 255 (white), others become 0 (black)
```

## Adaptive Thresholding

A single global threshold fails when lighting varies across the image. Adaptive thresholding computes a local threshold for each region:

```python
def adaptive_threshold(image, block_size, offset):
    """Simple adaptive thresholding using local mean."""
    h, w = image.shape
    result = np.zeros_like(image)
    pad = block_size // 2

    padded = np.pad(image.astype(float), pad, mode='reflect')
    for i in range(h):
        for j in range(w):
            local = padded[i:i + block_size, j:j + block_size]
            local_thresh = local.mean() - offset
            result[i, j] = 255 if image[i, j] > local_thresh else 0

    return result

image = np.array([
    [30, 40, 50, 200, 210, 220],
    [35, 45, 55, 205, 215, 225],
], dtype=np.uint8)

adaptive = adaptive_threshold(image, block_size=3, offset=5)
print("Adaptive threshold result:")
print(adaptive)
```

## Morphological Operations

Morphological operations process binary images using shape-based transformations:

```python
def dilate(binary_image, kernel_size=3):
    """Expand white regions (grow foreground)."""
    h, w = binary_image.shape
    pad = kernel_size // 2
    padded = np.pad(binary_image, pad, mode='constant', constant_values=0)
    output = np.zeros_like(binary_image)
    for i in range(h):
        for j in range(w):
            region = padded[i:i + kernel_size, j:j + kernel_size]
            output[i, j] = 255 if region.max() > 0 else 0
    return output

def erode(binary_image, kernel_size=3):
    """Shrink white regions (shrink foreground)."""
    h, w = binary_image.shape
    pad = kernel_size // 2
    padded = np.pad(binary_image, pad, mode='constant', constant_values=0)
    output = np.zeros_like(binary_image)
    for i in range(h):
        for j in range(w):
            region = padded[i:i + kernel_size, j:j + kernel_size]
            output[i, j] = 255 if region.min() > 0 else 0
    return output

# Binary image with a small dot
binary = np.zeros((7, 7), dtype=np.uint8)
binary[3, 3] = 255
print("Original:")
print((binary > 0).astype(int))

dilated = dilate(binary)
print("\nDilated:")
print((dilated > 0).astype(int))
```

**Opening** (erode then dilate) removes small noise. **Closing** (dilate then erode) fills small holes.

## Common Mistakes

- **Integer overflow in convolution**: Multiply uint8 values and get overflow. Convert to float first.
- **Wrong kernel normalization**: Box blur must divide by kernel size; otherwise values explode.
- **Choosing threshold blindly**: Always examine the image histogram before picking a threshold.
- **Applying morphology to grayscale**: Morphological operations are designed for binary images.

## Key Takeaways

- Convolution slides a kernel across an image, computing weighted sums
- Blur kernels average neighbors (reduce noise); edge kernels detect boundaries
- Thresholding converts grayscale to binary; adaptive thresholding handles uneven lighting
- Morphological operations (dilate, erode, open, close) clean up binary images
- These operations are the preprocessing steps that make downstream CV tasks possible

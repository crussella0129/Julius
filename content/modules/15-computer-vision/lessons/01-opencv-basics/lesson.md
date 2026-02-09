---
id: "01-opencv-basics"
title: "OpenCV Basics"
concepts:
  - opencv
  - image-representation
  - color-spaces
  - pixel-manipulation
why: "Images are just arrays of numbers -- understanding how pixels, color channels, and coordinate systems work is the foundation for all computer vision tasks."
prerequisites:
  - 08-langchain
sources:
  - repo: "opencv/opencv-python"
    section: "Getting Started"
    license: "Apache-2.0"
  - repo: "ultralytics/ultralytics"
    section: "Image Processing Basics"
    license: "AGPL-3.0"
---

# OpenCV Basics

OpenCV (Open Source Computer Vision Library) is the most widely used library for image processing and computer vision. At its core, an image is just a NumPy array of pixel values. Understanding how images are represented as data is the first step to building any vision system.

## How Images Are Represented

A digital image is a grid of pixels. Each pixel has one or more numerical values:
- **Grayscale**: 1 value per pixel (0 = black, 255 = white)
- **Color (BGR)**: 3 values per pixel (Blue, Green, Red channels)

```python
import numpy as np

# Create a small 3x3 grayscale image
gray_image = np.array([
    [0,   128, 255],
    [64,  192, 32],
    [255, 0,   128]
], dtype=np.uint8)

print(f"Shape: {gray_image.shape}")      # (3, 3)
print(f"Data type: {gray_image.dtype}")   # uint8
print(f"Pixel at (0,0): {gray_image[0, 0]}")  # 0 (black)
print(f"Pixel at (0,2): {gray_image[0, 2]}")  # 255 (white)
```

## Reading and Displaying Images

```python
import cv2

# Read an image
# img = cv2.imread("photo.jpg")        # BGR color
# gray = cv2.imread("photo.jpg", 0)    # Grayscale

# For this lesson, we'll create images from scratch
img = np.zeros((100, 100, 3), dtype=np.uint8)  # Black 100x100 BGR image
print(f"Image shape: {img.shape}")  # (100, 100, 3) -> height, width, channels

# Display (in a script with a window system):
# cv2.imshow("Window Name", img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()

# Save an image:
# cv2.imwrite("output.jpg", img)
```

## Image Dimensions and Coordinates

In OpenCV, the convention is **(height, width, channels)**, and pixel access is **(row, column)** = **(y, x)**:

```python
# Create a 200x300 color image (200 rows, 300 columns)
img = np.zeros((200, 300, 3), dtype=np.uint8)
height, width, channels = img.shape
print(f"Height: {height}, Width: {width}, Channels: {channels}")

# Access pixel at row 50, column 100
pixel = img[50, 100]
print(f"Pixel BGR: {pixel}")  # [0, 0, 0] (black)

# Set a pixel to red (BGR format: Blue=0, Green=0, Red=255)
img[50, 100] = [0, 0, 255]
print(f"Now: {img[50, 100]}")  # [0, 0, 255]
```

## Color Spaces

OpenCV uses **BGR** by default (not RGB). This is a historical convention:

```python
# Creating color images
def create_solid_color(height, width, b, g, r):
    """Create a solid color BGR image."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    img[:, :] = [b, g, r]
    return img

red_image = create_solid_color(100, 100, 0, 0, 255)     # Pure red
green_image = create_solid_color(100, 100, 0, 255, 0)   # Pure green
blue_image = create_solid_color(100, 100, 255, 0, 0)    # Pure blue

print(f"Red image, center pixel BGR: {red_image[50, 50]}")
```

## Converting Between Color Spaces

```python
# BGR to RGB (for matplotlib display)
# rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)

# BGR to Grayscale
# gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)

# BGR to HSV (Hue, Saturation, Value)
# hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)

# Manual grayscale conversion (weighted average)
def to_grayscale(bgr_image):
    """Convert BGR image to grayscale using luminosity weights."""
    b = bgr_image[:, :, 0].astype(float)
    g = bgr_image[:, :, 1].astype(float)
    r = bgr_image[:, :, 2].astype(float)
    gray = (0.114 * b + 0.587 * g + 0.299 * r).astype(np.uint8)
    return gray

color_img = np.array([[[255, 0, 0], [0, 255, 0], [0, 0, 255]]], dtype=np.uint8)
gray = to_grayscale(color_img)
print(f"Blue pixel gray: {gray[0, 0]}")    # ~29 (blue is dark)
print(f"Green pixel gray: {gray[0, 1]}")   # ~150 (green is bright)
print(f"Red pixel gray: {gray[0, 2]}")     # ~76 (red is medium)
```

## Drawing on Images

OpenCV provides functions to draw shapes:

```python
# Create a canvas
canvas = np.zeros((300, 300, 3), dtype=np.uint8)

# Draw a line: cv2.line(img, start, end, color, thickness)
# cv2.line(canvas, (0, 0), (300, 300), (0, 255, 0), 2)

# Draw a rectangle: cv2.rectangle(img, top_left, bottom_right, color, thickness)
# cv2.rectangle(canvas, (50, 50), (250, 250), (255, 0, 0), 3)

# Draw a circle: cv2.circle(img, center, radius, color, thickness)
# cv2.circle(canvas, (150, 150), 80, (0, 0, 255), -1)  # -1 = filled

# Pure NumPy drawing (no OpenCV needed):
def draw_rectangle(img, top_left, bottom_right, color, thickness=1):
    """Draw a rectangle on an image using NumPy slicing."""
    y1, x1 = top_left
    y2, x2 = bottom_right
    img[y1:y1+thickness, x1:x2] = color       # Top edge
    img[y2-thickness:y2, x1:x2] = color       # Bottom edge
    img[y1:y2, x1:x1+thickness] = color       # Left edge
    img[y1:y2, x2-thickness:x2] = color       # Right edge
    return img

canvas = np.zeros((100, 100, 3), dtype=np.uint8)
draw_rectangle(canvas, (10, 10), (90, 90), [0, 255, 0], 2)
print(f"Pixel at (10, 50): {canvas[10, 50]}")  # [0, 255, 0] (green, on the edge)
print(f"Pixel at (50, 50): {canvas[50, 50]}")  # [0, 0, 0] (black, inside)
```

## Regions of Interest (ROI)

You can extract and manipulate sub-regions of an image using NumPy slicing:

```python
# Create a test image
img = np.zeros((200, 200, 3), dtype=np.uint8)
img[50:100, 50:100] = [0, 0, 255]   # Red square

# Extract the ROI
roi = img[50:100, 50:100]
print(f"ROI shape: {roi.shape}")     # (50, 50, 3)
print(f"ROI mean: {roi.mean():.1f}")

# Copy ROI to another location
img[100:150, 100:150] = roi
```

## Image Properties Summary

```python
img = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
print(f"Shape:    {img.shape}")        # (480, 640, 3)
print(f"Height:   {img.shape[0]}")     # 480
print(f"Width:    {img.shape[1]}")     # 640
print(f"Channels: {img.shape[2]}")     # 3
print(f"Dtype:    {img.dtype}")        # uint8
print(f"Size:     {img.size}")         # 921600 (480 * 640 * 3)
print(f"Min:      {img.min()}")
print(f"Max:      {img.max()}")
```

## Common Mistakes

- **Confusing BGR and RGB**: OpenCV uses BGR; matplotlib and PIL use RGB. Convert before displaying.
- **Confusing (x, y) and (row, col)**: Pixel access is `img[row, col]` = `img[y, x]`.
- **Forgetting uint8 overflow**: 200 + 100 = 44 in uint8 (wraps around). Use `np.clip` or convert to int first.
- **Modifying a view instead of a copy**: `roi = img[50:100, 50:100]` is a view -- changes to `roi` affect `img`. Use `.copy()` for independent data.

## Key Takeaways

- Images are NumPy arrays with shape (height, width, channels)
- OpenCV uses BGR color order, not RGB
- Pixel access is [row, col] which is [y, x]
- uint8 values range from 0 to 255
- NumPy slicing lets you extract and manipulate regions of interest
- Color space conversions (BGR to grayscale, HSV) are essential for many CV tasks

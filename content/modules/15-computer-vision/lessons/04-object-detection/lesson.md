---
id: "04-object-detection"
title: "Object Detection"
concepts:
  - bounding-boxes
  - iou
  - nms-detection
  - yolo
why: "Object detection finds and labels every object in an image with a bounding box -- it powers self-driving cars, security cameras, and augmented reality."
prerequisites:
  - 03-feature-detection
sources:
  - repo: "ultralytics/ultralytics"
    section: "YOLO Object Detection"
    license: "AGPL-3.0"
  - repo: "opencv/opencv-python"
    section: "Object Detection"
    license: "Apache-2.0"
---

# Object Detection

Object detection goes beyond classification: instead of asking "what is in this image?", it asks "what objects are in this image and where are they?" The output is a set of bounding boxes, each with a class label and a confidence score.

## Bounding Boxes

A bounding box is a rectangle that tightly encloses an object. There are two common formats:

```python
# Format 1: (x_min, y_min, x_max, y_max) -- corner format
box_corner = (50, 30, 200, 180)  # top-left to bottom-right

# Format 2: (x_center, y_center, width, height) -- YOLO format
box_yolo = (125, 105, 150, 150)

def corner_to_yolo(x1, y1, x2, y2):
    """Convert corner format to YOLO format."""
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    w = x2 - x1
    h = y2 - y1
    return (cx, cy, w, h)

def yolo_to_corner(cx, cy, w, h):
    """Convert YOLO format to corner format."""
    x1 = cx - w / 2
    y1 = cy - h / 2
    x2 = cx + w / 2
    y2 = cy + h / 2
    return (x1, y1, x2, y2)

result = corner_to_yolo(50, 30, 200, 180)
print(f"YOLO format: center=({result[0]}, {result[1]}), size=({result[2]}, {result[3]})")

back = yolo_to_corner(*result)
print(f"Corner format: ({back[0]}, {back[1]}) to ({back[2]}, {back[3]})")
```

## Intersection over Union (IoU)

IoU measures how much two bounding boxes overlap. It is the standard metric for evaluating detection accuracy:

```python
def compute_iou(box1, box2):
    """
    Compute IoU between two boxes in corner format.
    box = (x1, y1, x2, y2)
    """
    # Intersection coordinates
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    # Intersection area
    inter_width = max(0, x2 - x1)
    inter_height = max(0, y2 - y1)
    intersection = inter_width * inter_height

    # Union area
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    if union == 0:
        return 0.0
    return intersection / union

# Perfect overlap
box_a = (0, 0, 100, 100)
box_b = (0, 0, 100, 100)
print(f"Perfect overlap IoU: {compute_iou(box_a, box_b):.2f}")  # 1.00

# Partial overlap
box_c = (50, 50, 150, 150)
print(f"Partial overlap IoU: {compute_iou(box_a, box_c):.2f}")  # 0.14

# No overlap
box_d = (200, 200, 300, 300)
print(f"No overlap IoU: {compute_iou(box_a, box_d):.2f}")  # 0.00
```

## Non-Maximum Suppression for Detection

Detectors often produce multiple overlapping boxes for the same object. NMS keeps only the best one:

```python
def detection_nms(detections, iou_threshold=0.5):
    """
    Apply NMS to detections.
    Each detection: (x1, y1, x2, y2, confidence, class_id)
    """
    if not detections:
        return []

    # Sort by confidence (highest first)
    sorted_dets = sorted(detections, key=lambda d: d[4], reverse=True)
    keep = []

    while sorted_dets:
        best = sorted_dets.pop(0)
        keep.append(best)

        remaining = []
        for det in sorted_dets:
            iou = compute_iou(best[:4], det[:4])
            if iou < iou_threshold:
                remaining.append(det)
        sorted_dets = remaining

    return keep

# Example: three overlapping detections of the same object
detections = [
    (10, 10, 100, 100, 0.9, 0),   # High confidence
    (15, 15, 105, 105, 0.75, 0),   # Overlapping, lower confidence
    (12, 12, 98, 98, 0.85, 0),     # Overlapping, medium confidence
    (200, 200, 300, 300, 0.8, 1),  # Different object, no overlap
]

kept = detection_nms(detections, iou_threshold=0.5)
print(f"Before NMS: {len(detections)} detections")
print(f"After NMS:  {len(kept)} detections")
for det in kept:
    print(f"  Box: ({det[0]},{det[1]})-({det[2]},{det[3]}), "
          f"conf: {det[4]}, class: {det[5]}")
```

## How YOLO Works

YOLO (You Only Look Once) divides the image into a grid and predicts bounding boxes and class probabilities for each cell simultaneously:

```python
def simulate_yolo_grid(image_h, image_w, grid_size):
    """Simulate YOLO's grid division of an image."""
    cell_h = image_h / grid_size
    cell_w = image_w / grid_size

    cells = []
    for row in range(grid_size):
        for col in range(grid_size):
            cell = {
                "grid_pos": (row, col),
                "y_range": (row * cell_h, (row + 1) * cell_h),
                "x_range": (col * cell_w, (col + 1) * cell_w),
            }
            cells.append(cell)
    return cells

grid = simulate_yolo_grid(416, 416, grid_size=7)
print(f"Total grid cells: {len(grid)}")
print(f"First cell: {grid[0]}")
print(f"Last cell: {grid[-1]}")
# Each cell predicts B bounding boxes, each with (x, y, w, h, confidence, classes)
```

## Detection Output Format

A typical detection system outputs a list of predictions:

```python
class Detection:
    """Represents a single object detection."""
    def __init__(self, bbox, confidence, class_name):
        self.bbox = bbox           # (x1, y1, x2, y2)
        self.confidence = confidence
        self.class_name = class_name

    def area(self):
        x1, y1, x2, y2 = self.bbox
        return (x2 - x1) * (y2 - y1)

    def __repr__(self):
        return f"{self.class_name} ({self.confidence:.0%}) at {self.bbox}"

# Simulated detections from YOLO
detections = [
    Detection((120, 50, 280, 300), 0.95, "person"),
    Detection((400, 100, 550, 350), 0.88, "car"),
    Detection((50, 200, 130, 380), 0.72, "dog"),
]

for det in detections:
    print(f"  {det}, area={det.area()}")
```

## Using YOLO with Ultralytics

```python
# pip install ultralytics

# from ultralytics import YOLO
# model = YOLO("yolov8n.pt")  # Load a pre-trained model

# Run inference
# results = model("image.jpg")

# Access detections
# for result in results:
#     boxes = result.boxes
#     for box in boxes:
#         x1, y1, x2, y2 = box.xyxy[0].tolist()
#         confidence = box.conf[0].item()
#         class_id = int(box.cls[0].item())
#         class_name = model.names[class_id]
#         print(f"{class_name}: ({x1:.0f},{y1:.0f})-({x2:.0f},{y2:.0f}) conf={confidence:.2f}")
```

## Evaluating Detection: mAP

Mean Average Precision (mAP) is the standard detection metric. It measures both localization accuracy (IoU) and classification accuracy:

```python
def precision_recall(detections, ground_truths, iou_threshold=0.5):
    """Compute precision and recall for a set of detections."""
    tp = 0  # True positives
    fp = 0  # False positives
    matched = set()

    sorted_dets = sorted(detections, key=lambda d: d[4], reverse=True)

    for det in sorted_dets:
        best_iou = 0
        best_gt = -1
        for i, gt in enumerate(ground_truths):
            if i in matched:
                continue
            iou = compute_iou(det[:4], gt[:4])
            if iou > best_iou:
                best_iou = iou
                best_gt = i
        if best_iou >= iou_threshold:
            tp += 1
            matched.add(best_gt)
        else:
            fp += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / len(ground_truths) if ground_truths else 0
    return precision, recall

dets = [(10, 10, 100, 100, 0.9, 0), (200, 200, 300, 300, 0.8, 0)]
gts = [(15, 15, 105, 105, 1.0, 0), (250, 250, 330, 330, 1.0, 0)]
p, r = precision_recall(dets, gts)
print(f"Precision: {p:.2f}, Recall: {r:.2f}")
```

## Common Mistakes

- **Confusing box formats**: YOLO uses (cx, cy, w, h) but OpenCV uses (x1, y1, x2, y2). Always convert.
- **IoU threshold too low**: 0.5 is standard. Lower thresholds accept sloppy localizations.
- **Forgetting NMS**: Without NMS, you get 5-10 overlapping boxes per object.
- **Not scaling boxes for resized images**: If you resize the image for the model, scale the boxes back.

## Key Takeaways

- Bounding boxes locate objects with (x1, y1, x2, y2) or (cx, cy, w, h) format
- IoU measures overlap between predicted and ground-truth boxes
- NMS removes duplicate detections by keeping only the most confident ones
- YOLO processes the entire image in one pass for real-time detection
- mAP evaluates both localization accuracy and classification accuracy

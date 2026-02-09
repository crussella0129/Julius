---
id: "06-cv-project"
title: "Computer Vision Project"
concepts:
  - cv-pipeline
  - image-classification
  - data-augmentation
  - model-evaluation
why: "Building a complete CV project from data loading through evaluation ties all the pieces together -- this is how real computer vision systems are built in practice."
prerequisites:
  - 05-segmentation
sources:
  - repo: "ultralytics/ultralytics"
    section: "Training Custom Models"
    license: "AGPL-3.0"
  - repo: "opencv/opencv-python"
    section: "Tutorials"
    license: "Apache-2.0"
---

# Computer Vision Project

In this lesson, we tie together everything from the module by building a complete computer vision pipeline: data preparation, feature extraction, classification, and evaluation. This mirrors the workflow of real CV projects.

## The CV Pipeline

Every computer vision project follows the same structure:

```
Raw Images -> Preprocessing -> Feature Extraction -> Model -> Predictions -> Evaluation
```

```python
class CVPipeline:
    """A simple computer vision pipeline."""
    def __init__(self, preprocessor, feature_extractor, classifier):
        self.preprocessor = preprocessor
        self.feature_extractor = feature_extractor
        self.classifier = classifier

    def predict(self, image):
        processed = self.preprocessor(image)
        features = self.feature_extractor(processed)
        return self.classifier(features)

    def evaluate(self, images, labels):
        correct = 0
        for img, label in zip(images, labels):
            pred = self.predict(img)
            if pred == label:
                correct += 1
        return correct / len(labels)
```

## Data Loading and Preparation

```python
import numpy as np

def create_synthetic_dataset(num_samples=100):
    """Create a synthetic image classification dataset."""
    np.random.seed(42)
    images = []
    labels = []

    for _ in range(num_samples // 2):
        # Class 0: bright images (average pixel > 128)
        img = np.random.randint(130, 256, (32, 32), dtype=np.uint8)
        images.append(img)
        labels.append(0)

        # Class 1: dark images (average pixel < 128)
        img = np.random.randint(0, 126, (32, 32), dtype=np.uint8)
        images.append(img)
        labels.append(1)

    return images, labels

def train_test_split(images, labels, test_ratio=0.2):
    """Split data into training and test sets."""
    n = len(images)
    indices = list(range(n))
    np.random.seed(42)
    np.random.shuffle(indices)

    split = int(n * (1 - test_ratio))
    train_idx = indices[:split]
    test_idx = indices[split:]

    train_imgs = [images[i] for i in train_idx]
    train_labels = [labels[i] for i in train_idx]
    test_imgs = [images[i] for i in test_idx]
    test_labels = [labels[i] for i in test_idx]

    return train_imgs, train_labels, test_imgs, test_labels

images, labels = create_synthetic_dataset(100)
train_x, train_y, test_x, test_y = train_test_split(images, labels)
print(f"Training: {len(train_x)} images")
print(f"Test: {len(test_x)} images")
```

## Data Augmentation

Augmentation creates variations of training images to improve model robustness:

```python
def augment_flip_horizontal(image):
    """Flip an image horizontally."""
    return image[:, ::-1].copy()

def augment_brightness(image, delta):
    """Adjust image brightness."""
    result = image.astype(np.int16) + delta
    return np.clip(result, 0, 255).astype(np.uint8)

def augment_noise(image, std=10):
    """Add Gaussian noise to an image."""
    noise = np.random.normal(0, std, image.shape)
    result = image.astype(np.float64) + noise
    return np.clip(result, 0, 255).astype(np.uint8)

def augment_crop_and_resize(image, crop_fraction=0.8):
    """Random crop and resize back to original size."""
    h, w = image.shape[:2]
    new_h = int(h * crop_fraction)
    new_w = int(w * crop_fraction)
    top = np.random.randint(0, h - new_h + 1)
    left = np.random.randint(0, w - new_w + 1)
    cropped = image[top:top+new_h, left:left+new_w]
    # Simple resize by repeating pixels (real code uses interpolation)
    resized = np.repeat(np.repeat(cropped, 2, axis=0)[:h], 2, axis=1)[:, :w]
    return resized

# Demonstrate augmentation
original = np.random.randint(100, 200, (8, 8), dtype=np.uint8)
flipped = augment_flip_horizontal(original)
bright = augment_brightness(original, 30)
noisy = augment_noise(original, 15)

print(f"Original mean: {original.mean():.1f}")
print(f"Flipped mean:  {flipped.mean():.1f}")    # Same (just mirrored)
print(f"Bright mean:   {bright.mean():.1f}")      # Higher by ~30
print(f"Noisy mean:    {noisy.mean():.1f}")        # Similar (noise is zero-mean)
```

## Feature Extraction

Extract numerical features from images for classification:

```python
def extract_features(image):
    """Extract simple statistical features from a grayscale image."""
    features = [
        image.mean(),                          # Average brightness
        image.std(),                           # Contrast
        image.min(),                           # Darkest pixel
        image.max(),                           # Brightest pixel
        np.median(image),                      # Median brightness
        (image > 128).sum() / image.size,      # Fraction of bright pixels
    ]
    return features

def extract_histogram_features(image, bins=8):
    """Extract histogram features (distribution of pixel values)."""
    hist, _ = np.histogram(image.flatten(), bins=bins, range=(0, 256))
    # Normalize to sum to 1
    return (hist / hist.sum()).tolist()

img = np.random.randint(50, 200, (32, 32), dtype=np.uint8)
stats = extract_features(img)
hist = extract_histogram_features(img)
print(f"Statistical features ({len(stats)}): {[f'{f:.2f}' for f in stats]}")
print(f"Histogram features ({len(hist)}): {[f'{h:.3f}' for h in hist]}")
```

## Simple Classifier: Nearest Neighbor

```python
import math

def euclidean_distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

class KNNClassifier:
    """K-Nearest Neighbors classifier."""
    def __init__(self, k=3):
        self.k = k
        self.train_features = []
        self.train_labels = []

    def fit(self, features, labels):
        self.train_features = features
        self.train_labels = labels

    def predict(self, features):
        distances = [
            (euclidean_distance(features, tf), tl)
            for tf, tl in zip(self.train_features, self.train_labels)
        ]
        distances.sort(key=lambda x: x[0])
        k_nearest = [label for _, label in distances[:self.k]]
        # Majority vote
        counts = {}
        for label in k_nearest:
            counts[label] = counts.get(label, 0) + 1
        return max(counts, key=counts.get)

# Train and evaluate
train_features = [extract_features(img) for img in train_x]
test_features = [extract_features(img) for img in test_x]

knn = KNNClassifier(k=3)
knn.fit(train_features, train_y)

predictions = [knn.predict(f) for f in test_features]
accuracy = sum(p == a for p, a in zip(predictions, test_y)) / len(test_y)
print(f"KNN Accuracy: {accuracy:.0%}")
```

## Confusion Matrix

A confusion matrix shows how predictions map to actual labels:

```python
def confusion_matrix(predictions, actual, num_classes):
    """Build a confusion matrix."""
    matrix = [[0] * num_classes for _ in range(num_classes)]
    for pred, true in zip(predictions, actual):
        matrix[true][pred] += 1
    return matrix

def print_confusion_matrix(matrix, class_names):
    """Pretty print a confusion matrix."""
    header = "          " + "  ".join(f"{n:>8}" for n in class_names)
    print(header)
    for i, row in enumerate(matrix):
        row_str = "  ".join(f"{v:>8}" for v in row)
        print(f"{class_names[i]:>8}  {row_str}")

cm = confusion_matrix(predictions, test_y, num_classes=2)
print_confusion_matrix(cm, ["bright", "dark"])
```

## Precision, Recall, F1-Score

```python
def compute_metrics(predictions, actual, positive_class=1):
    """Compute precision, recall, and F1 score."""
    tp = sum(1 for p, a in zip(predictions, actual) if p == positive_class and a == positive_class)
    fp = sum(1 for p, a in zip(predictions, actual) if p == positive_class and a != positive_class)
    fn = sum(1 for p, a in zip(predictions, actual) if p != positive_class and a == positive_class)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return {"precision": precision, "recall": recall, "f1": f1}

metrics = compute_metrics(predictions, test_y, positive_class=1)
for name, value in metrics.items():
    print(f"  {name}: {value:.3f}")
```

## Putting It Together: Full Pipeline

```python
def run_cv_experiment(images, labels, k=3, test_ratio=0.2):
    """Run a complete CV classification experiment."""
    # Split data
    train_x, train_y, test_x, test_y = train_test_split(images, labels, test_ratio)

    # Extract features
    train_feat = [extract_features(img) for img in train_x]
    test_feat = [extract_features(img) for img in test_x]

    # Train classifier
    clf = KNNClassifier(k=k)
    clf.fit(train_feat, train_y)

    # Predict
    preds = [clf.predict(f) for f in test_feat]

    # Evaluate
    acc = sum(p == a for p, a in zip(preds, test_y)) / len(test_y)
    metrics = compute_metrics(preds, test_y)

    return {
        "accuracy": acc,
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1": metrics["f1"],
        "num_train": len(train_x),
        "num_test": len(test_x),
    }

results = run_cv_experiment(images, labels, k=3)
print("Experiment Results:")
for key, value in results.items():
    if isinstance(value, float):
        print(f"  {key}: {value:.3f}")
    else:
        print(f"  {key}: {value}")
```

## Common Mistakes

- **Not splitting data before augmentation**: Augment ONLY the training set. Augmenting test data leaks information.
- **Using raw pixels as features**: Raw pixels are high-dimensional and noisy. Extract meaningful features.
- **Ignoring class imbalance**: If 90% of images are class A, a model that always predicts A gets 90% accuracy. Use F1 score.
- **Not normalizing features**: Features on different scales (mean=150, std=30) confuse distance-based classifiers. Normalize to [0, 1].

## Key Takeaways

- A CV pipeline chains preprocessing, feature extraction, classification, and evaluation
- Data augmentation (flip, brightness, noise, crop) increases training diversity
- Feature extraction converts images to compact numerical representations
- KNN is a simple baseline classifier that works well with good features
- Confusion matrix, precision, recall, and F1 provide complete evaluation
- Always split data before any augmentation to prevent leakage

---
id: "09-cnn"
title: "Convolutional Neural Networks"
concepts:
  - convolution
  - pooling
  - cnn-architecture
  - image-classification
why: "CNNs revolutionized computer vision -- understanding convolution and pooling is essential for any image or spatial data task."
prerequisites:
  - 08-pytorch-intro
sources:
  - repo: "pytorch/pytorch"
    section: "Tutorials - Training a Classifier"
    license: "BSD-3-Clause"
  - repo: "rasbt/machine-learning-book"
    section: "Implementing a Deep Convolutional Neural Network"
    license: "MIT"
---

# Convolutional Neural Networks

Convolutional Neural Networks (CNNs) are designed for grid-structured data like images. Instead of connecting every input to every output (fully connected), CNNs use small filters that slide across the image, detecting local patterns like edges, textures, and shapes.

## Why CNNs for Images?

A 28x28 grayscale image has 784 pixels. A fully connected layer to 128 neurons would need 784 * 128 = 100,352 weights. For a 224x224 color image, that is over 38 million weights for just one layer.

CNNs solve this with:
- **Local connectivity**: Each neuron sees only a small patch
- **Weight sharing**: The same filter is applied across the entire image
- **Translation invariance**: A pattern is detected wherever it appears

## The Convolution Operation

A convolution slides a small filter (kernel) across the input, computing element-wise products and summing:

```python
def convolve_1d(signal, kernel):
    output = []
    k_len = len(kernel)
    for i in range(len(signal) - k_len + 1):
        value = sum(signal[i+j] * kernel[j] for j in range(k_len))
        output.append(value)
    return output

signal = [1, 0, 2, 3, 1, 0, 1]
kernel = [1, 0, -1]  # Edge detector
result = convolve_1d(signal, kernel)
print(result)  # [-1, -3, -1, 3, 0]
```

## 2D Convolution

For images, the filter is 2D:

```python
def convolve_2d(image, kernel):
    h, w = len(image), len(image[0])
    kh, kw = len(kernel), len(kernel[0])
    output = []
    for i in range(h - kh + 1):
        row = []
        for j in range(w - kw + 1):
            value = 0
            for ki in range(kh):
                for kj in range(kw):
                    value += image[i+ki][j+kj] * kernel[ki][kj]
            row.append(value)
        output.append(row)
    return output
```

## Common Filters

```python
# Edge detection (horizontal)
horizontal_edge = [[-1, -1, -1],
                   [ 0,  0,  0],
                   [ 1,  1,  1]]

# Edge detection (vertical)
vertical_edge = [[-1, 0, 1],
                 [-1, 0, 1],
                 [-1, 0, 1]]

# Blur
blur = [[1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9],
        [1/9, 1/9, 1/9]]
```

## Pooling

Pooling reduces spatial dimensions while keeping important features:

```python
def max_pool_2d(image, pool_size=2):
    h, w = len(image), len(image[0])
    output = []
    for i in range(0, h, pool_size):
        row = []
        for j in range(0, w, pool_size):
            patch = [image[i+di][j+dj]
                     for di in range(pool_size)
                     for dj in range(pool_size)
                     if i+di < h and j+dj < w]
            row.append(max(patch))
        output.append(row)
    return output
```

Max pooling takes the maximum value in each patch, making the network robust to small translations.

## CNN Architecture in PyTorch

```python
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.fc1 = nn.Linear(32 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))   # 28x28 -> 14x14
        x = self.pool(self.relu(self.conv2(x)))   # 14x14 -> 7x7
        x = x.view(-1, 32 * 7 * 7)               # Flatten
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x
```

## CNN Building Blocks

1. **Conv2d**: Applies learned filters to extract features
2. **ReLU**: Non-linear activation after each conv layer
3. **MaxPool2d**: Reduces spatial dimensions
4. **Flatten**: Converts 2D feature maps to 1D for classification
5. **Linear**: Fully connected layers for final prediction

## Training a CNN

```python
model = SimpleCNN()
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    for images, labels in train_loader:
        outputs = model(images)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
```

## Feature Hierarchy

Each layer learns increasingly abstract features:
- **Layer 1**: Edges, corners
- **Layer 2**: Textures, patterns
- **Layer 3**: Object parts (eyes, wheels)
- **Deeper layers**: Full objects

## Key Takeaways

- Convolution slides filters across images to detect local patterns
- Pooling reduces spatial dimensions while preserving important features
- CNNs build a hierarchy from edges to textures to objects
- PyTorch's `nn.Conv2d` and `nn.MaxPool2d` implement these operations
- The typical pattern: Conv -> ReLU -> Pool -> Conv -> ReLU -> Pool -> Flatten -> Linear

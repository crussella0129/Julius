---
id: "08-pytorch-intro"
title: "PyTorch Introduction"
concepts:
  - tensors
  - autograd
  - nn-module
  - training-loop
why: "PyTorch is the leading deep learning framework -- understanding tensors and autograd unlocks the entire ecosystem of modern AI."
prerequisites:
  - 07-neural-networks
sources:
  - repo: "pytorch/pytorch"
    section: "Tutorials - Learn the Basics"
    license: "BSD-3-Clause"
---

# PyTorch Introduction

PyTorch is a deep learning framework that provides two key features: GPU-accelerated tensor computation and automatic differentiation. Together, these make building and training neural networks much easier than doing it from scratch.

## Tensors

Tensors are PyTorch's version of NumPy arrays, with GPU support:

```python
import torch

# Create tensors
a = torch.tensor([1, 2, 3, 4])
b = torch.zeros(3, 4)       # 3x4 matrix of zeros
c = torch.ones(2, 3)        # 2x3 matrix of ones
d = torch.randn(3, 3)       # 3x3 random normal

print(a.shape)    # torch.Size([4])
print(a.dtype)    # torch.int64
```

## Tensor Operations

```python
x = torch.tensor([1.0, 2.0, 3.0])
y = torch.tensor([4.0, 5.0, 6.0])

# Arithmetic
print(x + y)        # tensor([5., 7., 9.])
print(x * y)        # tensor([4., 10., 18.])
print(torch.dot(x, y))  # 32.0

# Matrix multiplication
A = torch.randn(2, 3)
B = torch.randn(3, 4)
C = A @ B           # shape: (2, 4)

# Reshaping
x = torch.arange(12)
m = x.reshape(3, 4)
```

## NumPy Interoperability

```python
import numpy as np

# NumPy to PyTorch
np_array = np.array([1, 2, 3])
tensor = torch.from_numpy(np_array)

# PyTorch to NumPy
back_to_numpy = tensor.numpy()
```

## Autograd: Automatic Differentiation

PyTorch tracks operations on tensors and computes gradients automatically:

```python
x = torch.tensor(3.0, requires_grad=True)
y = x ** 2 + 2 * x + 1  # y = x^2 + 2x + 1

y.backward()  # Compute dy/dx

print(x.grad)  # tensor(8.) because dy/dx = 2x + 2 = 2(3) + 2 = 8
```

This is the engine behind backpropagation -- no manual gradient computation needed.

## Building Models with nn.Module

```python
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, output_size)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = self.layer2(x)
        x = self.sigmoid(x)
        return x

model = SimpleNet(2, 4, 1)
```

## Loss Functions and Optimizers

```python
# Loss function
criterion = nn.BCELoss()          # Binary cross-entropy
# criterion = nn.MSELoss()        # Mean squared error
# criterion = nn.CrossEntropyLoss() # Multi-class

# Optimizer
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
# optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
```

## The Training Loop

```python
# Training data
X = torch.tensor([[0,0],[0,1],[1,0],[1,1]], dtype=torch.float32)
y = torch.tensor([[0],[1],[1],[0]], dtype=torch.float32)

model = SimpleNet(2, 4, 1)
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(1000):
    # Forward pass
    outputs = model(X)
    loss = criterion(outputs, y)

    # Backward pass
    optimizer.zero_grad()   # Clear old gradients
    loss.backward()         # Compute new gradients
    optimizer.step()        # Update weights

    if epoch % 200 == 0:
        print(f"Epoch {epoch}: loss = {loss.item():.4f}")
```

## Making Predictions

```python
model.eval()  # Switch to evaluation mode
with torch.no_grad():  # Disable gradient tracking
    predictions = model(X)
    predicted_classes = (predictions > 0.5).int()
    print(predicted_classes)
```

## GPU Acceleration

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = SimpleNet(2, 4, 1).to(device)
X = X.to(device)
y = y.to(device)
```

## Key Takeaways

- Tensors are GPU-accelerated arrays, similar to NumPy arrays
- Autograd automatically computes gradients for backpropagation
- Models inherit from `nn.Module` and define layers in `__init__` and computation in `forward`
- The training loop: forward pass, compute loss, backward pass, optimizer step
- Use `model.eval()` and `torch.no_grad()` for inference

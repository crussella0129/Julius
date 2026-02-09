---
id: "07-neural-networks"
title: "Neural Networks from Scratch"
concepts:
  - perceptron
  - activation-functions
  - backpropagation
  - gradient-computation
why: "Building a neural network from scratch is the best way to truly understand how deep learning works -- the math behind the magic."
prerequisites:
  - 06-unsupervised
sources:
  - repo: "rasbt/machine-learning-book"
    section: "Training Artificial Neural Networks"
    license: "MIT"
---

# Neural Networks from Scratch

Neural networks are inspired by biological neurons. Each artificial neuron takes inputs, multiplies them by weights, adds a bias, and passes the result through an activation function. Stacking layers of neurons creates a deep neural network.

## The Perceptron

The simplest neural network is a single neuron (perceptron):

```
output = activation(w1*x1 + w2*x2 + ... + bias)
```

```python
def perceptron(inputs, weights, bias):
    total = sum(x * w for x, w in zip(inputs, weights)) + bias
    return 1 if total >= 0 else 0  # Step activation

# AND gate
weights = [1, 1]
bias = -1.5

print(perceptron([0, 0], weights, bias))  # 0
print(perceptron([0, 1], weights, bias))  # 0
print(perceptron([1, 0], weights, bias))  # 0
print(perceptron([1, 1], weights, bias))  # 1
```

## Activation Functions

Activation functions introduce non-linearity, allowing networks to learn complex patterns:

```python
import math

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def relu(x):
    return max(0, x)

def tanh(x):
    return math.tanh(x)
```

- **Sigmoid**: Outputs between 0 and 1 (good for probabilities)
- **ReLU**: Outputs x if positive, 0 otherwise (most common in hidden layers)
- **Tanh**: Outputs between -1 and 1

## A Simple Neural Network

Build a two-layer network from scratch:

```python
import numpy as np

class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        rng = np.random.default_rng(42)
        self.w1 = rng.standard_normal((input_size, hidden_size)) * 0.5
        self.b1 = np.zeros(hidden_size)
        self.w2 = rng.standard_normal((hidden_size, output_size)) * 0.5
        self.b2 = np.zeros(output_size)

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

    def forward(self, X):
        self.z1 = X @ self.w1 + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = self.a1 @ self.w2 + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
```

## Forward Pass

The forward pass computes the network's output:

1. Multiply inputs by weights, add bias: `z = X @ W + b`
2. Apply activation function: `a = sigmoid(z)`
3. Feed into next layer
4. Output layer gives the prediction

## Backpropagation

Backpropagation computes how to adjust each weight to reduce the error:

```python
def train(self, X, y, learning_rate=0.1):
    # Forward pass
    output = self.forward(X)

    # Compute error
    error = y - output

    # Output layer gradients
    d2 = error * output * (1 - output)  # sigmoid derivative

    # Hidden layer gradients
    error_hidden = d2 @ self.w2.T
    d1 = error_hidden * self.a1 * (1 - self.a1)

    # Update weights
    self.w2 += self.a1.T @ d2 * learning_rate
    self.b2 += d2.sum(axis=0) * learning_rate
    self.w1 += X.T @ d1 * learning_rate
    self.b1 += d1.sum(axis=0) * learning_rate
```

## The Chain Rule

Backpropagation is just the chain rule of calculus applied layer by layer:

```
dLoss/dW1 = dLoss/dOutput * dOutput/dHidden * dHidden/dW1
```

Each layer's gradient depends on the gradient from the layer above it, multiplied by the local derivative.

## Training Loop

```python
nn = NeuralNetwork(2, 4, 1)

# XOR training data
X = np.array([[0,0], [0,1], [1,0], [1,1]])
y = np.array([[0], [1], [1], [0]])

for epoch in range(10000):
    nn.train(X, y, learning_rate=0.5)
    if epoch % 2000 == 0:
        loss = np.mean((y - nn.forward(X)) ** 2)
        print(f"Epoch {epoch}: loss = {loss:.4f}")

# Test
predictions = nn.forward(X)
print(np.round(predictions, 2))
```

## Loss Functions

- **MSE** (Mean Squared Error): For regression
- **Cross-Entropy**: For classification (better gradients)

```python
def mse_loss(y_true, y_pred):
    return np.mean((y_true - y_pred) ** 2)

def binary_cross_entropy(y_true, y_pred):
    y_pred = np.clip(y_pred, 1e-7, 1 - 1e-7)
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
```

## Key Takeaways

- A neuron computes: output = activation(weights * inputs + bias)
- Activation functions (sigmoid, ReLU) add non-linearity
- Forward pass: compute predictions layer by layer
- Backpropagation: compute gradients using the chain rule, update weights
- Training iteratively reduces the loss by adjusting weights

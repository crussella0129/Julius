---
id: "07-llm-from-scratch"
title: "Building an LLM from Scratch"
concepts:
  - language-model
  - token-prediction
  - training-loop
  - cross-entropy-loss
why: "Building a tiny language model from scratch demystifies GPT -- you will see that text generation is just next-token prediction with attention, repeated."
prerequisites:
  - 06-huggingface
sources:
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapters 4-5 - Building a GPT Model"
    license: "MIT"
  - repo: "karpathy/nanoGPT"
    section: "Model Architecture"
    license: "MIT"
---

# Building an LLM from Scratch

A Large Language Model is, at its core, a next-token predictor. Given a sequence of tokens, it predicts the probability distribution over the next token. By sampling from that distribution repeatedly, it generates text. Let's build one step by step.

## Step 1: Character-Level Tokenizer

The simplest tokenizer uses individual characters as tokens:

```python
class CharTokenizer:
    """Character-level tokenizer."""
    def __init__(self, text):
        chars = sorted(set(text))
        self.char_to_id = {c: i for i, c in enumerate(chars)}
        self.id_to_char = {i: c for i, c in enumerate(chars)}
        self.vocab_size = len(chars)

    def encode(self, text):
        return [self.char_to_id[c] for c in text]

    def decode(self, ids):
        return "".join(self.id_to_char[i] for i in ids)

text = "hello world"
tok = CharTokenizer(text)
ids = tok.encode("hello")
print(f"Vocab size: {tok.vocab_size}")
print(f"Encoded: {ids}")
print(f"Decoded: {tok.decode(ids)}")
```

## Step 2: Creating Training Data

For a language model, the input is a sequence of tokens, and the target is the same sequence shifted by one position:

```python
def create_training_pairs(token_ids, block_size):
    """Create (input, target) pairs for language modeling."""
    pairs = []
    for i in range(len(token_ids) - block_size):
        x = token_ids[i : i + block_size]
        y = token_ids[i + 1 : i + block_size + 1]
        pairs.append((x, y))
    return pairs

ids = [0, 1, 2, 3, 4, 5, 6, 7]
pairs = create_training_pairs(ids, block_size=4)
for x, y in pairs[:3]:
    print(f"Input: {x} -> Target: {y}")
# Input: [0, 1, 2, 3] -> Target: [1, 2, 3, 4]
# Input: [1, 2, 3, 4] -> Target: [2, 3, 4, 5]
# Input: [2, 3, 4, 5] -> Target: [3, 4, 5, 6]
```

## Step 3: The Embedding Layer

Convert token IDs to dense vectors:

```python
import random

random.seed(42)

def create_embeddings(vocab_size, embed_dim):
    """Create a random embedding table."""
    return [[random.gauss(0, 0.02) for _ in range(embed_dim)]
            for _ in range(vocab_size)]

def lookup(embedding_table, token_ids):
    """Look up embeddings for a list of token IDs."""
    return [embedding_table[tid] for tid in token_ids]

embed_table = create_embeddings(vocab_size=10, embed_dim=4)
token_ids = [2, 5, 3]
vectors = lookup(embed_table, token_ids)
for tid, vec in zip(token_ids, vectors):
    print(f"Token {tid}: [{', '.join(f'{v:.3f}' for v in vec)}]")
```

## Step 4: Simplified Attention Layer

```python
import math

def softmax(scores):
    max_s = max(scores)
    exps = [math.exp(s - max_s) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

def causal_attention(embeddings):
    """Single-head causal self-attention on a sequence of embeddings."""
    n = len(embeddings)
    d = len(embeddings[0])
    outputs = []

    for i in range(n):
        scores = []
        for j in range(n):
            if j > i:
                scores.append(float('-inf'))
            else:
                score = sum(embeddings[i][k] * embeddings[j][k] for k in range(d))
                scores.append(score / math.sqrt(d))
        weights = softmax(scores)
        out = [sum(weights[j] * embeddings[j][k] for j in range(n)) for k in range(d)]
        outputs.append(out)

    return outputs
```

## Step 5: Cross-Entropy Loss

The loss function measures how well the model predicts the next token:

```python
def cross_entropy_loss(predicted_probs, target_ids):
    """Compute cross-entropy loss for next-token prediction."""
    loss = 0.0
    for probs, target in zip(predicted_probs, target_ids):
        # Clip to avoid log(0)
        p = max(probs[target], 1e-10)
        loss -= math.log(p)
    return loss / len(target_ids)

# Example: model predicts uniform distribution over 4 tokens
uniform = [0.25, 0.25, 0.25, 0.25]
confident = [0.9, 0.05, 0.03, 0.02]

print(f"Loss (uniform):    {cross_entropy_loss([uniform], [0]):.3f}")
print(f"Loss (confident):  {cross_entropy_loss([confident], [0]):.3f}")
# uniform loss is higher because the model is less sure
```

## Step 6: Text Generation

Generate text by repeatedly predicting the next token:

```python
def generate(model_fn, tokenizer, prompt, max_tokens=20):
    """Generate text autoregressively."""
    token_ids = tokenizer.encode(prompt)

    for _ in range(max_tokens):
        # Get probability distribution for next token
        probs = model_fn(token_ids)

        # Sample from distribution (or take argmax for greedy)
        next_token = probs.index(max(probs))
        token_ids.append(next_token)

    return tokenizer.decode(token_ids)

# With a random model, output will be gibberish -- that is expected!
# Training adjusts the weights to produce coherent text.
```

## Step 7: The Training Loop

The core training loop for a language model:

```python
def train_step(model_weights, inputs, targets, learning_rate):
    """
    Simplified training step (conceptual -- real training uses autograd).

    1. Forward pass: compute predictions
    2. Compute loss
    3. Backward pass: compute gradients (simplified)
    4. Update weights
    """
    # In practice, this uses PyTorch autograd:
    # optimizer.zero_grad()
    # logits = model(inputs)
    # loss = cross_entropy(logits, targets)
    # loss.backward()
    # optimizer.step()
    pass

# A full training loop:
# for epoch in range(num_epochs):
#     for batch_x, batch_y in data_loader:
#         loss = train_step(model, batch_x, batch_y, lr=3e-4)
#     print(f"Epoch {epoch}: loss={loss:.4f}")
```

## Putting It All Together

```python
# Conceptual GPT architecture:
# 1. Token embedding + positional encoding
# 2. N transformer blocks (each: causal attention + FFN + layer norm)
# 3. Final linear layer -> logits over vocabulary
# 4. Softmax -> probabilities
# 5. Sample next token

# The magic is that this simple recipe, scaled up with
# more data and parameters, produces ChatGPT.

text = "the cat sat on the mat"
tok = CharTokenizer(text)
print(f"Vocabulary: {tok.char_to_id}")
print(f"Vocab size: {tok.vocab_size}")

ids = tok.encode(text)
pairs = create_training_pairs(ids, block_size=4)
print(f"Training pairs: {len(pairs)}")
print(f"First pair: input={pairs[0][0]} target={pairs[0][1]}")
```

## Common Mistakes

- **Not using causal masking**: Without it, the model sees future tokens during training -- it will not learn to generate.
- **Learning rate too high**: Language model training is sensitive; start with 3e-4 or lower.
- **Skipping the scaling in attention**: Unscaled dot products lead to sharp softmax outputs and poor gradients.
- **Forgetting temperature in generation**: Temperature controls randomness -- 0.0 is greedy, 1.0 is standard sampling.

## Key Takeaways

- An LLM is a next-token predictor: input a sequence, output a probability distribution
- The architecture is: embeddings, stacked transformer blocks, linear output layer
- Cross-entropy loss measures prediction quality against the true next token
- Generation is autoregressive: predict one token, append it, predict the next
- The training loop is the same gradient descent you use for any neural network
- Scale (data + parameters + compute) is what turns this simple recipe into GPT

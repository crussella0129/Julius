---
id: "05-transformers"
title: "Transformers and Attention"
concepts:
  - self-attention
  - multi-head-attention
  - positional-encoding
  - transformer-architecture
why: "The transformer architecture powers GPT, BERT, and every modern language model -- understanding self-attention is the single most important concept in modern AI."
prerequisites:
  - 04-word-embeddings
sources:
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 3 - Attention Mechanisms"
    license: "MIT"
  - repo: "huggingface/transformers"
    section: "Model Documentation"
    license: "Apache-2.0"
---

# Transformers and Attention

The Transformer, introduced in the 2017 paper "Attention Is All You Need", replaced recurrent networks with a purely attention-based architecture. It processes all tokens in parallel and learns which tokens to focus on for each prediction.

## Why Attention?

Before transformers, RNNs processed text one token at a time, left to right. This had two problems:
1. **Long-range dependencies**: By the time the model reaches the end of a long sentence, it may have "forgotten" the beginning.
2. **No parallelism**: Sequential processing is slow on GPUs.

Attention solves both: every token can directly attend to every other token, regardless of distance, and all attention computations happen in parallel.

## The Intuition Behind Self-Attention

Imagine reading: "The cat sat on the mat because it was tired." What does "it" refer to? You look back and determine "it" refers to "cat". Self-attention does exactly this -- for each token, it computes how much to attend to every other token.

## Query, Key, Value

Self-attention uses three projections of each token's embedding:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What information do I provide?"

The attention score between two tokens is the dot product of the query of one and the key of the other.

```python
import math

def softmax(scores):
    """Compute softmax over a list of scores."""
    max_score = max(scores)
    exps = [math.exp(s - max_score) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

def self_attention(Q, K, V):
    """
    Simplified single-head self-attention.
    Q, K, V are lists of vectors (one per token).
    Returns the attended output for each token.
    """
    d_k = len(Q[0])  # dimension of key vectors
    n = len(Q)
    outputs = []

    for i in range(n):
        # Compute attention scores: Q[i] dot K[j] for all j
        scores = []
        for j in range(n):
            score = sum(Q[i][d] * K[j][d] for d in range(d_k))
            scores.append(score / math.sqrt(d_k))

        # Apply softmax to get attention weights
        weights = softmax(scores)

        # Weighted sum of value vectors
        d_v = len(V[0])
        output = [0.0] * d_v
        for j in range(n):
            for d in range(d_v):
                output[d] += weights[j] * V[j][d]
        outputs.append(output)

    return outputs

# Example: 3 tokens, embedding dim = 4
Q = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]]
K = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]]
V = [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]

result = self_attention(Q, K, V)
for i, vec in enumerate(result):
    print(f"Token {i}: [{', '.join(f'{v:.3f}' for v in vec)}]")
```

## Scaled Dot-Product Attention

The scaling factor `sqrt(d_k)` is critical. Without it, dot products grow large with dimension, pushing softmax into regions with tiny gradients:

```python
# Why scaling matters
d_k = 64
large_dot = 50.0  # typical dot product without scaling
scaled = large_dot / math.sqrt(d_k)  # = 6.25

print(f"Without scaling: softmax input = {large_dot}")
print(f"With scaling:    softmax input = {scaled:.2f}")
# Without scaling, softmax would produce nearly one-hot outputs
```

## Positional Encoding

Since attention has no notion of word order (it is a set operation), we inject position information using sinusoidal encodings:

```python
def positional_encoding(seq_len, d_model):
    """Generate sinusoidal positional encodings."""
    pe = []
    for pos in range(seq_len):
        row = []
        for i in range(d_model):
            if i % 2 == 0:
                row.append(math.sin(pos / (10000 ** (i / d_model))))
            else:
                row.append(math.cos(pos / (10000 ** ((i - 1) / d_model))))
        pe.append(row)
    return pe

pe = positional_encoding(4, 6)
for pos, enc in enumerate(pe):
    print(f"Position {pos}: [{', '.join(f'{v:+.3f}' for v in enc)}]")
```

Each position gets a unique pattern of sines and cosines. Nearby positions have similar encodings, allowing the model to learn relative distances.

## Multi-Head Attention

Instead of one attention function, the transformer uses multiple "heads" that each attend to different aspects of the input:

```python
def multi_head_attention(Q, K, V, num_heads):
    """
    Simplified multi-head attention.
    Splits embedding into num_heads chunks, applies attention to each.
    """
    d_model = len(Q[0])
    d_head = d_model // num_heads
    all_head_outputs = []

    for h in range(num_heads):
        # Extract this head's slice
        q_h = [[q[h*d_head + d] for d in range(d_head)] for q in Q]
        k_h = [[k[h*d_head + d] for d in range(d_head)] for k in K]
        v_h = [[v[h*d_head + d] for d in range(d_head)] for v in V]

        head_out = self_attention(q_h, k_h, v_h)
        all_head_outputs.append(head_out)

    # Concatenate heads
    n = len(Q)
    result = []
    for i in range(n):
        concat = []
        for h in range(num_heads):
            concat.extend(all_head_outputs[h][i])
        result.append(concat)

    return result
```

## The Full Transformer Block

A transformer block combines: multi-head attention, a feed-forward network, layer normalization, and residual connections.

```python
def layer_norm(x):
    """Simplified layer normalization."""
    mean = sum(x) / len(x)
    var = sum((xi - mean) ** 2 for xi in x) / len(x)
    std = math.sqrt(var + 1e-6)
    return [(xi - mean) / std for xi in x]

def feed_forward(x, w1, b1, w2, b2):
    """Simple two-layer feed-forward network with ReLU."""
    # Hidden layer
    hidden = [max(0, sum(x[j] * w1[j][i] for j in range(len(x))) + b1[i])
              for i in range(len(b1))]
    # Output layer
    out = [sum(hidden[j] * w2[j][i] for j in range(len(hidden))) + b2[i]
           for i in range(len(b2))]
    return out

# A transformer block: attention -> add & norm -> FFN -> add & norm
```

## Causal (Masked) Attention

In language generation, each token should only attend to previous tokens (not future ones). This is done with a causal mask:

```python
def causal_attention(Q, K, V):
    """Self-attention with causal mask (for autoregressive models)."""
    d_k = len(Q[0])
    n = len(Q)
    outputs = []

    for i in range(n):
        scores = []
        for j in range(n):
            if j > i:
                scores.append(float('-inf'))  # mask future tokens
            else:
                score = sum(Q[i][d] * K[j][d] for d in range(d_k))
                scores.append(score / math.sqrt(d_k))
        weights = softmax(scores)
        d_v = len(V[0])
        output = [sum(weights[j] * V[j][d] for j in range(n)) for d in range(d_v)]
        outputs.append(output)

    return outputs
```

## Common Mistakes

- **Forgetting to scale by sqrt(d_k)**: Leads to vanishing gradients in softmax.
- **Not masking future tokens in decoder**: The model would cheat by looking ahead.
- **Confusing encoder and decoder attention**: Encoders use bidirectional attention; decoders use causal (masked) attention.

## Key Takeaways

- Self-attention lets every token attend to every other token in parallel
- Query, Key, Value projections determine what each token "asks for" and "provides"
- Scaling by sqrt(d_k) prevents softmax saturation
- Positional encoding adds word order information
- Multi-head attention captures different types of relationships simultaneously
- Causal masking prevents looking at future tokens during generation

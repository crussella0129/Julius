---
id: "04-word-embeddings"
title: "Word Embeddings"
concepts:
  - word-embeddings
  - word2vec
  - cosine-similarity
  - vector-semantics
why: "Word embeddings represent words as dense vectors where similar words are close together -- this is the foundation that makes modern language models possible."
prerequisites:
  - 03-text-classification
sources:
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 2 - Word Embeddings"
    license: "MIT"
  - repo: "RaRe-Technologies/gensim"
    section: "Word2Vec Tutorial"
    license: "LGPL-2.1"
---

# Word Embeddings

In the previous lesson, we represented words as indices in a vocabulary (one-hot encoding). The problem: every word is equally distant from every other word. "cat" is no more similar to "dog" than to "airplane". Word embeddings fix this by mapping words to dense vectors where semantic similarity is captured by geometric proximity.

## From One-Hot to Dense Vectors

A one-hot vector for "cat" in a 5-word vocabulary might be `[0, 1, 0, 0, 0]` -- it tells you nothing about meaning. A word embedding might be `[0.2, -0.4, 0.7, 0.1]` -- a dense vector where each dimension captures some aspect of meaning.

```python
# One-hot: sparse, high-dimensional, no semantic information
vocab = ["king", "queen", "man", "woman", "apple"]
one_hot_king = [1, 0, 0, 0, 0]
one_hot_queen = [0, 1, 0, 0, 0]

# Embedding: dense, low-dimensional, encodes semantic relationships
embed_king  = [0.5, 0.3, -0.1, 0.8]
embed_queen = [0.5, 0.3, -0.1, -0.8]
```

## Cosine Similarity

To measure how similar two word vectors are, we use **cosine similarity** -- the cosine of the angle between them:

```python
import math

def dot_product(a, b):
    return sum(x * y for x, y in zip(a, b))

def magnitude(v):
    return math.sqrt(sum(x * x for x in v))

def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors."""
    dot = dot_product(a, b)
    mag_a = magnitude(a)
    mag_b = magnitude(b)
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)

# Similar words should have high cosine similarity
cat = [0.7, 0.2, -0.1, 0.3]
dog = [0.6, 0.3, -0.1, 0.2]
car = [-0.3, 0.1, 0.8, -0.2]

print(f"cat-dog similarity: {cosine_similarity(cat, dog):.3f}")  # ~0.98 (high)
print(f"cat-car similarity: {cosine_similarity(cat, car):.3f}")  # ~-0.12 (low)
```

## How Word2Vec Works

Word2Vec learns embeddings by training on a simple task: predict a word from its context (CBOW) or predict context from a word (Skip-gram).

The **Skip-gram** intuition: if "cat" often appears near "pet", "fur", "meow", then their vectors should be similar.

```python
def generate_skipgram_pairs(tokens, window_size=2):
    """Generate (target, context) pairs for Skip-gram training."""
    pairs = []
    for i, target in enumerate(tokens):
        start = max(0, i - window_size)
        end = min(len(tokens), i + window_size + 1)
        for j in range(start, end):
            if j != i:
                pairs.append((target, tokens[j]))
    return pairs

tokens = ["the", "cat", "sat", "on", "the", "mat"]
pairs = generate_skipgram_pairs(tokens, window_size=2)
for target, context in pairs[:6]:
    print(f"  target={target:5} context={context}")
```

## A Simple Embedding Layer

In neural networks, an embedding layer is just a lookup table -- a matrix where row i is the vector for word i:

```python
import random

class EmbeddingLayer:
    """A simple word embedding lookup table."""
    def __init__(self, vocab_size, embed_dim):
        # Initialize random embeddings
        random.seed(42)
        self.weights = [
            [random.gauss(0, 0.1) for _ in range(embed_dim)]
            for _ in range(vocab_size)
        ]

    def forward(self, word_index):
        """Look up the embedding for a word index."""
        return self.weights[word_index]

# Create embeddings for a 5-word vocabulary with 3 dimensions
embedding = EmbeddingLayer(vocab_size=5, embed_dim=3)
print(f"Word 0 embedding: {[f'{x:.3f}' for x in embedding.forward(0)]}")
print(f"Word 1 embedding: {[f'{x:.3f}' for x in embedding.forward(1)]}")
```

## Word Analogy: King - Man + Woman = Queen

The famous Word2Vec result: vector arithmetic captures semantic relationships:

```python
def analogy(embeddings, word_a, word_b, word_c):
    """Solve: a is to b as c is to ?"""
    # result_vector = b - a + c
    result = [
        embeddings[word_b][i] - embeddings[word_a][i] + embeddings[word_c][i]
        for i in range(len(embeddings[word_a]))
    ]
    return result

def find_closest(target, embeddings, exclude):
    """Find the word closest to the target vector."""
    best_word = None
    best_sim = -1
    for word, vec in embeddings.items():
        if word in exclude:
            continue
        sim = cosine_similarity(target, vec)
        if sim > best_sim:
            best_sim = sim
            best_word = word
    return best_word, best_sim

# Toy embeddings (in real Word2Vec, these are learned)
embeddings = {
    "king":  [0.5, 0.3, 0.1, 0.9],
    "queen": [0.5, 0.3, 0.1, -0.9],
    "man":   [0.1, 0.0, 0.0, 0.8],
    "woman": [0.1, 0.0, 0.0, -0.8],
}

result = analogy(embeddings, "man", "king", "woman")
word, sim = find_closest(result, embeddings, exclude={"man", "king", "woman"})
print(f"king - man + woman = {word} (similarity: {sim:.3f})")
# king - man + woman = queen
```

## GloVe: Global Vectors

GloVe (Global Vectors for Word Representation) takes a different approach: it builds a word co-occurrence matrix across the entire corpus and factorizes it to produce embeddings. The key insight is that the ratio of co-occurrence probabilities encodes meaning.

```python
def build_cooccurrence(tokens, window=2):
    """Build a word co-occurrence dictionary."""
    cooccurrence = {}
    for i, word in enumerate(tokens):
        start = max(0, i - window)
        end = min(len(tokens), i + window + 1)
        for j in range(start, end):
            if j != i:
                pair = (word, tokens[j])
                cooccurrence[pair] = cooccurrence.get(pair, 0) + 1
    return cooccurrence

tokens = ["the", "cat", "sat", "on", "the", "mat"]
cooc = build_cooccurrence(tokens)
for pair, count in sorted(cooc.items(), key=lambda x: -x[1])[:5]:
    print(f"  {pair}: {count}")
```

## Common Mistakes

- **Confusing embedding dimension with vocabulary size**: Vocabulary size is how many words you have; embedding dimension is the length of each vector (typically 50-300).
- **Not normalizing vectors before cosine similarity**: While cosine similarity handles magnitude, consistent normalization improves numerical stability.
- **Thinking embeddings are fixed**: In modern models, embeddings are fine-tuned during training for each task.

## Key Takeaways

- Word embeddings map words to dense vectors where similar words are nearby
- Cosine similarity measures how close two vectors are in direction
- Word2Vec learns embeddings by predicting context words (Skip-gram) or center words (CBOW)
- Vector arithmetic on embeddings captures semantic analogies
- GloVe learns from global co-occurrence statistics
- Embeddings are the input representation for all modern NLP models

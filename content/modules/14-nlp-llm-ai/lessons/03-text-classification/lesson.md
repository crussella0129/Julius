---
id: "03-text-classification"
title: "Text Classification"
concepts:
  - bag-of-words
  - tf-idf
  - naive-bayes
  - text-classification
why: "Text classification powers spam filters, sentiment analysis, and content moderation -- understanding bag-of-words and TF-IDF teaches you how machines represent documents as numbers."
prerequisites:
  - 02-spacy
sources:
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 2 - Text Representations"
    license: "MIT"
  - repo: "scikit-learn/scikit-learn"
    section: "Text Feature Extraction"
    license: "BSD-3-Clause"
---

# Text Classification

Text classification assigns a label to a piece of text -- is this email spam? Is this review positive or negative? The key challenge is converting text into numbers that a classifier can work with.

## Bag of Words (BoW)

The simplest text representation: count how many times each word appears, ignoring order entirely.

```python
from collections import Counter

def bag_of_words(text):
    """Convert text to a word frequency dictionary."""
    words = text.lower().split()
    return dict(Counter(words))

doc = "the cat sat on the mat the cat"
bow = bag_of_words(doc)
print(bow)
# {'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1}
```

## Building a Vocabulary

To compare documents, you need a shared vocabulary -- a fixed list of all words across your corpus:

```python
def build_vocab(documents):
    """Build a sorted vocabulary from a list of documents."""
    vocab = set()
    for doc in documents:
        vocab.update(doc.lower().split())
    return sorted(vocab)

docs = ["the cat sat", "the dog ran", "a cat ran"]
vocab = build_vocab(docs)
print(vocab)
# ['a', 'cat', 'dog', 'ran', 'sat', 'the']
```

## Document Vectors

Convert each document into a fixed-length vector using the vocabulary:

```python
def doc_to_vector(doc, vocab):
    """Convert a document to a count vector."""
    words = doc.lower().split()
    counts = Counter(words)
    return [counts.get(word, 0) for word in vocab]

docs = ["the cat sat", "the dog ran", "a cat ran"]
vocab = build_vocab(docs)

for doc in docs:
    vec = doc_to_vector(doc, vocab)
    print(f"{doc:15} -> {vec}")
# the cat sat     -> [0, 1, 0, 0, 1, 1]
# the dog ran     -> [0, 0, 1, 1, 0, 1]
# a cat ran       -> [1, 1, 0, 1, 0, 0]
```

## TF-IDF: Beyond Raw Counts

**Term Frequency - Inverse Document Frequency** downweights common words and upweights rare, informative words.

- **TF(t, d)** = count of term t in document d / total terms in d
- **IDF(t)** = log(total documents / documents containing t)
- **TF-IDF(t, d)** = TF(t, d) * IDF(t)

```python
import math

def compute_tf(doc):
    """Compute term frequency for each word in a document."""
    words = doc.lower().split()
    total = len(words)
    counts = Counter(words)
    return {word: count / total for word, count in counts.items()}

def compute_idf(documents):
    """Compute inverse document frequency across a corpus."""
    n_docs = len(documents)
    idf = {}
    all_words = set()
    for doc in documents:
        all_words.update(doc.lower().split())
    for word in all_words:
        doc_count = sum(1 for doc in documents if word in doc.lower().split())
        idf[word] = math.log(n_docs / doc_count)
    return idf

def compute_tfidf(doc, idf):
    """Compute TF-IDF scores for a document."""
    tf = compute_tf(doc)
    return {word: tf_val * idf.get(word, 0) for word, tf_val in tf.items()}

docs = ["the cat sat on the mat", "the dog sat on the log", "a cat chased a dog"]
idf = compute_idf(docs)
tfidf = compute_tfidf(docs[0], idf)
for word, score in sorted(tfidf.items(), key=lambda x: -x[1]):
    print(f"{word:8} {score:.3f}")
```

Words like "the" get low TF-IDF scores because they appear in every document. Words like "mat" get high scores because they are unique to one document.

## Naive Bayes Classifier

Naive Bayes uses Bayes' theorem with the "naive" assumption that words are independent:

```python
def train_naive_bayes(documents, labels):
    """Train a simple Naive Bayes text classifier."""
    class_counts = Counter(labels)
    word_counts = {}
    vocab = set()

    for doc, label in zip(documents, labels):
        if label not in word_counts:
            word_counts[label] = Counter()
        words = doc.lower().split()
        word_counts[label].update(words)
        vocab.update(words)

    return class_counts, word_counts, vocab

def predict(text, class_counts, word_counts, vocab):
    """Predict the class of a text using Naive Bayes."""
    words = text.lower().split()
    total_docs = sum(class_counts.values())
    scores = {}

    for label in class_counts:
        # Prior probability
        score = math.log(class_counts[label] / total_docs)
        total_words = sum(word_counts[label].values())
        for word in words:
            # Laplace smoothing
            count = word_counts[label].get(word, 0) + 1
            score += math.log(count / (total_words + len(vocab)))
        scores[label] = score

    return max(scores, key=scores.get)

# Training data
docs = ["great movie loved it", "terrible film awful waste",
        "amazing performance brilliant", "horrible boring bad"]
labels = ["positive", "negative", "positive", "negative"]

class_counts, word_counts, vocab = train_naive_bayes(docs, labels)
print(predict("great brilliant film", class_counts, word_counts, vocab))
# positive
```

## Evaluating a Classifier

```python
def accuracy(predictions, actual):
    correct = sum(p == a for p, a in zip(predictions, actual))
    return correct / len(actual)

preds = ["positive", "negative", "positive", "negative", "positive"]
actual = ["positive", "negative", "negative", "negative", "positive"]
print(f"Accuracy: {accuracy(preds, actual):.0%}")
# Accuracy: 80%
```

## Common Mistakes

- **Not lowercasing before counting**: "The" and "the" would be different features.
- **Forgetting Laplace smoothing**: Without it, a single unseen word makes the probability zero.
- **Using BoW for long documents without TF-IDF**: Common words dominate and drown out meaning.

## Key Takeaways

- Bag of words converts text to word counts, ignoring order
- TF-IDF improves on raw counts by downweighting common words
- Naive Bayes is simple, fast, and surprisingly effective for text classification
- Laplace smoothing prevents zero probabilities for unseen words
- These classical methods remain useful baselines even in the age of deep learning

---
id: "01-nlp-fundamentals"
title: "NLP Fundamentals"
concepts:
  - tokenization
  - stemming
  - lemmatization
  - text-preprocessing
why: "Before any AI model can understand text, raw sentences must be broken into tokens and normalized — tokenization and stemming are the foundation of every NLP pipeline."
prerequisites:
  - 07-cuda-python
sources:
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 2 - Text Tokenization"
    license: "MIT"
  - repo: "nltk/nltk"
    section: "Tokenization and Stemming"
    license: "Apache-2.0"
---

# NLP Fundamentals

Natural Language Processing (NLP) is the field of AI that gives computers the ability to read, understand, and generate human language. Before feeding text to any model, you need to preprocess it into a structured form machines can work with.

## Why Text Preprocessing Matters

Raw text is messy. Consider the sentence: "The cats were running quickly!" A computer sees this as a single string of characters. NLP preprocessing transforms it into structured, normalized tokens a model can learn from.

## Tokenization

**Tokenization** splits text into individual units called tokens. The simplest approach splits on whitespace, but real tokenizers handle punctuation, contractions, and special cases.

```python
# Simple whitespace tokenization
text = "The cats were running quickly!"
tokens = text.split()
print(tokens)
# ['The', 'cats', 'were', 'running', 'quickly!']
```

Notice the exclamation mark is stuck to "quickly!". A proper tokenizer separates punctuation:

```python
import re

def tokenize(text):
    """Split text into tokens, separating punctuation."""
    return re.findall(r"\w+|[^\w\s]", text)

tokens = tokenize("The cats were running quickly!")
print(tokens)
# ['The', 'cats', 'were', 'running', 'quickly', '!']
```

## Lowercasing and Normalization

Converting to lowercase ensures "The" and "the" are treated as the same word:

```python
tokens = [t.lower() for t in tokenize("The Cat sat on THE mat.")]
print(tokens)
# ['the', 'cat', 'sat', 'on', 'the', 'mat', '.']
```

## Stop Word Removal

Stop words are common words like "the", "is", "at" that carry little meaning on their own:

```python
stop_words = {"the", "a", "an", "is", "was", "were", "on", "in", "at", "to"}

def remove_stop_words(tokens):
    return [t for t in tokens if t.lower() not in stop_words]

filtered = remove_stop_words(["the", "cat", "sat", "on", "the", "mat"])
print(filtered)
# ['cat', 'sat', 'mat']
```

## Stemming

**Stemming** chops words down to their root form using simple rules. It is fast but sometimes produces non-words:

```python
def simple_stem(word):
    """A basic suffix-stripping stemmer."""
    suffixes = ["ing", "ly", "ed", "es", "s", "er", "est"]
    for suffix in suffixes:
        if word.endswith(suffix) and len(word) - len(suffix) > 2:
            return word[:-len(suffix)]
    return word

words = ["running", "quickly", "cats", "played", "bigger"]
stems = [simple_stem(w) for w in words]
print(stems)
# ['runn', 'quick', 'cat', 'play', 'bigg']
```

Notice "running" becomes "runn" and "bigger" becomes "bigg" -- not real words, but they group related words together.

## Lemmatization

**Lemmatization** reduces words to their dictionary form (lemma) using vocabulary and grammar rules. It is slower but produces real words:

```python
# Simple lemmatization lookup (real systems use dictionaries)
lemma_map = {
    "running": "run", "ran": "run", "runs": "run",
    "cats": "cat", "better": "good", "were": "be",
    "quickly": "quickly", "played": "play",
}

def lemmatize(word):
    return lemma_map.get(word, word)

words = ["running", "cats", "were", "better"]
lemmas = [lemmatize(w) for w in words]
print(lemmas)
# ['run', 'cat', 'be', 'good']
```

## N-grams

An **n-gram** is a contiguous sequence of n tokens. Bigrams (n=2) and trigrams (n=3) capture word context:

```python
def ngrams(tokens, n):
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

words = ["the", "cat", "sat", "on", "the", "mat"]
print(ngrams(words, 2))
# [('the', 'cat'), ('cat', 'sat'), ('sat', 'on'), ('on', 'the'), ('the', 'mat')]
print(ngrams(words, 3))
# [('the', 'cat', 'sat'), ('cat', 'sat', 'on'), ('sat', 'on', 'the'), ('on', 'the', 'mat')]
```

## Building a Preprocessing Pipeline

In practice, you chain these steps together:

```python
def preprocess(text):
    tokens = tokenize(text)
    tokens = [t.lower() for t in tokens]
    tokens = [t for t in tokens if t.isalpha()]  # remove punctuation tokens
    tokens = remove_stop_words(tokens)
    tokens = [simple_stem(t) for t in tokens]
    return tokens

result = preprocess("The cats were running quickly on the mat!")
print(result)
# ['cat', 'runn', 'quick', 'mat']
```

## Common Mistakes

- **Stemming before lowercasing**: "Running" might not match the suffix rules. Always lowercase first.
- **Over-removing stop words**: In sentiment analysis, "not" is critical but often in stop word lists.
- **Ignoring punctuation tokens**: Leftover punctuation can pollute your vocabulary.

## Key Takeaways

- Tokenization splits text into processable units
- Stemming is fast but approximate; lemmatization is accurate but slower
- Stop word removal reduces noise but must be done carefully for your task
- Preprocessing pipelines chain these steps in a consistent order
- Every NLP system starts with these fundamentals, from simple classifiers to large language models

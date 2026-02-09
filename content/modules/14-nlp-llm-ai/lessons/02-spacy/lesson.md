---
id: "02-spacy"
title: "Text Processing with spaCy"
concepts:
  - spacy
  - named-entity-recognition
  - pos-tagging
  - dependency-parsing
why: "spaCy is the industry-standard library for production NLP -- it provides fast, accurate tokenization, POS tagging, and entity recognition in a clean Pythonic API."
prerequisites:
  - 01-nlp-fundamentals
sources:
  - repo: "explosion/spaCy"
    section: "Usage Guide"
    license: "MIT"
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 2 - Text Processing"
    license: "MIT"
---

# Text Processing with spaCy

spaCy is a production-grade NLP library that handles tokenization, part-of-speech tagging, named entity recognition, and dependency parsing out of the box. Unlike our manual preprocessing from the previous lesson, spaCy uses trained statistical models for accuracy.

## Installing and Loading a Model

```python
# Install: pip install spacy
# Download model: python -m spacy download en_core_web_sm
import spacy

nlp = spacy.load("en_core_web_sm")
```

The `nlp` object is a pipeline. When you call it on text, it runs every component (tokenizer, tagger, parser, NER) and returns a `Doc` object.

## The Doc, Token, and Span Objects

```python
doc = nlp("Apple is looking at buying U.K. startup for $1 billion")

# Iterate over tokens
for token in doc:
    print(f"{token.text:12} {token.pos_:6} {token.dep_:10} {token.head.text}")
```

Each `Token` has attributes:
- `token.text` -- the original text
- `token.pos_` -- part-of-speech tag (NOUN, VERB, ADJ, etc.)
- `token.dep_` -- syntactic dependency (nsubj, dobj, prep, etc.)
- `token.lemma_` -- the lemmatized form
- `token.is_stop` -- whether it is a stop word

## Tokenization Done Right

spaCy's tokenizer handles edge cases that simple `split()` cannot:

```python
doc = nlp("I can't believe it's $9.99! Visit https://spacy.io.")

for token in doc:
    print(token.text)
# I, ca, n't, believe, it, 's, $, 9.99, !, Visit, https://spacy.io, .
```

Notice how contractions are split ("can't" becomes "ca" and "n't") and URLs are kept intact.

## Lemmatization with spaCy

```python
doc = nlp("The striped bats were hanging on their feet")

for token in doc:
    print(f"{token.text:10} -> {token.lemma_}")
# The        -> the
# striped    -> stripe
# bats       -> bat
# were       -> be
# hanging    -> hang
# on         -> on
# their      -> their
# feet       -> foot
```

## Part-of-Speech Tagging

POS tags classify words by their grammatical role:

```python
doc = nlp("She sells seashells by the seashore")

pos_counts = {}
for token in doc:
    pos = token.pos_
    pos_counts[pos] = pos_counts.get(pos, 0) + 1
    print(f"{token.text:12} {token.pos_}")

print(f"\nPOS distribution: {pos_counts}")
```

## Named Entity Recognition (NER)

NER identifies real-world objects in text -- people, companies, locations, dates, money:

```python
doc = nlp("Apple was founded by Steve Jobs in Cupertino in 1976")

for ent in doc.ents:
    print(f"{ent.text:20} {ent.label_:10} {spacy.explain(ent.label_)}")
# Apple                ORG        Companies, agencies, institutions
# Steve Jobs           PERSON     People, including fictional
# Cupertino            GPE        Countries, cities, states
# 1976                 DATE       Absolute or relative dates
```

## Sentence Segmentation

```python
doc = nlp("NLP is fascinating. spaCy makes it easy. Let's build something!")

for sent in doc.sents:
    print(sent.text)
# NLP is fascinating.
# spaCy makes it easy.
# Let's build something!
```

## Processing Text Efficiently

For large datasets, use `nlp.pipe()` to process texts in batches:

```python
texts = ["First document.", "Second document.", "Third document."]

# Efficient batch processing
docs = list(nlp.pipe(texts))
for doc in docs:
    print([(token.text, token.pos_) for token in doc])
```

## Simulating spaCy Concepts in Pure Python

Since spaCy requires installation, here is how the core ideas work under the hood:

```python
# A simplified token representation
class SimpleToken:
    def __init__(self, text, pos, lemma):
        self.text = text
        self.pos_ = pos
        self.lemma_ = lemma
        self.is_stop = text.lower() in {"the", "is", "a", "an", "in", "on"}

tokens = [
    SimpleToken("The", "DET", "the"),
    SimpleToken("cats", "NOUN", "cat"),
    SimpleToken("are", "AUX", "be"),
    SimpleToken("running", "VERB", "run"),
]

for t in tokens:
    print(f"{t.text:10} {t.pos_:5} {t.lemma_:5} stop={t.is_stop}")
```

## Common Mistakes

- **Loading the model every time**: Call `spacy.load()` once and reuse the `nlp` object.
- **Processing one text at a time in a loop**: Use `nlp.pipe()` for batches.
- **Confusing `pos_` and `tag_`**: `pos_` is the coarse tag (NOUN), `tag_` is fine-grained (NN, NNS).

## Key Takeaways

- spaCy provides a complete NLP pipeline: tokenization, POS tagging, NER, and parsing
- The Doc/Token/Span object model gives you structured access to linguistic annotations
- Lemmatization in spaCy uses rules and lookup tables for accurate results
- NER extracts real-world entities with pre-trained models
- Use `nlp.pipe()` for efficient batch processing

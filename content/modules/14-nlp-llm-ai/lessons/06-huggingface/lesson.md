---
id: "06-huggingface"
title: "Hugging Face Transformers"
concepts:
  - huggingface-pipeline
  - tokenizers
  - pretrained-models
  - inference
why: "Hugging Face provides instant access to thousands of pre-trained models -- knowing how to use their pipeline and tokenizer APIs lets you build AI features in minutes instead of months."
prerequisites:
  - 05-transformers
sources:
  - repo: "huggingface/transformers"
    section: "Quick Tour"
    license: "Apache-2.0"
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 6 - Using Pre-trained Models"
    license: "MIT"
---

# Hugging Face Transformers

Hugging Face's `transformers` library gives you access to thousands of pre-trained models for text classification, generation, translation, summarization, and more. Instead of training from scratch, you can download a model and start making predictions immediately.

## The Pipeline API

The simplest way to use a pre-trained model is through `pipeline()`:

```python
from transformers import pipeline

# Sentiment analysis
classifier = pipeline("sentiment-analysis")
result = classifier("I love this product! It works perfectly.")
print(result)
# [{'label': 'POSITIVE', 'score': 0.9998}]

# Text generation
generator = pipeline("text-generation", model="gpt2")
output = generator("The future of AI is", max_length=30)
print(output[0]["generated_text"])
```

Pipeline handles tokenization, model inference, and post-processing automatically.

## Understanding Tokenizers

Before a model can process text, it must be converted to token IDs. Hugging Face tokenizers handle this:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
text = "Hugging Face is creating amazing NLP tools."

# Tokenize
tokens = tokenizer.tokenize(text)
print(f"Tokens: {tokens}")
# ['hugging', 'face', 'is', 'creating', 'amazing', 'nl', '##p', 'tools', '.']

# Convert to IDs
ids = tokenizer.encode(text)
print(f"IDs: {ids}")

# Full encoding with attention mask
encoded = tokenizer(text, return_tensors="pt")
print(f"Keys: {list(encoded.keys())}")
# ['input_ids', 'token_type_ids', 'attention_mask']
```

## Subword Tokenization: BPE

Modern models use **Byte Pair Encoding (BPE)** -- a subword tokenizer that handles unknown words by breaking them into known pieces:

```python
# Simulating BPE concepts
def simple_bpe_tokenize(word, vocab):
    """Split a word into known subword pieces."""
    tokens = []
    i = 0
    while i < len(word):
        # Find longest matching prefix in vocab
        match = None
        for end in range(len(word), i, -1):
            piece = word[i:end]
            if i > 0:
                piece = "##" + piece
            if piece in vocab:
                match = piece
                break
        if match:
            tokens.append(match)
            i += len(match.replace("##", ""))
        else:
            tokens.append(f"[UNK]")
            i += 1
    return tokens

vocab = {"un", "##believ", "##able", "##ly", "help", "##ful", "##ing"}
print(simple_bpe_tokenize("unbelievably", vocab))
# ['un', '##believ', '##ably'] -- conceptual demo
```

The `##` prefix indicates a continuation token -- it is not the start of a word.

## Loading Models for Specific Tasks

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Load a pre-trained model and tokenizer
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Tokenize input
text = "This movie was absolutely fantastic!"
inputs = tokenizer(text, return_tensors="pt")

# Run inference
outputs = model(**inputs)
logits = outputs.logits
predicted_class = logits.argmax().item()
print(f"Predicted class: {predicted_class}")
print(f"Label: {model.config.id2label[predicted_class]}")
```

## Available Pipeline Tasks

```python
# Common pipeline tasks:
tasks = {
    "sentiment-analysis":    "Classify text sentiment",
    "text-generation":       "Generate text continuations",
    "summarization":         "Summarize long documents",
    "translation_en_to_fr":  "Translate between languages",
    "question-answering":    "Answer questions from context",
    "fill-mask":             "Predict masked words",
    "ner":                   "Named entity recognition",
    "zero-shot-classification": "Classify without training examples",
}

for task, desc in tasks.items():
    print(f"  {task:30} {desc}")
```

## Working With Tokenizer Outputs in Pure Python

Since the transformers library requires installation, here is how the token encoding pattern works:

```python
class SimpleTokenizer:
    """Demonstrates the tokenizer encode/decode pattern."""
    def __init__(self, vocab):
        self.token_to_id = {token: i for i, token in enumerate(vocab)}
        self.id_to_token = {i: token for i, token in enumerate(vocab)}

    def encode(self, text):
        tokens = text.lower().split()
        return [self.token_to_id.get(t, self.token_to_id.get("[UNK]", 0))
                for t in tokens]

    def decode(self, ids):
        return " ".join(self.id_to_token.get(i, "[UNK]") for i in ids)

vocab = ["[PAD]", "[UNK]", "[CLS]", "[SEP]", "the", "cat", "sat", "on", "mat"]
tok = SimpleTokenizer(vocab)

ids = tok.encode("the cat sat on the mat")
print(f"Encoded: {ids}")
print(f"Decoded: {tok.decode(ids)}")
```

## Batch Processing

```python
# Process multiple texts efficiently
texts = [
    "I love this movie!",
    "This was terrible.",
    "Pretty good overall.",
]

# Pipeline handles batching
# results = classifier(texts)
# for text, result in zip(texts, results):
#     print(f"{text:25} -> {result['label']} ({result['score']:.3f})")

# Manual tokenization with padding
encoded = {
    "texts": texts,
    "note": "tokenizer(texts, padding=True, truncation=True, return_tensors='pt')"
}
```

## Common Mistakes

- **Not matching the tokenizer to the model**: Always load both from the same model name.
- **Forgetting padding and truncation**: Batch inputs must be the same length.
- **Running large models without a GPU**: Models like GPT-2 are slow on CPU; use `device=0` for GPU.
- **Not using `return_tensors`**: Without it, you get plain Python lists instead of tensors.

## Key Takeaways

- `pipeline()` is the fastest way to use pre-trained models
- Tokenizers convert text to token IDs that models can process
- BPE handles unknown words by splitting them into known subwords
- Always use the tokenizer that matches your model
- Hugging Face Hub hosts thousands of models for every NLP task
- Batch processing with padding and truncation is essential for efficiency

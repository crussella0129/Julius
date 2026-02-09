---
id: "08-langchain"
title: "LangChain for AI Applications"
concepts:
  - langchain
  - prompt-templates
  - chains
  - retrieval-augmented-generation
why: "LangChain provides the building blocks for connecting LLMs to real-world data and tools -- it is the standard framework for building production AI applications."
prerequisites:
  - 07-llm-from-scratch
sources:
  - repo: "langchain-ai/langchain"
    section: "Getting Started"
    license: "MIT"
  - repo: "rasbt/LLMs-from-scratch"
    section: "Chapter 7 - Applications"
    license: "MIT"
---

# LangChain for AI Applications

LangChain is a framework for building applications powered by language models. It provides abstractions for prompt management, chaining operations, connecting to external data, and building agents that can use tools. Instead of raw API calls, LangChain gives you composable building blocks.

## Core Concepts

LangChain is built around five key ideas:
1. **Prompt Templates**: Reusable prompts with variables
2. **Chains**: Sequential operations piped together
3. **Retrievers**: Fetch relevant documents from a knowledge base
4. **Agents**: LLMs that decide which tools to use
5. **Memory**: Conversation history for multi-turn chat

## Prompt Templates

Instead of string formatting, LangChain uses structured prompt templates:

```python
# LangChain style:
# from langchain.prompts import PromptTemplate
# template = PromptTemplate.from_template("Translate {text} to {language}")
# prompt = template.format(text="Hello", language="French")

# Pure Python equivalent:
class PromptTemplate:
    """Simplified prompt template with variable substitution."""
    def __init__(self, template, input_variables):
        self.template = template
        self.input_variables = input_variables

    def format(self, **kwargs):
        missing = set(self.input_variables) - set(kwargs.keys())
        if missing:
            raise ValueError(f"Missing variables: {missing}")
        result = self.template
        for key, value in kwargs.items():
            result = result.replace(f"{{{key}}}", str(value))
        return result

template = PromptTemplate(
    template="Translate '{text}' from {source} to {target}.",
    input_variables=["text", "source", "target"]
)

prompt = template.format(text="Hello world", source="English", target="French")
print(prompt)
# Translate 'Hello world' from English to French.
```

## Chains: Composing Operations

A chain pipes the output of one step into the input of the next:

```python
class Chain:
    """A sequential chain of functions."""
    def __init__(self, steps):
        self.steps = steps

    def run(self, input_data):
        result = input_data
        for step in self.steps:
            result = step(result)
        return result

# Example: preprocess -> classify -> format
def preprocess(text):
    return text.lower().strip()

def classify(text):
    positive_words = {"good", "great", "love", "amazing", "excellent"}
    negative_words = {"bad", "terrible", "hate", "awful", "horrible"}
    words = set(text.split())
    pos = len(words & positive_words)
    neg = len(words & negative_words)
    if pos > neg:
        return {"text": text, "sentiment": "positive", "confidence": pos / (pos + neg)}
    elif neg > pos:
        return {"text": text, "sentiment": "negative", "confidence": neg / (pos + neg)}
    return {"text": text, "sentiment": "neutral", "confidence": 0.5}

def format_result(result):
    return f"Text: {result['text']}\nSentiment: {result['sentiment']} ({result['confidence']:.0%})"

chain = Chain([preprocess, classify, format_result])
print(chain.run("  This movie was GREAT and AMAZING  "))
```

## Retrieval-Augmented Generation (RAG)

RAG combines an LLM with a knowledge base. Instead of relying on the model's training data alone, you retrieve relevant documents and include them in the prompt:

```python
import math

def cosine_sim(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)

class SimpleVectorStore:
    """A minimal vector store for document retrieval."""
    def __init__(self):
        self.documents = []
        self.vectors = []

    def add(self, text, vector):
        self.documents.append(text)
        self.vectors.append(vector)

    def search(self, query_vector, top_k=2):
        """Find the top_k most similar documents."""
        scores = [(i, cosine_sim(query_vector, v))
                  for i, v in enumerate(self.vectors)]
        scores.sort(key=lambda x: -x[1])
        return [(self.documents[i], score) for i, score in scores[:top_k]]

# Build a knowledge base
store = SimpleVectorStore()
store.add("Python was created by Guido van Rossum in 1991.", [0.8, 0.1, 0.2])
store.add("JavaScript was created by Brendan Eich in 1995.", [0.7, 0.3, 0.1])
store.add("The Eiffel Tower is 330 meters tall.", [0.1, 0.8, 0.5])

# Query: "Who created Python?"
query_vector = [0.9, 0.1, 0.1]
results = store.search(query_vector, top_k=2)
for doc, score in results:
    print(f"  [{score:.3f}] {doc}")
```

## Building a RAG Pipeline

```python
def rag_pipeline(question, store, query_vector):
    """Simplified RAG: retrieve context, build prompt, return augmented prompt."""
    # Step 1: Retrieve relevant documents
    results = store.search(query_vector, top_k=2)
    context = "\n".join(doc for doc, _ in results)

    # Step 2: Build the augmented prompt
    prompt_template = PromptTemplate(
        template="Context:\n{context}\n\nQuestion: {question}\n\nAnswer based on the context above:",
        input_variables=["context", "question"]
    )
    prompt = prompt_template.format(context=context, question=question)

    # Step 3: In production, send this to an LLM
    # response = llm(prompt)
    return prompt

prompt = rag_pipeline("Who created Python?", store, [0.9, 0.1, 0.1])
print(prompt)
```

## Agents and Tools

An agent uses an LLM to decide which tool to call based on the user's question:

```python
class Tool:
    """A tool that an agent can use."""
    def __init__(self, name, description, func):
        self.name = name
        self.description = description
        self.func = func

def calculator(expression):
    """Safely evaluate a math expression."""
    allowed = set("0123456789+-*/.(). ")
    if all(c in allowed for c in expression):
        return str(eval(expression))
    return "Error: invalid expression"

def word_count(text):
    return str(len(text.split()))

tools = [
    Tool("calculator", "Evaluate math expressions", calculator),
    Tool("word_counter", "Count words in text", word_count),
]

class SimpleAgent:
    """A rule-based agent that selects tools based on keywords."""
    def __init__(self, tools):
        self.tools = {t.name: t for t in tools}

    def run(self, query):
        # Simple keyword-based tool selection
        if any(op in query for op in ["+", "-", "*", "/", "calculate"]):
            return self.tools["calculator"].func(query.split(":")[-1].strip())
        elif "count" in query.lower() and "word" in query.lower():
            text = query.split(":")[-1].strip()
            return self.tools["word_counter"].func(text)
        return "I don't know which tool to use."

agent = SimpleAgent(tools)
print(agent.run("calculate: 42 * 7"))
print(agent.run("word count: the quick brown fox jumps"))
```

## Conversation Memory

For multi-turn chat, you need to maintain conversation history:

```python
class ConversationMemory:
    """Stores conversation history."""
    def __init__(self, max_turns=10):
        self.history = []
        self.max_turns = max_turns

    def add(self, role, content):
        self.history.append({"role": role, "content": content})
        if len(self.history) > self.max_turns * 2:
            self.history = self.history[-self.max_turns * 2:]

    def get_context(self):
        return "\n".join(f"{m['role']}: {m['content']}" for m in self.history)

memory = ConversationMemory()
memory.add("user", "What is Python?")
memory.add("assistant", "Python is a programming language created by Guido van Rossum.")
memory.add("user", "When was it created?")

print(memory.get_context())
# The LLM can use this context to know "it" refers to Python
```

## Common Mistakes

- **Not managing prompt length**: LLMs have token limits. Always truncate or summarize long contexts.
- **Ignoring retrieval quality**: RAG is only as good as the documents you retrieve.
- **Building complex agents before simple chains**: Start with a chain, add agency only when needed.
- **Hardcoding prompts**: Use templates so you can iterate on prompt engineering without changing code.

## Key Takeaways

- LangChain provides composable abstractions: templates, chains, retrievers, agents, memory
- Prompt templates make prompts reusable and testable
- Chains compose operations sequentially, piping outputs to inputs
- RAG augments LLM knowledge with retrieved documents
- Agents use LLMs to decide which tools to call
- Conversation memory enables multi-turn interactions

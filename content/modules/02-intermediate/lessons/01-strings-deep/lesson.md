---
id: "01-strings-deep"
title: "String Methods and Slicing"
concepts:
  - string-slicing
  - string-methods
  - string-immutability
  - negative-indexing
why: "Strings are one of the most common data types you'll work with. Knowing how to slice, search, and transform them lets you process text, clean data, and build user-facing output with confidence."
prerequisites:
  - 08-functions
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 4 - Strings"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Strings"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Strings"
    license: "MIT"
---

# String Methods and Slicing

You've already used strings with `print()` and f-strings. Now it's time to go deeper. Strings in Python are **sequences** of characters, and they come with dozens of built-in methods for searching, transforming, and splitting text.

## Indexing

Every character in a string has a position, starting at 0:

```python
word = "Python"
print(word[0])   # P
print(word[1])   # y
print(word[5])   # n
```

## Negative Indexing

Negative indices count from the end:

```python
word = "Python"
print(word[-1])   # n (last character)
print(word[-2])   # o (second to last)
print(word[-6])   # P (same as word[0])
```

This is extremely handy when you want the last character without knowing the string's length.

## Slicing

A **slice** extracts a substring using `[start:stop:step]`:

```python
text = "Hello, World!"
print(text[0:5])    # Hello
print(text[7:12])   # World
print(text[:5])     # Hello (start defaults to 0)
print(text[7:])     # World! (stop defaults to end)
print(text[::2])    # Hlo ol! (every 2nd character)
print(text[::-1])   # !dlroW ,olleH (reversed)
```

The `stop` index is **exclusive** -- `text[0:5]` gives characters at positions 0, 1, 2, 3, 4.

## String Immutability

Strings **cannot be changed** after creation:

```python
name = "Python"
# name[0] = "J"   # TypeError: 'str' does not support item assignment
```

To "change" a string, you create a new one:

```python
name = "Python"
new_name = "J" + name[1:]
print(new_name)   # Jython
```

## Essential String Methods

### Case Methods

```python
text = "Hello, World!"
print(text.upper())     # HELLO, WORLD!
print(text.lower())     # hello, world!
print(text.title())     # Hello, World!
print(text.swapcase())  # hELLO, wORLD!
```

### Searching

```python
text = "Hello, World!"
print(text.find("World"))     # 7 (index where "World" starts)
print(text.find("Python"))    # -1 (not found)
print(text.count("l"))        # 3
print("World" in text)        # True
```

### Stripping Whitespace

```python
messy = "   Hello   "
print(messy.strip())    # "Hello"
print(messy.lstrip())   # "Hello   "
print(messy.rstrip())   # "   Hello"
```

### Replacing

```python
text = "Hello, World!"
print(text.replace("World", "Python"))   # Hello, Python!
print(text.replace("l", "L"))            # HeLLo, WorLd!
```

### Splitting and Joining

`split()` breaks a string into a list; `join()` combines a list into a string:

```python
sentence = "one two three"
words = sentence.split()
print(words)            # ['one', 'two', 'three']

csv_line = "a,b,c,d"
parts = csv_line.split(",")
print(parts)            # ['a', 'b', 'c', 'd']

joined = "-".join(parts)
print(joined)           # a-b-c-d
```

### Checking Content

```python
print("hello".isalpha())    # True (only letters)
print("123".isdigit())      # True (only digits)
print("hello123".isalnum()) # True (letters or digits)
print("  ".isspace())       # True (only whitespace)
print("Hello".startswith("He"))  # True
print("Hello".endswith("lo"))    # True
```

## Common Mistakes

**Forgetting immutability:**
```python
name = "alice"
name.upper()       # Returns "ALICE" but doesn't change name!
print(name)        # alice — still lowercase
name = name.upper() # You must reassign
```

**Off-by-one with slicing:**
```python
text = "Hello"
print(text[0:4])   # "Hell" — not "Hello"! Stop is exclusive.
print(text[0:5])   # "Hello" — this gets all 5 characters.
```

## Key Takeaways

- Strings are indexed starting at 0; negative indices count from the end
- Slicing uses `[start:stop:step]` where stop is exclusive
- Strings are immutable -- methods return new strings, they don't modify the original
- `split()` and `join()` convert between strings and lists
- `find()` returns -1 when not found; `in` returns True/False
- Always reassign when using methods like `.upper()` or `.replace()`

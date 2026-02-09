---
id: "02-regex"
title: "Regular Expressions"
concepts:
  - re-module
  - regex-patterns
  - search-match
  - substitution
why: "Regular expressions let you find, extract, and replace text patterns in strings. They are essential for parsing logs, validating input, and transforming data in automation scripts."
prerequisites:
  - 01-os-filesystem
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 18 - Regular Expressions"
    license: "MIT"
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 7 - Pattern Matching"
    license: "CC BY-NC-SA 3.0"
---

# Regular Expressions

Regular expressions (regex) are patterns that describe text. Python's `re` module lets you search for patterns, extract matches, and replace text with a concise mini-language.

## Basic Pattern Matching

```python
import re

text = "My phone number is 555-1234"
match = re.search(r"\d{3}-\d{4}", text)
if match:
    print(match.group())  # 555-1234
```

The `r` prefix creates a raw string, which prevents Python from interpreting backslashes before `re` sees them.

## Common Pattern Characters

| Pattern | Matches |
|---------|---------|
| `\d` | Any digit (0-9) |
| `\w` | Any word character (letter, digit, underscore) |
| `\s` | Any whitespace (space, tab, newline) |
| `.` | Any character except newline |
| `\D` | Any non-digit |
| `\W` | Any non-word character |
| `\S` | Any non-whitespace |

## Quantifiers

```python
import re

# * means 0 or more
print(re.findall(r"\d*", "abc123"))    # ['', '', '', '123', '']

# + means 1 or more
print(re.findall(r"\d+", "abc123"))    # ['123']

# ? means 0 or 1
print(re.findall(r"colou?r", "color and colour"))  # ['color', 'colour']

# {n} means exactly n
print(re.findall(r"\d{3}", "12 345 6789"))  # ['345', '678']

# {n,m} means between n and m
print(re.findall(r"\d{2,4}", "1 23 456 78901"))  # ['23', '456', '7890']
```

## `re.search()` vs `re.match()` vs `re.findall()`

```python
import re

text = "Order 42: 3 widgets at $5.99 each"

# search() finds first match anywhere in string
m = re.search(r"\d+", text)
print(m.group())  # 42

# match() only matches at the start of the string
m = re.match(r"\d+", text)
print(m)  # None (string starts with 'Order')

# findall() returns all matches as a list
all_nums = re.findall(r"\d+", text)
print(all_nums)  # ['42', '3', '5', '99']
```

## Groups for Extracting Parts

Parentheses create capture groups:

```python
import re

text = "Name: Alice, Age: 30"
match = re.search(r"Name: (\w+), Age: (\d+)", text)
if match:
    print(match.group(0))  # Name: Alice, Age: 30  (full match)
    print(match.group(1))  # Alice
    print(match.group(2))  # 30
```

## Substitution with `re.sub()`

```python
import re

text = "Call 555-1234 or 555-5678"
cleaned = re.sub(r"\d{3}-\d{4}", "XXX-XXXX", text)
print(cleaned)  # Call XXX-XXXX or XXX-XXXX

# Use groups in replacement
reformatted = re.sub(r"(\d{3})-(\d{4})", r"(\1) \2", text)
print(reformatted)  # Call (555) 1234 or (555) 5678
```

## Character Classes

Square brackets define a set of characters:

```python
import re

# Match vowels
print(re.findall(r"[aeiou]", "Hello World"))  # ['e', 'o', 'o']

# Match NOT vowels
print(re.findall(r"[^aeiou\s]", "Hello"))  # ['H', 'l', 'l']

# Ranges
print(re.findall(r"[a-z]+", "Hello World"))  # ['ello', 'orld']
```

## Anchors

```python
import re

# ^ matches start of string
print(re.search(r"^Hello", "Hello World"))   # Match
print(re.search(r"^World", "Hello World"))   # None

# $ matches end of string
print(re.search(r"World$", "Hello World"))   # Match
```

## Common Mistakes

**Forgetting the raw string prefix:**
```python
re.search("\d+", text)   # Works but \ might cause issues
re.search(r"\d+", text)  # Always use r"" for regex
```

**Using `match()` when you want `search()`:**
```python
re.match(r"\d+", "abc123")   # None (doesn't start with digit)
re.search(r"\d+", "abc123")  # Match: '123'
```

## Key Takeaways

- Use `re.search()` to find a pattern anywhere in a string
- Use `re.findall()` to extract all occurrences
- Use `re.sub()` to replace patterns
- `\d`, `\w`, `\s` match digits, word characters, and whitespace
- Quantifiers `+`, `*`, `?`, `{n}` control how many times a pattern matches
- Always use raw strings (`r"pattern"`) for regex patterns

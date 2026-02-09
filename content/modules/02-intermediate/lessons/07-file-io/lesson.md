---
id: "07-file-io"
title: "File I/O"
concepts:
  - file-reading
  - file-writing
  - with-statement
  - file-modes
why: "Programs need to read and write data that persists beyond a single run. File I/O lets you load configuration, save results, process logs, and work with data files like CSV."
prerequisites:
  - 06-error-handling
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 19 - File Handling"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "File I/O"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "File Handling"
    license: "MIT"
---

# File I/O

Python makes it straightforward to read from and write to files. The built-in `open()` function is your gateway to the filesystem.

## Opening and Reading Files

```python
# Read the entire file as one string
f = open("hello.txt", "r")
content = f.read()
print(content)
f.close()
```

**Always close files** when you're done. But there's a better way...

## The `with` Statement

The `with` statement automatically closes the file, even if an error occurs:

```python
with open("hello.txt", "r") as f:
    content = f.read()
    print(content)
# File is automatically closed here
```

Always prefer `with` over manual `open()`/`close()`.

## Reading Methods

```python
with open("data.txt", "r") as f:
    # Read entire file as a string
    content = f.read()

with open("data.txt", "r") as f:
    # Read one line at a time
    first_line = f.readline()
    second_line = f.readline()

with open("data.txt", "r") as f:
    # Read all lines into a list
    lines = f.readlines()
    print(lines)   # ['line 1\n', 'line 2\n', 'line 3\n']
```

## Iterating Over Lines

The most memory-efficient way to process a file line by line:

```python
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())   # strip() removes the trailing newline
```

## Writing Files

```python
# Write mode — creates or overwrites the file
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")

# Append mode — adds to the end of existing content
with open("output.txt", "a") as f:
    f.write("Third line\n")
```

## File Modes

| Mode | Description |
|------|-------------|
| `"r"` | Read (default). File must exist. |
| `"w"` | Write. Creates file or **overwrites** existing. |
| `"a"` | Append. Creates file or adds to end. |
| `"x"` | Exclusive create. Fails if file exists. |
| `"r+"` | Read and write. File must exist. |
| `"b"` | Binary mode (add to other modes: `"rb"`, `"wb"`). |

## Writing Multiple Lines

```python
lines = ["apple", "banana", "cherry"]

with open("fruits.txt", "w") as f:
    for fruit in lines:
        f.write(fruit + "\n")

# Or use writelines (does NOT add newlines automatically)
with open("fruits.txt", "w") as f:
    f.writelines(fruit + "\n" for fruit in lines)
```

## Working with CSV Files

Python's `csv` module handles comma-separated value files:

```python
import csv

# Reading CSV
with open("data.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)   # Each row is a list of strings

# Writing CSV
with open("output.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "age", "city"])
    writer.writerow(["Alice", 30, "Portland"])
    writer.writerow(["Bob", 25, "Seattle"])
```

## Reading CSV as Dictionaries

```python
import csv

with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["age"])
```

## Checking if a File Exists

```python
import os

if os.path.exists("data.txt"):
    print("File exists")
else:
    print("File not found")

# Or using pathlib (more modern)
from pathlib import Path

if Path("data.txt").exists():
    print("File exists")
```

## Common Mistakes

**Forgetting to close files:**
```python
# Bad — file stays open if an error occurs
f = open("data.txt")
data = f.read()
f.close()

# Good — with statement handles closing
with open("data.txt") as f:
    data = f.read()
```

**Overwriting when you meant to append:**
```python
# This ERASES the file first!
with open("log.txt", "w") as f:
    f.write("new entry\n")

# This adds to the end
with open("log.txt", "a") as f:
    f.write("new entry\n")
```

**Forgetting newlines with write():**
```python
with open("out.txt", "w") as f:
    f.write("line 1")
    f.write("line 2")
# File contains: "line 1line 2" — no newline between them!
```

## Key Takeaways

- Always use `with open(...) as f:` to ensure files are properly closed
- `"r"` reads, `"w"` writes (overwrites), `"a"` appends
- Iterate over a file object to read line by line (memory efficient)
- Use `strip()` to remove trailing newlines when reading
- `write()` does not add newlines automatically -- you must include `\n`
- The `csv` module handles CSV files correctly (quoting, escaping, etc.)

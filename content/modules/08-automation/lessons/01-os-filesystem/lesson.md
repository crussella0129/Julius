---
id: "01-os-filesystem"
title: "Working with the Filesystem"
concepts:
  - os-module
  - pathlib
  - shutil
  - file-operations
why: "Almost every automation script needs to read, write, move, or organize files. Python's os, pathlib, and shutil modules give you full control over the filesystem without opening a terminal."
prerequisites:
  - 10-practical-ml
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 19 - File Handling"
    license: "MIT"
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 10 - Organizing Files"
    license: "CC BY-NC-SA 3.0"
---

# Working with the Filesystem

Python gives you three main modules for working with files and directories: `os` for operating system interactions, `pathlib` for modern path handling, and `shutil` for high-level file operations like copying and moving.

## The `os` Module

The `os` module provides functions that interact with the operating system:

```python
import os

# Get the current working directory
cwd = os.getcwd()
print(cwd)  # /home/user/projects

# List files in a directory
files = os.listdir(".")
print(files)  # ['script.py', 'data', 'README.md']

# Check if a path exists
print(os.path.exists("script.py"))  # True
print(os.path.isfile("script.py"))  # True
print(os.path.isdir("data"))        # True
```

## Creating and Removing Directories

```python
import os

# Create a single directory
os.mkdir("output")

# Create nested directories (like mkdir -p)
os.makedirs("output/reports/2024", exist_ok=True)

# Remove an empty directory
os.rmdir("output")

# Remove nested empty directories
os.removedirs("output/reports/2024")
```

The `exist_ok=True` parameter prevents an error if the directory already exists.

## The `pathlib` Module (Modern Approach)

`pathlib` provides an object-oriented way to handle paths. It is generally preferred over `os.path`:

```python
from pathlib import Path

# Create a path object
p = Path("data/reports")

# Join paths with /
config = Path("home") / "user" / ".config"
print(config)  # home/user/.config

# Get parts of a path
f = Path("/home/user/report.csv")
print(f.name)      # report.csv
print(f.stem)      # report
print(f.suffix)    # .csv
print(f.parent)    # /home/user
```

## Reading and Writing Files with pathlib

```python
from pathlib import Path

# Write text to a file
Path("greeting.txt").write_text("Hello, World!")

# Read text from a file
content = Path("greeting.txt").read_text()
print(content)  # Hello, World!
```

## Iterating Over Files

```python
from pathlib import Path

# List all files in a directory
for item in Path(".").iterdir():
    print(item.name, "dir" if item.is_dir() else "file")

# Find all Python files recursively
for py_file in Path(".").rglob("*.py"):
    print(py_file)
```

## The `shutil` Module

`shutil` handles high-level file operations:

```python
import shutil

# Copy a file
shutil.copy("source.txt", "backup.txt")

# Copy a file with metadata (permissions, timestamps)
shutil.copy2("source.txt", "backup.txt")

# Copy an entire directory tree
shutil.copytree("project", "project_backup")

# Move a file or directory
shutil.move("old_name.txt", "new_name.txt")

# Remove an entire directory tree (dangerous!)
shutil.rmtree("project_backup")
```

## Getting File Information

```python
from pathlib import Path
import os

p = Path("report.csv")
stat = p.stat()
print(f"Size: {stat.st_size} bytes")
print(f"Modified: {stat.st_mtime}")

# Human-readable size
size = os.path.getsize("report.csv")
print(f"Size: {size / 1024:.1f} KB")
```

## Common Mistakes

**Not using `exist_ok=True`:**
```python
os.makedirs("output")   # FileExistsError if 'output' exists
os.makedirs("output", exist_ok=True)  # Safe
```

**Using string concatenation for paths:**
```python
# Bad — breaks on different operating systems
path = "data" + "/" + "file.txt"

# Good — works everywhere
path = Path("data") / "file.txt"
```

## Key Takeaways

- Use `pathlib.Path` for modern, readable path handling
- `os` provides lower-level system interactions and environment variables
- `shutil` handles copying, moving, and deleting files and directories
- Always use `exist_ok=True` with `makedirs` to avoid errors
- Use `/` operator with `Path` objects instead of string concatenation
- `rglob()` recursively finds files matching a pattern

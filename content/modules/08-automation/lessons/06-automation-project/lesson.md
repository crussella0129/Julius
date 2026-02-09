---
id: "06-automation-project"
title: "Project: File Organizer"
concepts:
  - project-design
  - file-organization
  - combining-modules
  - automation-patterns
why: "Building a real project ties together everything you have learned. A file organizer is a classic automation task that uses filesystem operations, pattern matching, and good program design."
prerequisites:
  - 05-email-api
sources:
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 10 - Organizing Files"
    license: "CC BY-NC-SA 3.0"
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 19 - File Handling"
    license: "MIT"
---

# Project: File Organizer

In this project, you will build a file organizer that automatically sorts files into folders based on their type. This combines filesystem operations, pattern matching, and good program structure.

## The Problem

Downloads folders get messy. You end up with a flat list of hundreds of files: PDFs, images, spreadsheets, code files, all mixed together. An organizer script can sort them automatically.

## Planning the Solution

Before writing code, plan the categories:

```python
CATEGORIES = {
    "Images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"],
    "Documents": [".pdf", ".doc", ".docx", ".txt", ".rtf"],
    "Spreadsheets": [".csv", ".xls", ".xlsx"],
    "Code": [".py", ".js", ".html", ".css", ".java"],
    "Archives": [".zip", ".tar", ".gz", ".rar"],
    "Audio": [".mp3", ".wav", ".flac", ".aac"],
    "Video": [".mp4", ".avi", ".mkv", ".mov"],
}
```

## Step 1: Classify Files

Write a function that determines a file's category:

```python
from pathlib import Path

def get_category(filepath):
    """Return the category name for a file based on its extension."""
    ext = Path(filepath).suffix.lower()
    for category, extensions in CATEGORIES.items():
        if ext in extensions:
            return category
    return "Other"

# Test it
print(get_category("photo.jpg"))    # Images
print(get_category("report.pdf"))   # Documents
print(get_category("script.py"))    # Code
print(get_category("mystery.xyz"))  # Other
```

## Step 2: Create Target Directories

```python
from pathlib import Path

def setup_directories(base_path):
    """Create category directories if they don't exist."""
    base = Path(base_path)
    for category in CATEGORIES:
        (base / category).mkdir(exist_ok=True)
    (base / "Other").mkdir(exist_ok=True)
    print(f"Created directories in {base}")
```

## Step 3: Move Files

```python
import shutil
from pathlib import Path

def organize_file(filepath, base_path):
    """Move a single file to its category folder."""
    src = Path(filepath)
    category = get_category(src.name)
    dest_dir = Path(base_path) / category
    dest = dest_dir / src.name

    # Handle name conflicts
    if dest.exists():
        stem = src.stem
        suffix = src.suffix
        counter = 1
        while dest.exists():
            dest = dest_dir / f"{stem}_{counter}{suffix}"
            counter += 1

    shutil.move(str(src), str(dest))
    return category, dest.name
```

## Step 4: Put It All Together

```python
from pathlib import Path

def organize_directory(directory):
    """Organize all files in a directory by type."""
    base = Path(directory)
    setup_directories(base)

    moved = 0
    for item in base.iterdir():
        if item.is_file():
            category, new_name = organize_file(item, base)
            print(f"  {item.name} -> {category}/{new_name}")
            moved += 1

    print(f"\nOrganized {moved} files.")

# Run it
organize_directory("/home/user/Downloads")
```

## Step 5: Add a Dry Run Mode

A dry run shows what would happen without actually moving files:

```python
def organize_directory(directory, dry_run=False):
    """Organize files. Use dry_run=True to preview without moving."""
    base = Path(directory)

    if not dry_run:
        setup_directories(base)

    moved = 0
    for item in base.iterdir():
        if item.is_file():
            category = get_category(item.name)
            if dry_run:
                print(f"  [DRY RUN] {item.name} -> {category}/")
            else:
                category, new_name = organize_file(item, base)
                print(f"  {item.name} -> {category}/{new_name}")
            moved += 1

    print(f"\n{'Would organize' if dry_run else 'Organized'} {moved} files.")
```

## Step 6: Add Logging

```python
import logging

logging.basicConfig(
    filename="organizer.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s"
)

def organize_file(filepath, base_path):
    src = Path(filepath)
    category = get_category(src.name)
    dest_dir = Path(base_path) / category
    dest = dest_dir / src.name

    shutil.move(str(src), str(dest))
    logging.info(f"Moved {src.name} to {category}/")
    return category, dest.name
```

## Design Patterns Used

- **Configuration as data**: Categories defined in a dictionary, easy to modify
- **Dry run mode**: Preview changes before committing them
- **Name conflict resolution**: Handles duplicate filenames safely
- **Logging**: Records actions for debugging and auditing
- **Small functions**: Each function does one thing well

## Common Mistakes

**Moving directories accidentally:**
```python
for item in base.iterdir():
    organize_file(item, base)  # Moves directories too!

for item in base.iterdir():
    if item.is_file():         # Check first!
        organize_file(item, base)
```

**Forgetting to handle case sensitivity:**
```python
# .JPG and .jpg should be treated the same
ext = Path(filepath).suffix.lower()  # Always lowercase
```

## Key Takeaways

- Plan your project structure before writing code
- Use dictionaries to map categories to file extensions
- Always include a dry run mode for destructive operations
- Handle edge cases: duplicate names, case sensitivity, directories
- Combine pathlib, shutil, and logging for robust file automation
- Break the project into small, testable functions

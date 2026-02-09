---
id: "08-modules-packages"
title: "Modules and Packages"
concepts:
  - import-statement
  - from-import
  - standard-library
  - name-main
why: "Modules let you organize code into separate files and reuse code written by others. Understanding imports and packages is essential for building anything beyond a single script."
prerequisites:
  - 07-file-io
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 12 - Modules"
    license: "MIT"
  - repo: "dabeaz-course/python-mastery"
    section: "Modules and Packages"
    license: "CC BY-SA 4.0"
  - repo: "satwikkansal/wtfpython"
    section: "Modules"
    license: "MIT"
---

# Modules and Packages

A **module** is simply a Python file (`.py`) that contains definitions and statements. A **package** is a directory of modules. Python's power comes partly from its enormous ecosystem of modules you can import and use.

## Importing Modules

The `import` statement loads a module:

```python
import math

print(math.pi)           # 3.141592653589793
print(math.sqrt(16))     # 4.0
print(math.ceil(4.2))    # 5
print(math.floor(4.8))   # 4
```

## From ... Import

Import specific items directly into your namespace:

```python
from math import pi, sqrt

print(pi)          # 3.141592653589793
print(sqrt(16))    # 4.0 — no "math." prefix needed
```

## Import with Alias

Give a module a shorter name:

```python
import math as m

print(m.pi)
print(m.sqrt(16))
```

## Useful Standard Library Modules

Python comes with "batteries included" -- a huge standard library:

```python
import random
print(random.randint(1, 10))     # Random integer 1-10
print(random.choice(["a", "b", "c"]))  # Random pick

import datetime
now = datetime.datetime.now()
print(now.strftime("%Y-%m-%d"))  # 2026-02-08

import os
print(os.getcwd())              # Current working directory
print(os.listdir("."))           # Files in current directory

import json
data = {"name": "Alice", "age": 30}
text = json.dumps(data)          # Dict to JSON string
parsed = json.loads(text)        # JSON string to dict
```

## Creating Your Own Modules

Any `.py` file is a module. If you have `helpers.py`:

```python
# helpers.py
def greet(name):
    return f"Hello, {name}!"

PI = 3.14159
```

You can import it from another file in the same directory:

```python
# main.py
import helpers

print(helpers.greet("Alice"))   # Hello, Alice!
print(helpers.PI)               # 3.14159
```

Or import specific items:

```python
from helpers import greet, PI
print(greet("Bob"))
```

## The `__name__` Variable

Every module has a special `__name__` variable. When a file is run directly, `__name__` is `"__main__"`. When imported, `__name__` is the module's name:

```python
# mymodule.py
def main():
    print("Running as main program")

if __name__ == "__main__":
    main()
```

This pattern lets a file work both as a script and as an importable module:

```python
# Running directly: python mymodule.py → prints "Running as main program"
# Importing: import mymodule → does NOT print (main() is not called)
```

## Packages

A package is a directory containing an `__init__.py` file (which can be empty):

```
mypackage/
    __init__.py
    module_a.py
    module_b.py
```

```python
from mypackage import module_a
from mypackage.module_b import some_function
```

## Installing Third-Party Packages

Use `pip` to install packages from PyPI (Python Package Index):

```python
# In your terminal (not in Python):
# pip install requests
# pip install numpy pandas

import requests
response = requests.get("https://example.com")
print(response.status_code)
```

## Virtual Environments

Virtual environments isolate project dependencies:

```bash
# Create a virtual environment
python3 -m venv myenv

# Activate it
source myenv/bin/activate       # macOS/Linux
# myenv\Scripts\activate        # Windows

# Install packages (only in this environment)
pip install requests

# Deactivate when done
deactivate
```

## Listing Installed Packages

```bash
pip list                # Show all installed packages
pip freeze              # Show in requirements.txt format
pip freeze > requirements.txt   # Save to file
pip install -r requirements.txt # Install from file
```

## Common Mistakes

**Circular imports:**
```python
# file_a.py imports file_b, and file_b imports file_a
# This causes ImportError — restructure your code to avoid it
```

**Naming your file the same as a module:**
```python
# If you name your file "random.py", then:
import random   # Imports YOUR file, not Python's random module!
# Rename your file to something else
```

**Importing everything with * :**
```python
from math import *     # Imports EVERYTHING — pollutes your namespace
from math import sqrt, pi  # Better — explicit imports
```

## Key Takeaways

- `import module` loads a module; access items with `module.name`
- `from module import item` imports directly into your namespace
- Python's standard library has modules for math, files, dates, JSON, and more
- Any `.py` file is a module; a directory with `__init__.py` is a package
- Use `if __name__ == "__main__":` to make files work as both scripts and modules
- Use virtual environments to isolate project dependencies
- Never name your files the same as standard library modules

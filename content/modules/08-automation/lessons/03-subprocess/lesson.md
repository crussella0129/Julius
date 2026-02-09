---
id: "03-subprocess"
title: "Running External Commands"
concepts:
  - subprocess-run
  - capturing-output
  - shell-commands
  - process-management
why: "Python scripts often need to run external programs like git, ffmpeg, or system utilities. The subprocess module lets you launch processes, capture their output, and handle errors cleanly."
prerequisites:
  - 02-regex
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 20 - Python Package Manager"
    license: "MIT"
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 17 - Running Other Programs"
    license: "CC BY-NC-SA 3.0"
---

# Running External Commands

The `subprocess` module is Python's way of running external programs. It replaces older approaches like `os.system()` with a safer, more flexible interface.

## `subprocess.run()` Basics

```python
import subprocess

# Run a simple command
result = subprocess.run(["echo", "Hello from subprocess!"])
print(result.returncode)  # 0 means success
```

The command is passed as a list where the first element is the program and the rest are arguments.

## Capturing Output

```python
import subprocess

result = subprocess.run(
    ["python3", "-c", "print('Hello!')"],
    capture_output=True,
    text=True
)
print(result.stdout)       # Hello!
print(result.returncode)   # 0
```

The `capture_output=True` parameter captures stdout and stderr. The `text=True` parameter returns strings instead of bytes.

## Handling Errors

```python
import subprocess

result = subprocess.run(
    ["python3", "-c", "raise ValueError('oops')"],
    capture_output=True,
    text=True
)
print(result.returncode)  # 1 (non-zero means error)
print(result.stderr)      # Traceback...ValueError: oops
```

Use `check=True` to automatically raise an exception on failure:

```python
import subprocess

try:
    subprocess.run(
        ["python3", "-c", "raise ValueError('oops')"],
        capture_output=True,
        text=True,
        check=True
    )
except subprocess.CalledProcessError as e:
    print(f"Command failed with return code {e.returncode}")
    print(f"Error: {e.stderr}")
```

## Timeouts

Prevent commands from running forever:

```python
import subprocess

try:
    subprocess.run(
        ["python3", "-c", "import time; time.sleep(60)"],
        timeout=5
    )
except subprocess.TimeoutExpired:
    print("Command took too long!")
```

## Passing Input to a Command

```python
import subprocess

result = subprocess.run(
    ["python3", "-c", "name = input(); print(f'Hello, {name}!')"],
    input="Alice",
    capture_output=True,
    text=True
)
print(result.stdout)  # Hello, Alice!
```

## Working Directory

```python
import subprocess

result = subprocess.run(
    ["ls", "-la"],
    capture_output=True,
    text=True,
    cwd="/tmp"
)
print(result.stdout)
```

## Why Not `shell=True`?

You might see `subprocess.run("echo hello", shell=True)`. This passes the command through the system shell, which is convenient but dangerous with user input:

```python
# DANGEROUS — never do this with user input
user_input = "file.txt; rm -rf /"
subprocess.run(f"cat {user_input}", shell=True)  # Shell injection!

# SAFE — use a list instead
subprocess.run(["cat", user_input])  # Treats input as a filename
```

## Building Command Pipelines

For simple cases, chain Python processing instead of shell pipes:

```python
import subprocess

# Instead of: ls | grep .py | wc -l
result = subprocess.run(
    ["ls"], capture_output=True, text=True
)
py_files = [f for f in result.stdout.splitlines() if f.endswith(".py")]
print(f"Found {len(py_files)} Python files")
```

## Common Mistakes

**Using a string instead of a list:**
```python
subprocess.run("echo hello")          # FileNotFoundError
subprocess.run(["echo", "hello"])     # Correct
```

**Forgetting `text=True`:**
```python
result = subprocess.run(["echo", "hi"], capture_output=True)
print(result.stdout)  # b'hi\n' — bytes, not string
```

## Key Takeaways

- Use `subprocess.run()` with a list of arguments
- `capture_output=True` and `text=True` to get string output
- `check=True` raises an exception if the command fails
- Use `timeout` to prevent runaway processes
- Avoid `shell=True` to prevent shell injection vulnerabilities
- Always handle `CalledProcessError` when using `check=True`

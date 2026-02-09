---
id: "06-secure-coding"
title: "Secure Coding Practices"
concepts:
  - secrets-management
  - input-sanitization
  - dependency-security
  - error-handling-security
why: "Writing secure code means building defenses into your software from the start -- managing secrets properly, sanitizing all inputs, and handling errors without leaking information."
prerequisites:
  - 05-forensics
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "Secure Coding Practices"
    license: "CC BY-SA 4.0"
  - repo: "NIST/SP800-218"
    section: "Secure Software Development Framework"
    license: "Public Domain"
---

# Secure Coding Practices

Security is not something you add at the end -- it must be built into your code from the start. This lesson covers the practices that prevent vulnerabilities before they happen.

## Secrets Management

Never hardcode secrets (passwords, API keys, tokens) in your source code:

```python
# BAD -- secret in source code
API_KEY = "sk-abc123secret456"

# GOOD -- secret from environment variable
import os

API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    raise RuntimeError("API_KEY environment variable not set")
```

For generating secure random values, use the `secrets` module (not `random`):

```python
import secrets

# Generate a secure token
token = secrets.token_hex(32)
print(f"Auth token: {token[:16]}...")

# Generate a secure URL-safe token
url_token = secrets.token_urlsafe(32)
print(f"URL token: {url_token[:16]}...")

# Generate a random password
import string
alphabet = string.ascii_letters + string.digits + string.punctuation
password = ''.join(secrets.choice(alphabet) for _ in range(16))
print(f"Password: {'*' * len(password)}")
```

## Input Sanitization

Every piece of external input is a potential attack vector. Validate early, sanitize thoroughly:

```python
import re

def sanitize_filename(filename):
    """Remove path traversal and dangerous characters from filenames."""
    # Remove path separators
    filename = filename.replace("/", "").replace("\\", "")
    # Remove null bytes
    filename = filename.replace("\x00", "")
    # Allow only safe characters
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    # Prevent hidden files
    filename = filename.lstrip(".")
    return filename or "unnamed"

# Test with malicious inputs
tests = ["report.pdf", "../../../etc/passwd", "file\x00.txt", "..hidden"]
for name in tests:
    print(f"  {name!r:30s} -> {sanitize_filename(name)}")
```

Output:
```
  'report.pdf'                   -> report.pdf
  '../../../etc/passwd'          -> etcpasswd
  'file\x00.txt'                 -> file.txt
  '..hidden'                     -> hidden
```

## Safe Deserialization

Never use `pickle` or `eval()` on untrusted data:

```python
import json

# BAD -- pickle can execute arbitrary code
# import pickle
# data = pickle.loads(untrusted_bytes)  # Remote code execution!

# BAD -- eval can execute arbitrary code
# result = eval(user_input)  # Remote code execution!

# GOOD -- JSON is safe for data exchange
def safe_parse(data_string):
    """Parse data safely using JSON."""
    try:
        return json.loads(data_string)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
        return None

# Safe
result = safe_parse('{"name": "Alice", "score": 95}')
print(result)  # {'name': 'Alice', 'score': 95}

# Rejects malicious input
result = safe_parse('__import__("os").system("rm -rf /")')
print(result)  # None (invalid JSON)
```

## Secure Error Handling

Error messages should help developers debug but never reveal system internals to users:

```python
import logging
import traceback

logger = logging.getLogger(__name__)

def process_payment(amount, card_number):
    """Process a payment with secure error handling."""
    try:
        # Validate input
        if not isinstance(amount, (int, float)) or amount <= 0:
            raise ValueError("Invalid amount")
        # ... process payment ...
        return {"status": "success", "amount": amount}
    except ValueError as e:
        # Log the full error internally
        logger.error(f"Payment failed: {e}, card=****{card_number[-4:]}")
        # Return a generic message to the user
        return {"status": "error", "message": "Payment could not be processed"}
    except Exception as e:
        # Log the full traceback internally
        logger.error(f"Unexpected error: {traceback.format_exc()}")
        # Never expose internal details to the user
        return {"status": "error", "message": "An unexpected error occurred"}
```

## Dependency Security

Third-party packages can contain vulnerabilities:

```python
# Check for known vulnerabilities in your dependencies
# pip install pip-audit
# pip-audit

# Pin exact versions in requirements.txt
# requests==2.31.0
# cryptography==41.0.7

# Verify package integrity with hashes
# pip install --require-hashes -r requirements.txt

def check_dependency_age(package_name, installed_version):
    """Flag if a dependency might be outdated (simplified check)."""
    major = int(installed_version.split(".")[0])
    if major < 2:
        print(f"WARNING: {package_name} v{installed_version} may be outdated")
    else:
        print(f"OK: {package_name} v{installed_version}")

check_dependency_age("requests", "2.31.0")   # OK
check_dependency_age("urllib3", "1.26.18")    # WARNING
```

## Rate Limiting

Protect endpoints from brute-force attacks:

```python
import time
from collections import defaultdict

class RateLimiter:
    def __init__(self, max_attempts=5, window_seconds=300):
        self.max_attempts = max_attempts
        self.window = window_seconds
        self.attempts = defaultdict(list)

    def is_allowed(self, key):
        """Check if a request is allowed under the rate limit."""
        now = time.time()
        # Remove old attempts outside the window
        self.attempts[key] = [
            t for t in self.attempts[key] if now - t < self.window
        ]
        if len(self.attempts[key]) >= self.max_attempts:
            return False
        self.attempts[key].append(now)
        return True

limiter = RateLimiter(max_attempts=3, window_seconds=60)
for i in range(5):
    result = "allowed" if limiter.is_allowed("user1") else "blocked"
    print(f"Attempt {i+1}: {result}")
```

## Common Mistakes

**Using `random` for security**: The `random` module is predictable. Always use `secrets` for tokens, passwords, and security-critical randomness.

**Logging sensitive data**: Never log passwords, full credit card numbers, or tokens. Mask them in log output.

**Catching and silencing exceptions**: Empty `except` blocks hide security failures. Always log errors internally.

## Key Takeaways

- Never hardcode secrets; use environment variables or secret managers
- Use `secrets` (not `random`) for security-critical randomness
- Sanitize all filenames, paths, and user input before processing
- Never use `pickle` or `eval()` on untrusted data; use JSON instead
- Log detailed errors internally but show generic messages to users
- Pin dependency versions and audit them for known vulnerabilities

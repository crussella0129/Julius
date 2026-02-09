---
id: "04-web-security"
title: "Web Security"
concepts:
  - sql-injection
  - xss
  - owasp-top-10
  - input-validation
why: "Web applications are the most common attack target -- understanding SQL injection, XSS, and the OWASP Top 10 is essential for building and testing secure web apps."
prerequisites:
  - 03-network-scanning
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "SQL Injection Prevention"
    license: "CC BY-SA 4.0"
  - repo: "OWASP/Top10"
    section: "OWASP Top 10 2021"
    license: "CC BY-SA 4.0"
---

# Web Security

Web applications face constant attacks. The OWASP (Open Web Application Security Project) Top 10 lists the most critical security risks. Understanding these vulnerabilities helps you build secure applications and succeed in CTF competitions.

## The OWASP Top 10 (2021)

1. **Broken Access Control** -- Users can act outside their intended permissions
2. **Cryptographic Failures** -- Sensitive data exposed due to weak crypto
3. **Injection** -- Untrusted data sent to an interpreter (SQL, OS, LDAP)
4. **Insecure Design** -- Missing security controls in the design phase
5. **Security Misconfiguration** -- Default configs, open cloud storage
6. **Vulnerable Components** -- Using libraries with known vulnerabilities
7. **Authentication Failures** -- Broken login, session management
8. **Software Integrity Failures** -- Unverified updates, CI/CD compromises
9. **Logging Failures** -- Insufficient monitoring and alerting
10. **Server-Side Request Forgery** -- Server makes requests to unintended locations

## SQL Injection

SQL injection occurs when user input is directly embedded in a SQL query. The attacker can modify the query to access or destroy data.

```python
# VULNERABLE -- never do this!
def login_vulnerable(username, password):
    query = f"SELECT * FROM users WHERE name='{username}' AND pass='{password}'"
    print(f"Query: {query}")
    return query

# An attacker enters: username = "admin' --"
login_vulnerable("admin' --", "anything")
# Query: SELECT * FROM users WHERE name='admin' --' AND pass='anything'
# The -- comments out the password check!
```

The fix is to use **parameterized queries**:

```python
import sqlite3

def login_safe(cursor, username, password):
    """Use parameterized queries to prevent SQL injection."""
    cursor.execute(
        "SELECT * FROM users WHERE name=? AND pass=?",
        (username, password)
    )
    return cursor.fetchone()
```

The `?` placeholders tell the database driver to treat the values as data, never as SQL code.

## Cross-Site Scripting (XSS)

XSS occurs when an application includes untrusted data in a web page without proper encoding. The attacker's script runs in other users' browsers.

```python
# VULNERABLE -- user input rendered directly in HTML
def render_comment_vulnerable(comment):
    return f"<div class='comment'>{comment}</div>"

# Attacker submits: <script>alert('hacked')</script>
malicious = "<script>alert('hacked')</script>"
print(render_comment_vulnerable(malicious))
# <div class='comment'><script>alert('hacked')</script></div>
```

The fix is to **escape HTML entities**:

```python
import html

def render_comment_safe(comment):
    """Escape HTML to prevent XSS."""
    safe_comment = html.escape(comment)
    return f"<div class='comment'>{safe_comment}</div>"

malicious = "<script>alert('hacked')</script>"
print(render_comment_safe(malicious))
# <div class='comment'>&lt;script&gt;alert(&#x27;hacked&#x27;)&lt;/script&gt;</div>
```

## Input Validation

Always validate and sanitize user input before processing:

```python
import re

def validate_username(username):
    """Allow only alphanumeric characters and underscores, 3-20 chars."""
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    if re.match(pattern, username):
        return True
    return False

print(validate_username("alice_123"))         # True
print(validate_username("admin' OR 1=1--"))   # False
print(validate_username("<script>"))          # False
```

## CSRF (Cross-Site Request Forgery)

CSRF tricks a logged-in user's browser into making unwanted requests. Prevention uses tokens:

```python
import secrets

def generate_csrf_token():
    """Generate a random token for CSRF protection."""
    return secrets.token_hex(32)

def validate_csrf_token(submitted, stored):
    """Compare tokens using constant-time comparison."""
    import hmac
    return hmac.compare_digest(submitted, stored)

token = generate_csrf_token()
print(f"Token: {token[:16]}...")
print(validate_csrf_token(token, token))  # True
print(validate_csrf_token("forged-token", token))  # False
```

## Security Headers

HTTP response headers add layers of defense:

```python
security_headers = {
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-XSS-Protection": "1; mode=block",
}

for header, value in security_headers.items():
    print(f"{header}: {value}")
```

## Common Mistakes

**String formatting in SQL queries**: Always use parameterized queries, never f-strings or format().

**Trusting client-side validation**: Client-side checks improve UX but provide zero security. Always validate server-side.

**Displaying raw user input**: Always escape HTML output to prevent XSS.

## Key Takeaways

- The OWASP Top 10 guides web security priorities
- SQL injection is prevented by parameterized queries (never string formatting)
- XSS is prevented by escaping HTML entities with `html.escape()`
- Input validation uses allowlists (regex patterns) rather than blocklists
- CSRF tokens prevent forged cross-site requests
- Security headers add defense-in-depth at the HTTP level

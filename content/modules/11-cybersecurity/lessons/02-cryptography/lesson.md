---
id: "02-cryptography"
title: "Cryptography with Python"
concepts:
  - hashing
  - hmac
  - symmetric-encryption
  - asymmetric-encryption
why: "Cryptography is the mathematical foundation of digital security -- hashing verifies data integrity, encryption protects confidentiality, and signatures prove authenticity."
prerequisites:
  - 01-security-fundamentals
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "Password Storage Cheat Sheet"
    license: "CC BY-SA 4.0"
  - repo: "NIST/SP800-132"
    section: "Password-Based Key Derivation"
    license: "Public Domain"
---

# Cryptography with Python

Cryptography transforms readable data (plaintext) into an unreadable form (ciphertext) and back again. Python's standard library includes `hashlib` and `hmac` for hashing, while the `cryptography` package provides encryption primitives.

## Hashing with hashlib

A hash function takes any input and produces a fixed-size output (the digest). Hash functions are one-way -- you cannot reverse a hash to get the original data.

```python
import hashlib

message = "Hello, World!"
sha256_hash = hashlib.sha256(message.encode()).hexdigest()
print(f"SHA-256: {sha256_hash}")
# SHA-256: dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f
```

Key properties of cryptographic hash functions:

- **Deterministic**: Same input always produces the same hash
- **Fast**: Computing the hash is quick
- **Irreversible**: Cannot recover the input from the hash
- **Collision-resistant**: Extremely unlikely for two inputs to produce the same hash

```python
# Comparing hashes to verify data integrity
def verify_integrity(data, expected_hash):
    actual_hash = hashlib.sha256(data.encode()).hexdigest()
    return actual_hash == expected_hash

original = "important data"
stored_hash = hashlib.sha256(original.encode()).hexdigest()

print(verify_integrity("important data", stored_hash))   # True
print(verify_integrity("tampered data", stored_hash))     # False
```

## Password Hashing

Never store passwords in plain text. Use a slow hash with a salt:

```python
import hashlib
import os

def hash_password(password):
    """Hash a password with a random salt using PBKDF2."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt + key  # Store salt alongside the hash

def verify_password(password, stored):
    """Verify a password against a stored salt+hash."""
    salt = stored[:16]
    stored_key = stored[16:]
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return key == stored_key

stored = hash_password("mysecretpassword")
print(verify_password("mysecretpassword", stored))  # True
print(verify_password("wrongpassword", stored))      # False
```

## HMAC -- Hash-Based Message Authentication

HMAC combines a hash function with a secret key to verify both integrity and authenticity:

```python
import hmac
import hashlib

secret_key = b"my-secret-key"
message = b"transfer $100 to Alice"

# Create HMAC
signature = hmac.new(secret_key, message, hashlib.sha256).hexdigest()
print(f"HMAC: {signature}")

# Verify HMAC (use hmac.compare_digest to prevent timing attacks)
def verify_message(key, message, signature):
    expected = hmac.new(key, message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

print(verify_message(secret_key, message, signature))  # True
print(verify_message(secret_key, b"transfer $1000 to Eve", signature))  # False
```

## Symmetric Encryption

Symmetric encryption uses the same key to encrypt and decrypt. The `cryptography` library provides the Fernet class for easy symmetric encryption:

```python
from cryptography.fernet import Fernet

# Generate a key (in practice, store this securely)
key = Fernet.generate_key()
cipher = Fernet(key)

# Encrypt
plaintext = b"Top secret message"
ciphertext = cipher.encrypt(plaintext)
print(f"Encrypted: {ciphertext[:40]}...")

# Decrypt
decrypted = cipher.decrypt(ciphertext)
print(f"Decrypted: {decrypted.decode()}")  # Top secret message
```

## Asymmetric Encryption

Asymmetric encryption uses a key pair: a public key (shared openly) for encryption and a private key (kept secret) for decryption:

```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes

# Generate key pair
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

# Encrypt with public key
message = b"Secret for the key owner"
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                  algorithm=hashes.SHA256(), label=None)
)

# Decrypt with private key
plaintext = private_key.decrypt(
    ciphertext,
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                  algorithm=hashes.SHA256(), label=None)
)
print(plaintext.decode())  # Secret for the key owner
```

## Common Mistakes

**Using MD5 or SHA-1 for security**: These are broken for security purposes. Use SHA-256 or SHA-3.

**Storing passwords with simple hashing**: Always use PBKDF2, bcrypt, or argon2 with a salt.

**Reusing encryption keys**: Each message or session should ideally use a fresh key or nonce.

## Key Takeaways

- Hash functions (SHA-256) produce fixed-size digests for integrity verification
- HMAC adds a secret key to hashing for authentication
- PBKDF2 with a salt is the minimum standard for password storage
- Symmetric encryption (Fernet/AES) uses one key for both encrypt and decrypt
- Asymmetric encryption uses a key pair: public encrypts, private decrypts
- Always use `hmac.compare_digest()` instead of `==` to prevent timing attacks

---
id: "05-forensics"
title: "Digital Forensics Basics"
concepts:
  - file-analysis
  - log-parsing
  - metadata-extraction
  - evidence-handling
why: "Digital forensics uses Python to investigate security incidents -- analyzing files, parsing logs, and extracting metadata to understand what happened and when."
prerequisites:
  - 04-web-security
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "Logging Cheat Sheet"
    license: "CC BY-SA 4.0"
  - repo: "NIST/SP800-86"
    section: "Guide to Integrating Forensic Techniques"
    license: "Public Domain"
---

# Digital Forensics Basics

Digital forensics is the process of collecting, preserving, and analyzing digital evidence. Python is a powerful tool for forensic analysis -- from parsing log files and extracting metadata to computing file hashes for evidence integrity.

## File Hash Verification

The first step in forensics is verifying that evidence hasn't been tampered with. Computing file hashes creates a digital fingerprint:

```python
import hashlib

def hash_file(filepath, algorithm="sha256"):
    """Compute the hash of a file in chunks to handle large files."""
    h = hashlib.new(algorithm)
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

# In practice: hash evidence files immediately upon collection
# original_hash = hash_file("evidence.img")
# After analysis: verify the hash hasn't changed
# assert hash_file("evidence.img") == original_hash
```

## Log File Analysis

Security logs are a goldmine for forensic investigations. Python makes it easy to parse and analyze them:

```python
import re
from collections import Counter

def parse_auth_log(log_lines):
    """Parse authentication log entries for failed login attempts."""
    failed_pattern = re.compile(
        r"Failed password for (\w+) from ([\d.]+)"
    )
    failed_attempts = []

    for line in log_lines:
        match = failed_pattern.search(line)
        if match:
            user, ip = match.groups()
            failed_attempts.append({"user": user, "ip": ip})

    return failed_attempts

sample_log = [
    "Jan 10 09:15:22 sshd: Failed password for admin from 192.168.1.100",
    "Jan 10 09:15:25 sshd: Accepted password for alice from 10.0.0.5",
    "Jan 10 09:15:30 sshd: Failed password for root from 192.168.1.100",
    "Jan 10 09:15:35 sshd: Failed password for admin from 192.168.1.100",
    "Jan 10 09:16:01 sshd: Failed password for root from 10.0.0.99",
]

failures = parse_auth_log(sample_log)
ip_counts = Counter(f["ip"] for f in failures)
print("Failed login attempts by IP:")
for ip, count in ip_counts.most_common():
    print(f"  {ip}: {count} attempts")
```

Output:
```
Failed login attempts by IP:
  192.168.1.100: 3 attempts
  10.0.0.99: 1 attempts
```

## File Metadata Extraction

Files contain metadata that can reveal important forensic information:

```python
import os
import time

def get_file_metadata(filepath):
    """Extract filesystem metadata from a file."""
    stat = os.stat(filepath)
    return {
        "size_bytes": stat.st_size,
        "created": time.ctime(stat.st_ctime),
        "modified": time.ctime(stat.st_mtime),
        "accessed": time.ctime(stat.st_atime),
        "permissions": oct(stat.st_mode)[-3:],
    }

# Example usage:
# metadata = get_file_metadata("/var/log/syslog")
# for key, value in metadata.items():
#     print(f"  {key}: {value}")
```

## Hex Dump Analysis

Examining raw file bytes reveals file types and hidden data:

```python
def hex_dump(data, width=16):
    """Display a hex dump of binary data."""
    for offset in range(0, len(data), width):
        chunk = data[offset:offset + width]
        hex_part = " ".join(f"{b:02x}" for b in chunk)
        ascii_part = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        print(f"{offset:08x}  {hex_part:<{width*3}}  {ascii_part}")

# File signatures (magic bytes) identify file types
MAGIC_BYTES = {
    b"\x89PNG": "PNG image",
    b"\xff\xd8\xff": "JPEG image",
    b"PK": "ZIP archive",
    b"%PDF": "PDF document",
    b"\x7fELF": "ELF executable",
}

def identify_file_type(filepath):
    """Identify file type by reading magic bytes."""
    with open(filepath, "rb") as f:
        header = f.read(8)
    for magic, filetype in MAGIC_BYTES.items():
        if header.startswith(magic):
            return filetype
    return "Unknown"
```

## Timeline Analysis

Building a timeline of events from multiple log sources:

```python
from datetime import datetime

def parse_timestamp(log_entry):
    """Extract and parse a timestamp from a log entry."""
    # Format: "2024-01-15 14:30:22 EVENT message"
    parts = log_entry.split(" ", 2)
    timestamp_str = f"{parts[0]} {parts[1]}"
    return datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")

def build_timeline(log_entries):
    """Sort log entries chronologically."""
    events = []
    for entry in log_entries:
        ts = parse_timestamp(entry)
        events.append((ts, entry))
    events.sort(key=lambda x: x[0])
    return events

logs = [
    "2024-01-15 14:35:00 LOGIN admin logged in",
    "2024-01-15 14:30:22 ALERT failed login attempt",
    "2024-01-15 14:32:10 SCAN port scan detected",
]

timeline = build_timeline(logs)
for ts, event in timeline:
    print(f"[{ts}] {event.split(' ', 2)[2]}")
```

## Common Mistakes

**Modifying evidence**: Always work on copies. Hash the original before and after analysis to prove integrity.

**Ignoring timestamps**: File timestamps are critical evidence. Mounting a filesystem read-write can alter them.

**Incomplete log collection**: Attackers often clear logs. Check multiple sources: syslog, auth.log, application logs, and web server access logs.

## Key Takeaways

- Hash files immediately to establish evidence integrity
- Regular expressions are essential for parsing log files
- The `Counter` class quickly identifies patterns in forensic data
- File metadata (timestamps, permissions) provides forensic context
- Magic bytes identify file types regardless of file extension
- Always work on copies of evidence, never the originals

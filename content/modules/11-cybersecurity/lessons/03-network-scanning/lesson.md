---
id: "03-network-scanning"
title: "Network Programming & Scanning"
concepts:
  - sockets
  - port-scanning
  - network-protocols
  - ctf-techniques
why: "Understanding how computers communicate over networks is essential for both building and securing applications -- socket programming is the foundation of all network tools."
prerequisites:
  - 02-cryptography
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "Network Security Cheat Sheet"
    license: "CC BY-SA 4.0"
  - repo: "NIST/SP800-115"
    section: "Technical Guide to Information Security Testing"
    license: "Public Domain"
---

# Network Programming & Scanning

Every networked application -- web browsers, chat apps, game servers -- communicates using sockets. Understanding how sockets work gives you the power to build network tools, analyze traffic, and find vulnerabilities in CTF competitions.

## Socket Basics

A socket is an endpoint for network communication. Python's `socket` module provides low-level networking:

```python
import socket

# Create a TCP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect to a server
sock.connect(("example.com", 80))

# Send an HTTP request
request = "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
sock.sendall(request.encode())

# Receive the response
response = sock.recv(4096)
print(response.decode()[:200])

sock.close()
```

The key parameters:
- `AF_INET` -- IPv4 addressing
- `SOCK_STREAM` -- TCP (reliable, ordered)
- `SOCK_DGRAM` -- UDP (fast, no guarantees)

## Building a Simple Server

```python
import socket

def echo_server(host="127.0.0.1", port=9999):
    """A server that echoes back whatever the client sends."""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(1)
    print(f"Listening on {host}:{port}")

    conn, addr = server.accept()
    print(f"Connection from {addr}")
    data = conn.recv(1024)
    conn.sendall(data)  # Echo back
    conn.close()
    server.close()
```

## Port Scanning

Port scanning determines which services are running on a host. This is a fundamental technique for security assessments and CTF challenges:

```python
import socket

def scan_port(host, port, timeout=1):
    """Check if a single port is open."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        result = sock.connect_ex((host, port))
        return result == 0  # 0 means success (port open)
    finally:
        sock.close()

def scan_ports(host, port_range):
    """Scan a range of ports and return open ones."""
    open_ports = []
    for port in port_range:
        if scan_port(host, port):
            open_ports.append(port)
            print(f"  Port {port}: OPEN")
    return open_ports

# Scan common ports on localhost
common_ports = [22, 80, 443, 3306, 5432, 8080]
print("Scanning localhost...")
open_ports = scan_ports("127.0.0.1", common_ports)
print(f"Found {len(open_ports)} open ports")
```

## Banner Grabbing

Once you find an open port, you can grab its banner to identify the service:

```python
def grab_banner(host, port, timeout=2):
    """Connect to a port and read the service banner."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        sock.sendall(b"HEAD / HTTP/1.1\r\nHost: target\r\n\r\n")
        banner = sock.recv(1024).decode(errors="replace")
        return banner.strip()
    except (socket.timeout, ConnectionRefusedError):
        return None
    finally:
        sock.close()
```

## DNS Lookups

Resolve hostnames to IP addresses:

```python
import socket

# Forward lookup: hostname -> IP
ip = socket.gethostbyname("example.com")
print(f"example.com -> {ip}")

# Reverse lookup: IP -> hostname
try:
    hostname = socket.gethostbyaddr(ip)
    print(f"{ip} -> {hostname[0]}")
except socket.herror:
    print("Reverse lookup failed")

# Get all address info
results = socket.getaddrinfo("example.com", 443)
for family, socktype, proto, canonname, sockaddr in results:
    print(f"  {sockaddr}")
```

## Well-Known Ports

| Port | Service | Protocol |
|------|---------|----------|
| 22 | SSH | TCP |
| 53 | DNS | TCP/UDP |
| 80 | HTTP | TCP |
| 443 | HTTPS | TCP |
| 3306 | MySQL | TCP |
| 5432 | PostgreSQL | TCP |

## Common Mistakes

**Forgetting timeouts**: Without a timeout, `connect()` can block for minutes. Always set `sock.settimeout()`.

**Scanning without permission**: Only scan systems you own or have explicit written authorization to test.

**Not closing sockets**: Always use `try/finally` or context managers to close sockets.

## Key Takeaways

- Sockets are the foundation of all network communication
- `connect_ex()` returns 0 for open ports, making it ideal for scanning
- Always set timeouts on network operations
- Banner grabbing identifies services running on open ports
- Only scan systems you have permission to test
- Well-known port numbers help identify common services

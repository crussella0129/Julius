---
id: "01-security-fundamentals"
title: "Security Fundamentals"
concepts:
  - cia-triad
  - threat-modeling
  - attack-surface
  - defense-in-depth
why: "Before writing secure code or testing for vulnerabilities, you need to understand the core principles that guide every security decision -- confidentiality, integrity, and availability."
prerequisites:
  - 06-complete-game
sources:
  - repo: "OWASP/CheatSheetSeries"
    section: "Threat Modeling Cheat Sheet"
    license: "CC BY-SA 4.0"
  - repo: "NIST/SP800-53"
    section: "Security and Privacy Controls"
    license: "Public Domain"
---

# Security Fundamentals

Cybersecurity is the practice of protecting systems, networks, and data from unauthorized access, damage, or disruption. Before diving into tools and techniques, you need to understand the foundational principles that guide every security decision.

## The CIA Triad

The three pillars of information security are:

- **Confidentiality**: Only authorized people can access the data
- **Integrity**: Data hasn't been tampered with or corrupted
- **Availability**: Systems and data are accessible when needed

Every security measure protects one or more of these properties. A password protects confidentiality. A checksum protects integrity. A backup protects availability.

```python
# Modeling the CIA triad as a simple assessment
def assess_risk(asset, threats):
    """Evaluate which CIA properties a threat targets."""
    cia = {"confidentiality": [], "integrity": [], "availability": []}
    for threat in threats:
        for prop in threat["targets"]:
            cia[prop].append(threat["name"])
    return cia

threats = [
    {"name": "data breach", "targets": ["confidentiality"]},
    {"name": "ransomware", "targets": ["availability", "integrity"]},
    {"name": "DDoS attack", "targets": ["availability"]},
]

risk = assess_risk("web server", threats)
for prop, items in risk.items():
    print(f"{prop}: {items}")
```

Output:
```
confidentiality: ['data breach']
integrity: ['ransomware']
availability: ['ransomware', 'DDoS attack']
```

## Threat Modeling

Threat modeling is a structured approach to identifying and prioritizing potential threats. The STRIDE framework categorizes threats into six types:

| Category | Threat | CIA Property |
|----------|--------|-------------|
| **S**poofing | Pretending to be someone else | Confidentiality |
| **T**ampering | Modifying data | Integrity |
| **R**epudiation | Denying actions | Integrity |
| **I**nformation disclosure | Exposing data | Confidentiality |
| **D**enial of service | Disrupting access | Availability |
| **E**levation of privilege | Gaining unauthorized access | Confidentiality |

```python
STRIDE = {
    "Spoofing": "Can an attacker impersonate a user?",
    "Tampering": "Can data be modified in transit or at rest?",
    "Repudiation": "Can a user deny performing an action?",
    "Information Disclosure": "Can sensitive data leak?",
    "Denial of Service": "Can the service be made unavailable?",
    "Elevation of Privilege": "Can a user gain admin rights?",
}

def threat_model(component):
    """Run a basic STRIDE analysis on a component."""
    print(f"Threat model for: {component}")
    for category, question in STRIDE.items():
        print(f"  [{category[0]}] {question}")
```

## Attack Surface

The attack surface is the sum of all points where an attacker could try to enter or extract data. Reducing the attack surface is a core security strategy.

```python
def calculate_attack_surface(system):
    """Estimate attack surface from open ports, endpoints, and users."""
    score = 0
    score += len(system.get("open_ports", [])) * 3
    score += len(system.get("api_endpoints", [])) * 2
    score += len(system.get("user_roles", [])) * 1
    return score

server = {
    "open_ports": [22, 80, 443, 3306],
    "api_endpoints": ["/login", "/api/users", "/api/admin", "/upload"],
    "user_roles": ["admin", "editor", "viewer"],
}
print(f"Attack surface score: {calculate_attack_surface(server)}")
# Attack surface score: 23
```

## Defense in Depth

Never rely on a single security measure. Layer your defenses so that if one fails, others still protect the system:

1. **Physical** -- locked server rooms, badge access
2. **Network** -- firewalls, intrusion detection
3. **Application** -- input validation, authentication
4. **Data** -- encryption, access controls

## The Principle of Least Privilege

Every user, process, and program should have only the minimum permissions needed to do its job. This limits the damage from any single compromise.

```python
PERMISSIONS = {
    "admin": {"read", "write", "delete", "manage_users"},
    "editor": {"read", "write"},
    "viewer": {"read"},
}

def check_permission(role, action):
    allowed = PERMISSIONS.get(role, set())
    if action in allowed:
        return True
    print(f"DENIED: {role} cannot {action}")
    return False

check_permission("viewer", "delete")  # DENIED: viewer cannot delete
check_permission("admin", "delete")   # True
```

## Common Mistakes

**Security through obscurity**: Hiding how a system works is not a substitute for real security measures. Assume attackers know your design.

**Ignoring availability**: Security isn't only about keeping data secret. If your service goes down, that's a security failure too.

**Over-permissioning**: Giving users admin access "because it's easier" violates least privilege and massively increases risk.

## Key Takeaways

- The CIA triad (confidentiality, integrity, availability) guides all security decisions
- Threat modeling (STRIDE) helps you systematically identify vulnerabilities
- Reducing attack surface means fewer entry points for attackers
- Defense in depth layers multiple protections so no single failure is catastrophic
- Least privilege limits the blast radius of any compromise

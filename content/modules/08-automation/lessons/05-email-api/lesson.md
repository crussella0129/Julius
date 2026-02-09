---
id: "05-email-api"
title: "APIs and Email Automation"
concepts:
  - requests-library
  - rest-api
  - json-handling
  - email-automation
why: "Most modern automation involves talking to web services or sending notifications. The requests library makes API calls simple, and Python's email modules let you send automated messages."
prerequisites:
  - 04-scheduling
sources:
  - repo: "Asabeneh/30-Days-Of-Python"
    section: "Day 21 - Classes and Objects"
    license: "MIT"
  - repo: "sweigart/automate-the-boring-stuff"
    section: "Chapter 18 - Sending Email"
    license: "CC BY-NC-SA 3.0"
---

# APIs and Email Automation

APIs (Application Programming Interfaces) let your Python scripts communicate with web services. Combined with email, you can build powerful notification and data-gathering automations.

## What Is a REST API?

A REST API is a web service you interact with using HTTP methods:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve data | Get weather forecast |
| POST | Send data | Create a new user |
| PUT | Update data | Update a profile |
| DELETE | Remove data | Delete a post |

## Making API Requests with `requests`

```python
import requests

response = requests.get("https://api.github.com/users/python")
print(response.status_code)  # 200
print(response.json()["name"])  # Python
```

## Understanding the Response

```python
import requests

response = requests.get("https://api.github.com/users/python")

# Status code
print(response.status_code)  # 200 = OK, 404 = Not Found

# Headers
print(response.headers["content-type"])  # application/json

# Raw text
print(response.text[:100])

# Parsed JSON (most APIs return JSON)
data = response.json()
print(type(data))  # <class 'dict'>
```

## Sending Data with POST

```python
import requests

data = {"title": "New Post", "body": "Hello!", "userId": 1}
response = requests.post(
    "https://jsonplaceholder.typicode.com/posts",
    json=data
)
print(response.status_code)  # 201 (Created)
print(response.json()["id"])  # 101
```

## Query Parameters

```python
import requests

params = {"q": "python", "sort": "stars"}
response = requests.get(
    "https://api.github.com/search/repositories",
    params=params
)
data = response.json()
print(f"Found {data['total_count']} repositories")
```

## Error Handling for APIs

```python
import requests

try:
    response = requests.get("https://api.example.com/data", timeout=10)
    response.raise_for_status()  # Raises exception for 4xx/5xx
    data = response.json()
except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e}")
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
```

## Working with JSON Data

```python
import json

# Python dict to JSON string
data = {"name": "Alice", "scores": [95, 87, 92]}
json_str = json.dumps(data, indent=2)
print(json_str)

# JSON string to Python dict
parsed = json.loads(json_str)
print(parsed["name"])  # Alice

# Read/write JSON files
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

with open("data.json") as f:
    loaded = json.load(f)
```

## Sending Email with `smtplib`

```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText("This is the email body.")
msg["Subject"] = "Automated Report"
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"

# Connect to SMTP server (example with Gmail)
with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login("sender@example.com", "app_password")
    server.send_message(msg)
```

## Building a Simple API Client

```python
import requests

class WeatherClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"

    def get_weather(self, city):
        params = {"q": city, "appid": self.api_key, "units": "metric"}
        response = requests.get(f"{self.base_url}/weather", params=params)
        response.raise_for_status()
        data = response.json()
        return {
            "city": data["name"],
            "temp": data["main"]["temp"],
            "description": data["weather"][0]["description"]
        }
```

## Common Mistakes

**Not checking status codes:**
```python
response = requests.get(url)
data = response.json()  # Might fail if status is 404 or 500!

# Better
response = requests.get(url)
response.raise_for_status()
data = response.json()
```

**Hardcoding API keys:**
```python
# Bad
api_key = "sk-12345secret"

# Better — use environment variables
import os
api_key = os.environ.get("API_KEY")
```

## Key Takeaways

- Use `requests.get()` and `requests.post()` for API calls
- Always check `response.status_code` or use `raise_for_status()`
- Parse JSON responses with `response.json()`
- Use `json.dumps()` and `json.loads()` for JSON string conversion
- Store API keys in environment variables, never in source code
- Set timeouts on requests to avoid hanging forever

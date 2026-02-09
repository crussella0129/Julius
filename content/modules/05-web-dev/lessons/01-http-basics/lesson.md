---
id: "01-http-basics"
title: "HTTP Basics"
concepts:
  - http-methods
  - request-response
  - status-codes
  - urls
why: "Every web application communicates over HTTP -- understanding requests and responses is the foundation of all web development."
prerequisites:
  - 10-dynamic-programming
sources:
  - repo: "pallets/flask"
    section: "Quickstart"
    license: "BSD-3-Clause"
---

# HTTP Basics

The web runs on HTTP (HyperText Transfer Protocol). Every time you visit a website, your browser sends an HTTP **request** to a server, which sends back an HTTP **response**. Understanding this exchange is essential before building web applications.

## The Request-Response Cycle

When you type a URL into your browser, here is what happens:

1. Your browser creates an HTTP **request** with a method, URL, and headers
2. The request travels over the network to a server
3. The server processes the request and builds a **response**
4. The response (with a status code, headers, and body) travels back to your browser
5. Your browser renders the response body (usually HTML)

Python's `requests` library lets you make HTTP requests from code:

```python
import requests

response = requests.get("https://httpbin.org/get")
print(response.status_code)  # 200
print(response.headers["Content-Type"])  # application/json
print(response.json())  # parsed JSON body
```

## HTTP Methods

HTTP defines several methods (also called verbs) that indicate the desired action:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve data | Loading a web page |
| POST | Submit data | Submitting a form |
| PUT | Replace a resource | Updating a profile |
| DELETE | Remove a resource | Deleting an account |
| PATCH | Partially update | Changing a password |

```python
# GET request -- retrieve data
response = requests.get("https://httpbin.org/get")

# POST request -- send data
response = requests.post("https://httpbin.org/post", json={"name": "Alice"})

# PUT request -- replace data
response = requests.put("https://httpbin.org/put", json={"name": "Bob"})

# DELETE request -- remove data
response = requests.delete("https://httpbin.org/delete")
```

## Status Codes

Every response includes a numeric status code indicating the result:

- **2xx Success**: `200 OK`, `201 Created`, `204 No Content`
- **3xx Redirect**: `301 Moved Permanently`, `304 Not Modified`
- **4xx Client Error**: `400 Bad Request`, `403 Forbidden`, `404 Not Found`
- **5xx Server Error**: `500 Internal Server Error`, `503 Service Unavailable`

```python
response = requests.get("https://httpbin.org/status/404")
print(response.status_code)  # 404
print(response.ok)  # False (only True for 2xx)
```

## URLs and Query Parameters

A URL has several parts: scheme, host, path, and optional query string.

```
https://example.com/search?q=python&page=2
|_____|  |_________|  |___| |______________|
scheme     host       path   query string
```

You can pass query parameters as a dictionary:

```python
params = {"q": "python", "page": 2}
response = requests.get("https://httpbin.org/get", params=params)
print(response.url)  # https://httpbin.org/get?q=python&page=2
```

## Headers

Headers carry metadata about the request or response:

```python
headers = {"Authorization": "Bearer mytoken123"}
response = requests.get("https://httpbin.org/headers", headers=headers)
```

Common headers include `Content-Type`, `Authorization`, `User-Agent`, and `Accept`.

## Working with JSON

Most modern APIs use JSON for data exchange. The `requests` library handles this neatly:

```python
# Sending JSON
response = requests.post(
    "https://httpbin.org/post",
    json={"username": "alice", "score": 95}
)

# Receiving JSON
data = response.json()
print(data["json"]["username"])  # alice
```

## Key Takeaways

- HTTP is the protocol that powers the web: request in, response out
- GET retrieves data, POST submits data, PUT replaces, DELETE removes
- Status codes tell you if a request succeeded (2xx) or failed (4xx, 5xx)
- The `requests` library makes HTTP easy in Python
- JSON is the standard data format for web APIs

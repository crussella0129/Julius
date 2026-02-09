---
id: "05-fastapi-intro"
title: "FastAPI Introduction"
concepts:
  - fastapi-app
  - type-hints
  - pydantic-models
  - async-endpoints
why: "FastAPI is the fastest-growing Python web framework -- its automatic validation and documentation make building APIs dramatically faster."
prerequisites:
  - 04-flask-database
sources:
  - repo: "fastapi/fastapi"
    section: "Tutorial - First Steps"
    license: "MIT"
---

# FastAPI Introduction

FastAPI is a modern Python web framework designed for building APIs. It uses Python type hints to automatically validate data, generate documentation, and provide editor autocompletion.

## Your First FastAPI App

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
```

Run it with `uvicorn main:app --reload`. Visit `http://localhost:8000` to see the JSON response. FastAPI automatically returns dictionaries as JSON.

## Automatic API Documentation

FastAPI generates interactive documentation for free:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These are generated from your code's type hints and docstrings.

## Path Parameters

Like Flask, FastAPI supports dynamic path parameters, but with type validation:

```python
@app.get("/users/{user_id}")
def read_user(user_id: int):
    return {"user_id": user_id}
```

If someone requests `/users/abc`, FastAPI automatically returns a 422 error because `abc` is not an integer. No manual validation needed.

## Query Parameters

Parameters not in the path are treated as query parameters:

```python
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

Request `/items?skip=5&limit=20` and FastAPI converts and validates the values.

## Request Bodies with Pydantic

Pydantic models define the shape of request data with automatic validation:

```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    age: int

@app.post("/users")
def create_user(user: UserCreate):
    return {"name": user.name, "email": user.email, "age": user.age}
```

If the client sends `{"name": "Alice", "age": "not_a_number"}`, FastAPI returns a clear error message listing exactly what went wrong.

## Pydantic Validation

Pydantic models support rich validation:

```python
from pydantic import BaseModel, Field, EmailStr

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    age: int = Field(ge=0, le=150)
```

## Response Models

Control what gets returned in the response:

```python
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    # password is excluded from response
    return {"id": 1, "name": user.name, "email": user.email}
```

## Async Support

FastAPI supports async endpoints for better performance with I/O-bound tasks:

```python
@app.get("/async-items")
async def read_items():
    # Can use await for database queries, HTTP calls, etc.
    return {"items": ["item1", "item2"]}
```

Use `async def` when your handler needs to `await` something. Use regular `def` otherwise -- FastAPI handles both correctly.

## Comparison with Flask

| Feature | Flask | FastAPI |
|---------|-------|---------|
| Return format | Strings/HTML | JSON by default |
| Validation | Manual | Automatic via types |
| Documentation | Manual | Auto-generated |
| Async | Limited | Built-in |
| Use case | Web apps + APIs | APIs primarily |

## Key Takeaways

- FastAPI uses Python type hints for automatic validation and documentation
- Path parameters are validated against their type annotations
- Pydantic models define and validate request/response data structures
- Interactive documentation is generated automatically at `/docs`
- Both sync and async endpoints are supported

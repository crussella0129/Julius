---
id: "06-rest-api"
title: "REST API Design"
concepts:
  - rest-principles
  - crud-endpoints
  - json-responses
  - http-status-codes
why: "REST is the dominant architectural style for web APIs -- knowing how to design clean, predictable APIs is a core backend skill."
prerequisites:
  - 05-fastapi-intro
sources:
  - repo: "fastapi/fastapi"
    section: "Tutorial - Path Operation"
    license: "MIT"
---

# REST API Design

REST (Representational State Transfer) is a set of conventions for designing web APIs. A well-designed REST API uses standard HTTP methods, meaningful URLs, and consistent response formats to make APIs predictable and easy to use.

## REST Principles

1. **Resources** are the nouns (users, posts, products), identified by URLs
2. **HTTP methods** are the verbs (GET, POST, PUT, DELETE)
3. **Representations** are the data format (usually JSON)
4. **Stateless** -- each request contains all information needed to process it

## Resource URLs

Good REST URLs are noun-based and hierarchical:

```
GET    /users          -- list all users
POST   /users          -- create a new user
GET    /users/42       -- get user 42
PUT    /users/42       -- update user 42
DELETE /users/42       -- delete user 42
GET    /users/42/posts -- list posts by user 42
```

Avoid verbs in URLs: use `POST /users` not `POST /create-user`.

## Building a REST API with FastAPI

Here is a complete CRUD API for a todo list:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class TodoCreate(BaseModel):
    title: str
    done: bool = False

class Todo(TodoCreate):
    id: int

todos: dict[int, Todo] = {}
next_id = 1

@app.get("/todos")
def list_todos():
    return list(todos.values())

@app.post("/todos", status_code=201)
def create_todo(todo: TodoCreate):
    global next_id
    new_todo = Todo(id=next_id, **todo.model_dump())
    todos[next_id] = new_todo
    next_id += 1
    return new_todo

@app.get("/todos/{todo_id}")
def read_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos[todo_id]

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoCreate):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    updated = Todo(id=todo_id, **todo.model_dump())
    todos[todo_id] = updated
    return updated

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    if todo_id not in todos:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos[todo_id]
```

## Status Codes in APIs

Use the right status code for each operation:

| Operation | Success Code | Meaning |
|-----------|-------------|---------|
| GET | 200 | OK, here is the data |
| POST | 201 | Created successfully |
| PUT | 200 | Updated successfully |
| DELETE | 204 | Deleted, no content to return |
| Not found | 404 | Resource does not exist |
| Bad input | 422 | Validation error |

## Error Handling

Return consistent error responses:

```python
from fastapi import HTTPException

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return users_db[user_id]
```

## Pagination

For large collections, support pagination with query parameters:

```python
@app.get("/items")
def list_items(page: int = 1, per_page: int = 20):
    start = (page - 1) * per_page
    end = start + per_page
    all_items = list(items_db.values())
    return {
        "items": all_items[start:end],
        "total": len(all_items),
        "page": page,
        "per_page": per_page,
    }
```

## Filtering and Sorting

Allow clients to narrow results:

```python
@app.get("/todos")
def list_todos(done: bool = None, sort_by: str = "id"):
    result = list(todos.values())
    if done is not None:
        result = [t for t in result if t.done == done]
    result.sort(key=lambda t: getattr(t, sort_by, t.id))
    return result
```

## Key Takeaways

- REST maps CRUD operations to HTTP methods on resource URLs
- Use nouns for URLs, HTTP methods for actions
- Return appropriate status codes (201 for create, 204 for delete, 404 for not found)
- Handle errors with clear, consistent error responses
- Support pagination for list endpoints

---
id: "04-flask-database"
title: "Flask with Databases"
concepts:
  - sqlite
  - sql-queries
  - flask-sqlalchemy
  - orm
why: "Almost every web application needs to store and retrieve data -- databases are the backbone of persistent web applications."
prerequisites:
  - 03-flask-forms
sources:
  - repo: "pallets/flask"
    section: "Tutorial - Database"
    license: "BSD-3-Clause"
---

# Flask with Databases

Web applications need to persist data between requests. SQLite is a file-based database that comes with Python, and SQLAlchemy is a powerful toolkit that lets you work with databases using Python objects instead of raw SQL.

## SQLite with Python

Python includes the `sqlite3` module for working with SQLite databases directly:

```python
import sqlite3

conn = sqlite3.connect("app.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
""")

cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
               ("Alice", "alice@example.com"))
conn.commit()

cursor.execute("SELECT * FROM users")
for row in cursor.fetchall():
    print(row)

conn.close()
```

Always use `?` placeholders instead of f-strings to prevent SQL injection attacks.

## Flask-SQLAlchemy

Flask-SQLAlchemy integrates SQLAlchemy with Flask, providing an ORM (Object-Relational Mapper) that lets you work with database rows as Python objects:

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
db = SQLAlchemy(app)
```

## Defining Models

A model is a Python class that maps to a database table:

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f"<User {self.name}>"
```

Create the tables:

```python
with app.app_context():
    db.create_all()
```

## CRUD Operations

**Create** -- add new records:

```python
user = User(name="Alice", email="alice@example.com")
db.session.add(user)
db.session.commit()
```

**Read** -- query records:

```python
# Get all users
users = User.query.all()

# Get one user by ID
user = User.query.get(1)

# Filter users
admins = User.query.filter_by(name="Alice").all()
first_admin = User.query.filter_by(name="Alice").first()

# More complex filters
users = User.query.filter(User.name.like("%ali%")).all()
```

**Update** -- modify existing records:

```python
user = User.query.get(1)
user.name = "Alicia"
db.session.commit()
```

**Delete** -- remove records:

```python
user = User.query.get(1)
db.session.delete(user)
db.session.commit()
```

## Using Models in Routes

Combine models with routes to build a complete application:

```python
@app.route("/users")
def list_users():
    users = User.query.all()
    return render_template("users.html", users=users)

@app.route("/users/new", methods=["GET", "POST"])
def create_user():
    if request.method == "POST":
        user = User(
            name=request.form["name"],
            email=request.form["email"]
        )
        db.session.add(user)
        db.session.commit()
        return redirect(url_for("list_users"))
    return render_template("new_user.html")
```

## Relationships

Models can reference each other through relationships:

```python
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    author = db.relationship("User", backref="posts")
```

Now you can do `user.posts` to get all posts by a user, or `post.author` to get the post's author.

## Key Takeaways

- SQLite comes with Python and stores data in a single file
- Always use parameterized queries (`?`) to prevent SQL injection
- Flask-SQLAlchemy maps Python classes to database tables (ORM)
- CRUD operations: create with `add()`, read with `query`, update attributes, delete with `delete()`
- Relationships link models together with foreign keys

---
id: "02-flask-intro"
title: "Flask Introduction"
concepts:
  - flask-app
  - routes
  - templates
  - jinja2
why: "Flask is the most popular lightweight Python web framework -- it lets you go from zero to a working web app in minutes."
prerequisites:
  - 01-http-basics
sources:
  - repo: "pallets/flask"
    section: "Quickstart"
    license: "BSD-3-Clause"
---

# Flask Introduction

Flask is a micro web framework for Python. "Micro" means it provides the essentials -- routing, request handling, and templating -- without imposing a rigid structure. You add what you need, when you need it.

## Your First Flask App

A minimal Flask application fits in a single file:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, World!"

if __name__ == "__main__":
    app.run(debug=True)
```

Save this as `app.py` and run it with `python3 app.py`. Visit `http://localhost:5000` in your browser and you will see "Hello, World!".

## How It Works

1. `Flask(__name__)` creates the application instance. `__name__` tells Flask where to find resources.
2. `@app.route("/")` is a **decorator** that registers the function below it as a handler for the URL path `/`.
3. The function returns a string, which Flask sends back as the HTTP response body.
4. `app.run(debug=True)` starts a development server with auto-reload.

## Multiple Routes

You can define as many routes as you need:

```python
@app.route("/")
def home():
    return "<h1>Home Page</h1>"

@app.route("/about")
def about():
    return "<h1>About Us</h1>"

@app.route("/contact")
def contact():
    return "<h1>Contact</h1>"
```

## Dynamic Routes

Routes can include variable parts, captured as function parameters:

```python
@app.route("/user/<username>")
def profile(username):
    return f"<h1>Profile: {username}</h1>"

@app.route("/post/<int:post_id>")
def show_post(post_id):
    return f"<h1>Post #{post_id}</h1>"
```

The `<int:post_id>` converter ensures `post_id` is an integer. Other converters include `float`, `path`, and `string` (default).

## Templates with Jinja2

Returning raw HTML strings gets messy fast. Flask includes Jinja2 for templating. Create a `templates/` folder and put HTML files there:

```python
from flask import render_template

@app.route("/hello/<name>")
def hello(name):
    return render_template("hello.html", name=name)
```

In `templates/hello.html`:

```html
<!DOCTYPE html>
<html>
<body>
    <h1>Hello, {{ name }}!</h1>
    {% if name == "Admin" %}
        <p>Welcome back, administrator.</p>
    {% else %}
        <p>Welcome to our site.</p>
    {% endif %}
</body>
</html>
```

Jinja2 uses `{{ }}` for expressions and `{% %}` for control flow.

## Template Inheritance

Templates can extend a base layout:

```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
<head><title>{% block title %}My Site{% endblock %}</title></head>
<body>
    <nav><a href="/">Home</a> | <a href="/about">About</a></nav>
    {% block content %}{% endblock %}
</body>
</html>
```

```html
<!-- templates/home.html -->
{% extends "base.html" %}
{% block title %}Home{% endblock %}
{% block content %}
    <h1>Welcome!</h1>
{% endblock %}
```

## Static Files

Put CSS, JavaScript, and images in a `static/` folder. Reference them in templates:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
```

## Key Takeaways

- Flask apps start with `Flask(__name__)` and define routes with `@app.route()`
- Route functions return the HTTP response (string, HTML, or rendered template)
- Dynamic routes capture URL segments as function parameters
- Jinja2 templates keep HTML separate from Python logic
- Template inheritance avoids repeating common layout code

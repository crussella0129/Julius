---
id: "03-flask-forms"
title: "Flask Forms"
concepts:
  - html-forms
  - post-requests
  - form-validation
  - flash-messages
why: "Forms are how users interact with web applications -- handling form submission correctly is essential for any real web app."
prerequisites:
  - 02-flask-intro
sources:
  - repo: "pallets/flask"
    section: "Quickstart - HTTP Methods"
    license: "BSD-3-Clause"
---

# Flask Forms

Web applications need to collect data from users. HTML forms send data to the server, and Flask makes it easy to receive and process that data.

## HTML Forms Basics

An HTML form has an `action` (where to send data) and a `method` (how to send it):

```html
<form action="/login" method="POST">
    <label>Username: <input type="text" name="username"></label>
    <label>Password: <input type="password" name="password"></label>
    <button type="submit">Log In</button>
</form>
```

When the user clicks "Log In", the browser sends a POST request to `/login` with the form data.

## Handling Form Data in Flask

Flask provides `request.form` to access submitted form data:

```python
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username == "admin" and password == "secret":
            return f"Welcome, {username}!"
        else:
            return "Invalid credentials", 401
    return render_template("login.html")
```

Notice the `methods=["GET", "POST"]` parameter. By default, routes only accept GET. You must explicitly allow POST.

## The GET vs POST Pattern

A common pattern is to show the form on GET and process it on POST:

```python
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name", "")
        email = request.form.get("email", "")
        if not name or not email:
            error = "All fields are required"
            return render_template("register.html", error=error)
        # Process registration...
        return "Registration successful!"
    return render_template("register.html")
```

Using `request.form.get()` instead of `request.form[]` avoids a `KeyError` if the field is missing.

## Form Validation

Always validate user input on the server. Never trust the client:

```python
def validate_registration(name, email, password):
    errors = []
    if len(name) < 2:
        errors.append("Name must be at least 2 characters")
    if "@" not in email:
        errors.append("Invalid email address")
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    return errors
```

## Flash Messages

Flask has a built-in system for one-time messages (flash messages) that display after a redirect:

```python
from flask import flash, redirect, url_for, session

app.secret_key = "your-secret-key"  # Required for flash messages

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if request.form["username"] == "admin":
            flash("Login successful!", "success")
            return redirect(url_for("home"))
        flash("Invalid username.", "error")
    return render_template("login.html")
```

In the template, display flash messages:

```html
{% with messages = get_flashed_messages(with_categories=true) %}
  {% for category, message in messages %}
    <div class="alert {{ category }}">{{ message }}</div>
  {% endfor %}
{% endwith %}
```

## Redirects and url_for

After a successful POST, redirect to prevent duplicate submissions:

```python
from flask import redirect, url_for

@app.route("/submit", methods=["POST"])
def submit():
    # Process form...
    return redirect(url_for("home"))  # Redirect to the home route
```

`url_for("home")` generates the URL for the function named `home`, which is more maintainable than hardcoding paths.

## File Uploads

Flask handles file uploads through `request.files`:

```python
@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["document"]
    if file.filename != "":
        file.save(f"uploads/{file.filename}")
        return "File uploaded!"
    return "No file selected", 400
```

## Key Takeaways

- HTML forms send data via GET (in the URL) or POST (in the request body)
- `request.form` accesses submitted form data in Flask
- Always validate form data on the server side
- Use the POST-Redirect-GET pattern to prevent duplicate submissions
- Flash messages provide one-time feedback to users after redirects

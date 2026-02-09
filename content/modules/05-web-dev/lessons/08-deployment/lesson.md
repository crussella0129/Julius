---
id: "08-deployment"
title: "Deployment"
concepts:
  - wsgi-asgi
  - environment-variables
  - docker-basics
  - production-config
why: "Building an app locally is only half the job -- deployment is how you make it available to the world."
prerequisites:
  - 07-web-scraping
sources:
  - repo: "pallets/flask"
    section: "Deploying to Production"
    license: "BSD-3-Clause"
  - repo: "fastapi/fastapi"
    section: "Deployment"
    license: "MIT"
---

# Deployment

Deploying a web application means moving it from your development machine to a server where users can access it. This lesson covers the key concepts and tools for deploying Python web applications.

## Development vs Production

The Flask/FastAPI development servers are not suitable for production:

```python
# Development only -- do NOT use in production
app.run(debug=True)
```

Production requires a proper application server that handles multiple concurrent requests, worker management, and graceful restarts.

## WSGI and ASGI

**WSGI** (Web Server Gateway Interface) is the standard for synchronous Python web apps (Flask):

```bash
pip install gunicorn
gunicorn app:app --workers 4 --bind 0.0.0.0:8000
```

**ASGI** (Asynchronous Server Gateway Interface) is for async apps (FastAPI):

```bash
pip install uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Environment Variables

Never hardcode secrets. Use environment variables:

```python
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
SECRET_KEY = os.environ["SECRET_KEY"]  # Fails if not set
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
```

Use a `.env` file for local development with `python-dotenv`:

```python
from dotenv import load_dotenv
load_dotenv()  # Loads .env file into os.environ
```

Example `.env` file:

```
DATABASE_URL=postgresql://user:pass@localhost/mydb
SECRET_KEY=my-secret-key-here
DEBUG=true
```

Always add `.env` to `.gitignore`.

## Configuration Patterns

Separate configuration by environment:

```python
import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]

configs = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
```

## Docker Basics

Docker packages your app with its dependencies into a container:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

Build and run:

```bash
docker build -t myapp .
docker run -p 8000:8000 -e SECRET_KEY=mysecret myapp
```

## Requirements File

Pin your dependencies for reproducibility:

```bash
pip freeze > requirements.txt
```

Or use a curated `requirements.txt`:

```
flask==3.0.0
gunicorn==21.2.0
python-dotenv==1.0.0
```

## Health Checks

Add a health check endpoint for monitoring:

```python
@app.route("/health")
def health():
    return {"status": "healthy"}, 200
```

## Logging in Production

Configure proper logging instead of `print()`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

@app.route("/")
def home():
    logger.info("Home page accessed")
    return "Hello!"
```

## Deployment Checklist

1. Set `DEBUG = False`
2. Use a production WSGI/ASGI server (Gunicorn, Uvicorn)
3. Set a strong `SECRET_KEY` via environment variable
4. Use a production database (PostgreSQL, MySQL)
5. Serve static files via a CDN or reverse proxy (Nginx)
6. Enable HTTPS
7. Set up logging and monitoring
8. Add health check endpoints

## Key Takeaways

- Never use development servers in production -- use Gunicorn or Uvicorn
- Store secrets in environment variables, never in code
- Docker containers package your app with all dependencies
- Separate configuration for development and production environments
- Always have a deployment checklist to avoid common mistakes

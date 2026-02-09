---
id: "06-ci-cd"
title: "CI/CD with GitHub Actions"
concepts:
  - continuous-integration
  - github-actions
  - workflow-yaml
  - automated-pipeline
why: "Continuous Integration automatically runs tests on every code change. GitHub Actions makes this free and easy, catching bugs before they reach the main branch."
prerequisites:
  - 05-code-quality
sources:
  - repo: "pytest-dev/pytest"
    section: "CI Integration"
    license: "MIT"
  - repo: "microsoft/python-type-stubs"
    section: "GitHub Actions"
    license: "MIT"
---

# CI/CD with GitHub Actions

Continuous Integration (CI) means automatically testing code every time someone pushes a change. Continuous Deployment (CD) extends this to automatically deploying code that passes tests. GitHub Actions provides free CI/CD for any GitHub repository.

## What Is CI?

Without CI:
1. Developer writes code
2. Developer runs tests locally (maybe)
3. Developer pushes code
4. Tests might be broken, nobody notices

With CI:
1. Developer pushes code
2. CI server automatically runs all tests
3. If tests fail, the developer is notified immediately
4. Pull requests show test status before merging

## GitHub Actions Basics

GitHub Actions uses YAML files in `.github/workflows/` to define pipelines:

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest
```

## Understanding the Workflow File

**`name`**: Display name for the workflow.

**`on`**: Events that trigger the workflow:
```yaml
on:
  push:
    branches: [main]      # Run on push to main
  pull_request:
    branches: [main]      # Run on PRs targeting main
  schedule:
    - cron: "0 0 * * *"   # Run daily at midnight
```

**`jobs`**: The actual work to perform:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest  # Virtual machine to use
    steps:
      - uses: actions/checkout@v4     # Check out your code
      - run: echo "Hello from CI!"    # Run a shell command
```

## A Complete Python CI Workflow

```yaml
name: Python CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run linter
        run: flake8 src/

      - name: Run type checker
        run: mypy src/

      - name: Run tests
        run: pytest --verbose
```

This runs tests on three Python versions in parallel.

## Matrix Testing

Test across multiple configurations:

```yaml
strategy:
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

This creates 9 combinations (3 Python versions x 3 operating systems).

## Environment Variables and Secrets

```yaml
steps:
  - name: Run tests
    env:
      DATABASE_URL: sqlite:///test.db
      API_KEY: ${{ secrets.API_KEY }}
    run: pytest
```

Secrets are stored in repository settings, not in the YAML file.

## Caching Dependencies

Speed up workflows by caching pip downloads:

```yaml
steps:
  - uses: actions/setup-python@v5
    with:
      python-version: "3.12"
      cache: "pip"
  - run: pip install -r requirements.txt
```

## Status Badges

Add a badge to your README showing test status:

```markdown
![Tests](https://github.com/user/repo/actions/workflows/tests.yml/badge.svg)
```

## Writing a `requirements.txt`

```
pytest>=7.0
flake8>=6.0
mypy>=1.0
black>=24.0
```

Or use `pyproject.toml`:
```toml
[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "flake8>=6.0",
    "mypy>=1.0",
    "black>=24.0",
]
```

## A Minimal CD Pipeline

Deploy after tests pass:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest

  deploy:
    needs: test  # Only runs after test job passes
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
```

## Common Mistakes

**Not pinning dependency versions:**
```yaml
# Bad — might break when a library updates
- run: pip install pytest

# Good — reproducible
- run: pip install pytest==7.4.0
```

**Forgetting to install dependencies before running tests:**
```yaml
# This will fail — pytest is not installed
- run: pytest
```

## Key Takeaways

- CI automatically runs tests on every push and pull request
- GitHub Actions workflows are YAML files in `.github/workflows/`
- Use matrix strategy to test across Python versions and platforms
- Cache dependencies to speed up workflows
- Store secrets in GitHub settings, not in workflow files
- CD deploys automatically after CI tests pass

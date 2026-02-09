---
id: "07-web-scraping"
title: "Web Scraping"
concepts:
  - beautifulsoup
  - html-parsing
  - css-selectors
  - scraping-ethics
why: "Web scraping lets you extract structured data from websites -- a key skill for data collection, monitoring, and automation."
prerequisites:
  - 06-rest-api
sources:
  - repo: "pallets/flask"
    section: "Testing"
    license: "BSD-3-Clause"
---

# Web Scraping

Web scraping is the process of extracting data from web pages programmatically. Python's `requests` library fetches the HTML, and Beautiful Soup parses it into a navigable structure.

## Getting Started

Install the libraries:

```bash
pip install requests beautifulsoup4
```

A basic scraping workflow:

```python
import requests
from bs4 import BeautifulSoup

response = requests.get("https://example.com")
soup = BeautifulSoup(response.text, "html.parser")
print(soup.title.text)
```

## Understanding HTML Structure

HTML is a tree of nested elements. Scraping means navigating this tree to find the data you want:

```html
<html>
  <body>
    <h1>News</h1>
    <div class="articles">
      <div class="article">
        <h2>First Article</h2>
        <p class="summary">Summary text here.</p>
      </div>
      <div class="article">
        <h2>Second Article</h2>
        <p class="summary">Another summary.</p>
      </div>
    </div>
  </body>
</html>
```

## Finding Elements

Beautiful Soup provides several ways to find elements:

```python
# Find the first matching element
title = soup.find("h1")
print(title.text)  # "News"

# Find all matching elements
articles = soup.find_all("div", class_="article")
for article in articles:
    heading = article.find("h2").text
    summary = article.find("p", class_="summary").text
    print(f"{heading}: {summary}")
```

## CSS Selectors

The `select()` method supports CSS selectors for more precise targeting:

```python
# Select by class
summaries = soup.select(".summary")

# Select nested elements
headings = soup.select(".article h2")

# Select by attribute
links = soup.select("a[href]")

# Select by ID
header = soup.select_one("#main-header")
```

`select()` returns a list; `select_one()` returns the first match.

## Extracting Data

Get text content and attributes from elements:

```python
# Get text content
element = soup.find("h1")
print(element.text)       # "News"
print(element.string)     # "News" (direct text only)
print(element.get_text(strip=True))  # "News" (stripped whitespace)

# Get attributes
link = soup.find("a")
print(link["href"])       # the URL
print(link.get("href"))   # same, but returns None if missing
```

## Navigating the Tree

Move between elements:

```python
# Parent
element.parent

# Children (direct)
for child in element.children:
    print(child)

# Siblings
element.next_sibling
element.previous_sibling

# Find parent matching a condition
element.find_parent("div", class_="container")
```

## Building a Scraper

Here is a complete example that extracts structured data:

```python
import requests
from bs4 import BeautifulSoup

def scrape_quotes(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    quotes = []
    for div in soup.select(".quote"):
        text = div.select_one(".text").get_text(strip=True)
        author = div.select_one(".author").get_text(strip=True)
        tags = [tag.text for tag in div.select(".tag")]
        quotes.append({"text": text, "author": author, "tags": tags})

    return quotes
```

## Handling Common Issues

**Encoding**: Specify encoding if needed:
```python
response.encoding = "utf-8"
```

**Missing elements**: Always check before accessing:
```python
elem = soup.find("h2")
text = elem.text if elem else "Not found"
```

**Rate limiting**: Be polite to servers:
```python
import time
time.sleep(1)  # Wait between requests
```

## Ethics of Web Scraping

- Check the site's `robots.txt` for scraping rules
- Respect rate limits -- do not overwhelm servers
- Check the Terms of Service before scraping
- Use official APIs when available
- Do not scrape personal data without consent

## Key Takeaways

- Beautiful Soup parses HTML into a searchable tree structure
- Use `find()` and `find_all()` for simple searches, `select()` for CSS selectors
- Extract text with `.text` and attributes with `["attr"]` or `.get("attr")`
- Always handle missing elements gracefully
- Respect websites' rules and rate limits when scraping

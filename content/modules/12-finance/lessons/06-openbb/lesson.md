---
id: "06-openbb"
title: "OpenBB Terminal"
concepts:
  - openbb-platform
  - financial-apis
  - data-pipeline
  - research-workflow
why: "OpenBB is an open-source financial research platform that aggregates data from dozens of providers -- it's the professional-grade tool for Python-based financial analysis."
prerequisites:
  - 05-backtesting
sources:
  - repo: "OpenBB-finance/OpenBB"
    section: "Platform Documentation"
    license: "AGPL-3.0"
  - repo: "ranaroussi/yfinance"
    section: "API Reference"
    license: "Apache-2.0"
---

# OpenBB Terminal

OpenBB is an open-source investment research platform built in Python. It provides a unified interface to access financial data from multiple providers, making it easier to analyze stocks, crypto, forex, economics, and more without juggling dozens of APIs.

## What is OpenBB?

OpenBB aggregates data from multiple sources into a consistent Python interface:

```python
# In a real OpenBB setup:
# from openbb import obb
#
# # Get stock price data
# data = obb.equity.price.historical("AAPL", provider="yfinance")
#
# # Get fundamental data
# income = obb.equity.fundamental.income("AAPL", provider="fmp")
#
# # Get economic indicators
# gdp = obb.economy.gdp.nominal(provider="oecd")
```

For learning, we'll build similar patterns using standard Python:

```python
def create_data_provider(name):
    """Simulate a financial data provider interface."""
    providers = {
        "yfinance": {"type": "market_data", "rate_limit": 2000},
        "fmp": {"type": "fundamentals", "rate_limit": 250},
        "fred": {"type": "economics", "rate_limit": 120},
    }
    return providers.get(name, {"type": "unknown", "rate_limit": 0})

for name in ["yfinance", "fmp", "fred"]:
    info = create_data_provider(name)
    print(f"{name}: {info['type']} (limit: {info['rate_limit']}/day)")
```

## Building a Data Pipeline

Professional financial analysis chains multiple data operations:

```python
def fetch_prices(ticker, days=10):
    """Simulate fetching price data."""
    import random
    random.seed(hash(ticker) % 1000)
    base_price = random.uniform(50, 500)
    prices = []
    for i in range(days):
        change = random.gauss(0, 0.02)
        base_price *= (1 + change)
        prices.append(round(base_price, 2))
    return prices

def compute_returns(prices):
    """Convert prices to returns."""
    return [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]

def compute_sma(prices, period):
    """Compute SMA for a price series."""
    result = []
    for i in range(period - 1, len(prices)):
        window = prices[i - period + 1:i + 1]
        result.append(sum(window) / period)
    return result

# Pipeline: fetch -> analyze -> report
def analysis_pipeline(ticker):
    """Run a complete analysis pipeline on a ticker."""
    print(f"\n=== Analysis: {ticker} ===")
    prices = fetch_prices(ticker, 20)
    returns = compute_returns(prices)

    mean_ret = sum(returns) / len(returns)
    print(f"Latest price: ${prices[-1]:.2f}")
    print(f"Mean daily return: {mean_ret*100:.3f}%")
    print(f"Min return: {min(returns)*100:.2f}%")
    print(f"Max return: {max(returns)*100:.2f}%")

for ticker in ["AAPL", "GOOGL", "MSFT"]:
    analysis_pipeline(ticker)
```

## Screening Stocks

Filter stocks based on criteria:

```python
def screen_stocks(stocks, criteria):
    """Screen a list of stocks based on given criteria."""
    results = []
    for stock in stocks:
        passes = True
        for key, (op, value) in criteria.items():
            stock_val = stock.get(key, 0)
            if op == ">" and not stock_val > value:
                passes = False
            elif op == "<" and not stock_val < value:
                passes = False
            elif op == ">=" and not stock_val >= value:
                passes = False
        if passes:
            results.append(stock)
    return results

stocks = [
    {"ticker": "AAPL", "pe_ratio": 28, "market_cap": 2.8e12, "dividend_yield": 0.5},
    {"ticker": "T", "pe_ratio": 7, "market_cap": 1.1e11, "dividend_yield": 6.5},
    {"ticker": "NVDA", "pe_ratio": 65, "market_cap": 1.2e12, "dividend_yield": 0.04},
    {"ticker": "JNJ", "pe_ratio": 15, "market_cap": 4.0e11, "dividend_yield": 2.8},
]

# Find value stocks: P/E < 20 and dividend yield > 2%
value_criteria = {
    "pe_ratio": ("<", 20),
    "dividend_yield": (">", 2.0),
}

results = screen_stocks(stocks, value_criteria)
for s in results:
    print(f"{s['ticker']}: P/E={s['pe_ratio']}, Yield={s['dividend_yield']}%")
```

## Caching API Results

Financial APIs have rate limits. Cache results to avoid redundant calls:

```python
import json
import os
import time

class DataCache:
    def __init__(self, cache_dir="/tmp/finance_cache"):
        self.cache_dir = cache_dir
        self.ttl = 3600  # 1 hour

    def get(self, key):
        """Retrieve cached data if not expired."""
        filepath = os.path.join(self.cache_dir, f"{key}.json")
        if os.path.exists(filepath):
            mtime = os.path.getmtime(filepath)
            if time.time() - mtime < self.ttl:
                with open(filepath) as f:
                    return json.load(f)
        return None

    def set(self, key, data):
        """Cache data to disk."""
        os.makedirs(self.cache_dir, exist_ok=True)
        filepath = os.path.join(self.cache_dir, f"{key}.json")
        with open(filepath, "w") as f:
            json.dump(data, f)
```

## Building a Watchlist

```python
class Watchlist:
    def __init__(self, name):
        self.name = name
        self.tickers = []
        self.alerts = {}

    def add(self, ticker, alert_price=None):
        if ticker not in self.tickers:
            self.tickers.append(ticker)
            if alert_price:
                self.alerts[ticker] = alert_price
            print(f"Added {ticker} to '{self.name}'")

    def check_alerts(self, current_prices):
        triggered = []
        for ticker, alert in self.alerts.items():
            price = current_prices.get(ticker, 0)
            if price >= alert:
                triggered.append((ticker, price, alert))
                print(f"ALERT: {ticker} at ${price} (target: ${alert})")
        return triggered

watchlist = Watchlist("Tech Stocks")
watchlist.add("AAPL", alert_price=200)
watchlist.add("GOOGL", alert_price=180)
watchlist.check_alerts({"AAPL": 210, "GOOGL": 175})
```

## Common Mistakes

**Not handling API errors**: Financial APIs can be unreliable. Always wrap API calls in try/except.

**Ignoring rate limits**: Exceeding rate limits can get your API key banned. Implement caching and rate limiting.

**Mixing data providers**: Different providers may use different time zones, adjustments, and date conventions. Be consistent.

## Key Takeaways

- OpenBB provides a unified interface to dozens of financial data providers
- Data pipelines chain fetch, transform, and analyze steps
- Stock screeners filter based on fundamental criteria (P/E, yield, etc.)
- Caching prevents redundant API calls and respects rate limits
- Always handle API errors gracefully and validate returned data

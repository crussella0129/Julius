---
id: "01-financial-data"
title: "Working with Financial Data"
concepts:
  - ohlcv
  - yfinance
  - time-series
  - returns
why: "Financial data has unique structures -- OHLCV candles, time-indexed series, and return calculations form the foundation of all quantitative analysis."
prerequisites:
  - 06-secure-coding
sources:
  - repo: "ranaroussi/yfinance"
    section: "Quick Start"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Data Bundles"
    license: "Apache-2.0"
---

# Working with Financial Data

Financial markets generate massive amounts of data every second. Python's ecosystem makes it straightforward to download, clean, and analyze this data. The core data format is OHLCV -- Open, High, Low, Close, Volume -- which captures price action within each time period.

## OHLCV Data

Every candle (bar) on a stock chart represents one time period with five values:

- **Open**: Price at the start of the period
- **High**: Highest price during the period
- **Low**: Lowest price during the period
- **Close**: Price at the end of the period
- **Volume**: Number of shares traded

```python
# Simulating OHLCV data without external dependencies
ohlcv_data = [
    {"date": "2024-01-02", "open": 100.0, "high": 105.0, "low": 99.0, "close": 103.0, "volume": 1500000},
    {"date": "2024-01-03", "open": 103.0, "high": 107.0, "low": 102.0, "close": 106.0, "volume": 1800000},
    {"date": "2024-01-04", "open": 106.0, "high": 108.0, "low": 101.0, "close": 102.0, "volume": 2200000},
    {"date": "2024-01-05", "open": 102.0, "high": 104.0, "low": 100.0, "close": 104.0, "volume": 1600000},
]

for candle in ohlcv_data:
    change = candle["close"] - candle["open"]
    direction = "UP" if change > 0 else "DOWN"
    print(f"{candle['date']}: {direction} ({change:+.1f})")
```

Output:
```
2024-01-02: UP (+3.0)
2024-01-03: UP (+3.0)
2024-01-04: DOWN (-4.0)
2024-01-05: UP (+2.0)
```

## Downloading Data with yfinance

The `yfinance` library downloads historical market data from Yahoo Finance:

```python
# import yfinance as yf
#
# # Download historical data
# ticker = yf.Ticker("AAPL")
# df = ticker.history(period="1y")
# print(df.head())
#
# # Download multiple tickers
# data = yf.download(["AAPL", "GOOGL", "MSFT"], period="6mo")
# print(data["Close"].tail())
```

For learning purposes, we'll work with simulated data that matches the same structure.

## Calculating Returns

Returns measure the percentage change in price. There are two types:

```python
prices = [100.0, 103.0, 106.0, 102.0, 104.0]

# Simple returns: (P1 - P0) / P0
simple_returns = []
for i in range(1, len(prices)):
    ret = (prices[i] - prices[i-1]) / prices[i-1]
    simple_returns.append(ret)
    print(f"Day {i}: {ret:+.4f} ({ret*100:+.2f}%)")

print(f"\nTotal simple return: {(prices[-1]/prices[0] - 1)*100:.2f}%")
```

Output:
```
Day 1: +0.0300 (+3.00%)
Day 2: +0.0291 (+2.91%)
Day 3: -0.0377 (-3.77%)
Day 4: +0.0196 (+1.96%)

Total simple return: 4.00%
```

Log returns are preferred for mathematical analysis because they are additive:

```python
import math

prices = [100.0, 103.0, 106.0, 102.0, 104.0]

# Log returns: ln(P1 / P0)
log_returns = []
for i in range(1, len(prices)):
    ret = math.log(prices[i] / prices[i-1])
    log_returns.append(ret)

# Sum of log returns = total log return
total_log = sum(log_returns)
total_simple = math.exp(total_log) - 1
print(f"Sum of log returns: {total_log:.4f}")
print(f"Equivalent simple return: {total_simple*100:.2f}%")
```

## Summary Statistics

```python
import math

prices = [100.0, 103.0, 106.0, 102.0, 104.0, 107.0, 105.0]
returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]

mean_return = sum(returns) / len(returns)
variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
std_dev = math.sqrt(variance)

print(f"Mean daily return: {mean_return*100:.3f}%")
print(f"Daily volatility:  {std_dev*100:.3f}%")
print(f"Annualized vol:    {std_dev*math.sqrt(252)*100:.2f}%")
```

Annualized volatility is daily volatility multiplied by the square root of 252 (trading days per year).

## Working with Dates

Financial data is time-indexed. Python's `datetime` module handles date parsing and arithmetic:

```python
from datetime import datetime, timedelta

dates = ["2024-01-02", "2024-01-03", "2024-01-04"]
parsed = [datetime.strptime(d, "%Y-%m-%d") for d in dates]

# Check for trading day gaps
for i in range(1, len(parsed)):
    gap = (parsed[i] - parsed[i-1]).days
    if gap > 1:
        print(f"Gap of {gap} days between {dates[i-1]} and {dates[i]}")
    else:
        print(f"{dates[i]}: consecutive trading day")
```

## Common Mistakes

**Using raw prices for analysis**: Always convert to returns. A $1 move means very different things for a $10 stock vs a $1000 stock.

**Ignoring dividends and splits**: Adjusted close prices account for these corporate actions. Use adjusted data for accurate analysis.

**Confusing simple and log returns**: Simple returns don't add up across periods. Log returns do, but they're not directly interpretable as percentages.

## Key Takeaways

- OHLCV (Open, High, Low, Close, Volume) is the standard financial data format
- `yfinance` downloads free historical market data from Yahoo Finance
- Returns (not prices) are the basis of financial analysis
- Log returns are additive across time periods; simple returns are not
- Annualized volatility = daily volatility * sqrt(252)
- Always use adjusted prices to account for dividends and splits

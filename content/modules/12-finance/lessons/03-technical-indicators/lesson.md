---
id: "03-technical-indicators"
title: "Technical Indicators"
concepts:
  - moving-averages
  - rsi
  - macd
  - signals
why: "Technical indicators transform raw price data into actionable signals -- moving averages reveal trends, RSI measures momentum, and MACD identifies trend changes."
prerequisites:
  - 02-portfolio-analysis
sources:
  - repo: "ranaroussi/yfinance"
    section: "Technical Analysis"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Pipeline"
    license: "Apache-2.0"
---

# Technical Indicators

Technical indicators are mathematical calculations based on price and volume data. Traders use them to identify trends, momentum, and potential entry/exit points. We'll implement the most important indicators from scratch.

## Simple Moving Average (SMA)

The SMA smooths price data by averaging the last N periods:

```python
def sma(prices, period):
    """Calculate Simple Moving Average."""
    if len(prices) < period:
        return []
    result = []
    for i in range(period - 1, len(prices)):
        window = prices[i - period + 1:i + 1]
        avg = sum(window) / period
        result.append(round(avg, 2))
    return result

prices = [44, 44, 44, 46, 46, 48, 50, 50, 52, 54]
sma_5 = sma(prices, 5)
print(f"Prices: {prices}")
print(f"SMA(5): {sma_5}")
```

Output:
```
Prices: [44, 44, 44, 46, 46, 48, 50, 50, 52, 54]
SMA(5): [44.8, 45.6, 46.8, 48.0, 49.2, 50.8]
```

When the price crosses above the SMA, it may signal an uptrend. When it crosses below, a potential downtrend.

## Exponential Moving Average (EMA)

The EMA gives more weight to recent prices, making it more responsive:

```python
def ema(prices, period):
    """Calculate Exponential Moving Average."""
    if len(prices) < period:
        return []
    multiplier = 2 / (period + 1)
    # Start with SMA for the first value
    result = [sum(prices[:period]) / period]
    for price in prices[period:]:
        new_ema = (price - result[-1]) * multiplier + result[-1]
        result.append(round(new_ema, 2))
    return result

prices = [44, 44, 44, 46, 46, 48, 50, 50, 52, 54]
ema_5 = ema(prices, 5)
print(f"EMA(5): {ema_5}")
```

The multiplier `2 / (period + 1)` determines how much weight the latest price gets.

## Relative Strength Index (RSI)

RSI measures the speed and magnitude of price changes. It ranges from 0 to 100:

- RSI > 70: Overbought (price may be too high)
- RSI < 30: Oversold (price may be too low)

```python
def rsi(prices, period=14):
    """Calculate Relative Strength Index."""
    if len(prices) < period + 1:
        return []

    changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [max(c, 0) for c in changes]
    losses = [abs(min(c, 0)) for c in changes]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    rsi_values = []
    for i in range(period, len(changes)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            rsi_values.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi_values.append(round(100 - 100 / (1 + rs), 2))

    return rsi_values
```

## MACD (Moving Average Convergence Divergence)

MACD shows the relationship between two EMAs, revealing momentum shifts:

```python
def macd(prices, fast=12, slow=26, signal_period=9):
    """Calculate MACD line, signal line, and histogram."""
    ema_fast = ema(prices, fast)
    ema_slow = ema(prices, slow)

    # Align the two EMAs (slow starts later)
    offset = slow - fast
    macd_line = [
        round(ema_fast[i + offset] - ema_slow[i], 2)
        for i in range(len(ema_slow))
    ]

    signal_line = ema(macd_line, signal_period)
    offset2 = len(macd_line) - len(signal_line)
    histogram = [
        round(macd_line[i + offset2] - signal_line[i], 2)
        for i in range(len(signal_line))
    ]

    return macd_line, signal_line, histogram
```

When the MACD line crosses above the signal line, it's a bullish signal. When it crosses below, bearish.

## Generating Signals

Combine indicators to generate trading signals:

```python
def generate_signals(prices, sma_short=5, sma_long=20):
    """Generate buy/sell signals from SMA crossovers."""
    short_ma = sma(prices, sma_short)
    long_ma = sma(prices, sma_long)

    # Align the series
    offset = sma_long - sma_short
    signals = []

    for i in range(1, len(long_ma)):
        short_val = short_ma[i + offset]
        long_val = long_ma[i]
        prev_short = short_ma[i + offset - 1]
        prev_long = long_ma[i - 1]

        if prev_short <= prev_long and short_val > long_val:
            signals.append(("BUY", i))
        elif prev_short >= prev_long and short_val < long_val:
            signals.append(("SELL", i))

    return signals
```

## Common Mistakes

**Using indicators in isolation**: No single indicator is reliable alone. Combine multiple indicators for confirmation.

**Over-optimizing parameters**: Fitting indicators perfectly to past data (overfitting) doesn't predict the future.

**Ignoring market context**: Indicators behave differently in trending vs ranging markets.

## Key Takeaways

- SMA smooths prices by averaging the last N periods
- EMA weighs recent prices more heavily using a multiplier of 2/(N+1)
- RSI measures momentum on a 0-100 scale (>70 overbought, <30 oversold)
- MACD reveals trend changes through EMA crossovers
- Always combine multiple indicators for more reliable signals

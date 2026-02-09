---
id: "07-quant-project"
title: "Quantitative Finance Project"
concepts:
  - project-design
  - strategy-implementation
  - performance-analysis
  - report-generation
why: "Building a complete quantitative analysis project from scratch ties together everything you've learned -- data acquisition, indicator calculation, strategy backtesting, and risk analysis."
prerequisites:
  - 06-openbb
sources:
  - repo: "ranaroussi/yfinance"
    section: "Complete Examples"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Tutorial"
    license: "Apache-2.0"
---

# Quantitative Finance Project

This lesson brings together everything from the module into a complete quantitative analysis project. You'll build a modular system that fetches data, computes indicators, generates signals, backtests the strategy, and produces a performance report.

## Project Architecture

A well-structured quant project separates concerns into modules:

```python
# data.py -- Data acquisition
# indicators.py -- Technical indicator calculations
# strategy.py -- Signal generation
# backtest.py -- Strategy simulation
# report.py -- Performance reporting
```

We'll build each piece and connect them into a pipeline.

## Data Module

```python
import random

class MarketData:
    """Generate or load market data."""

    def __init__(self, seed=42):
        self.rng = random.Random(seed)

    def generate_prices(self, ticker, days=252, start_price=100):
        """Generate simulated daily prices with drift and volatility."""
        prices = [start_price]
        daily_drift = 0.0003  # ~7.5% annual
        daily_vol = 0.015     # ~24% annual

        for _ in range(days - 1):
            change = self.rng.gauss(daily_drift, daily_vol)
            new_price = prices[-1] * (1 + change)
            prices.append(round(new_price, 2))

        return prices

    def generate_ohlcv(self, ticker, days=252, start_price=100):
        """Generate OHLCV data."""
        closes = self.generate_prices(ticker, days, start_price)
        ohlcv = []
        for i, close in enumerate(closes):
            high = close * (1 + abs(self.rng.gauss(0, 0.005)))
            low = close * (1 - abs(self.rng.gauss(0, 0.005)))
            open_p = closes[i-1] if i > 0 else close
            volume = int(self.rng.gauss(1000000, 200000))
            ohlcv.append({
                "open": round(open_p, 2), "high": round(high, 2),
                "low": round(low, 2), "close": close,
                "volume": max(volume, 100000),
            })
        return ohlcv

data = MarketData()
prices = data.generate_prices("TEST", days=10)
print(f"Prices: {prices}")
```

## Indicator Module

```python
class Indicators:
    """Technical indicator calculations."""

    @staticmethod
    def sma(prices, period):
        result = [None] * (period - 1)
        for i in range(period - 1, len(prices)):
            window = prices[i - period + 1:i + 1]
            result.append(sum(window) / period)
        return result

    @staticmethod
    def ema(prices, period):
        multiplier = 2 / (period + 1)
        result = [None] * (period - 1)
        result.append(sum(prices[:period]) / period)
        for price in prices[period:]:
            new_ema = (price - result[-1]) * multiplier + result[-1]
            result.append(new_ema)
        return result

    @staticmethod
    def rsi(prices, period=14):
        changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        rsi_vals = [None] * period
        gains = [max(c, 0) for c in changes]
        losses = [abs(min(c, 0)) for c in changes]
        avg_gain = sum(gains[:period]) / period
        avg_loss = sum(losses[:period]) / period

        for i in range(period, len(changes)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period
            if avg_loss == 0:
                rsi_vals.append(100.0)
            else:
                rs = avg_gain / avg_loss
                rsi_vals.append(100 - 100 / (1 + rs))
        return rsi_vals
```

## Strategy Module

```python
class MomentumStrategy:
    """SMA crossover with RSI filter."""

    def __init__(self, fast_period=10, slow_period=30, rsi_period=14):
        self.fast = fast_period
        self.slow = slow_period
        self.rsi_period = rsi_period

    def generate_signals(self, prices):
        ind = Indicators()
        fast_sma = ind.sma(prices, self.fast)
        slow_sma = ind.sma(prices, self.slow)
        rsi_vals = ind.rsi(prices, self.rsi_period)

        signals = [0] * len(prices)

        for i in range(1, len(prices)):
            if any(v is None for v in [fast_sma[i], slow_sma[i], rsi_vals[i-1],
                                        fast_sma[i-1], slow_sma[i-1]]):
                continue

            # Buy: fast crosses above slow AND RSI not overbought
            if (fast_sma[i] > slow_sma[i] and fast_sma[i-1] <= slow_sma[i-1]
                    and rsi_vals[i-1] < 70):
                signals[i] = 1
            # Sell: fast crosses below slow OR RSI overbought
            elif (fast_sma[i] < slow_sma[i] and fast_sma[i-1] >= slow_sma[i-1]):
                signals[i] = -1

        return signals
```

## Backtest Engine

```python
import math

class Backtest:
    """Simple event-driven backtester."""

    def __init__(self, initial_capital=10000):
        self.initial_capital = initial_capital

    def run(self, prices, signals):
        capital = self.initial_capital
        position = 0
        trades = []
        values = [capital]

        for i in range(1, len(prices)):
            if signals[i] == 1 and position == 0:
                position = capital / prices[i]
                capital = 0
                trades.append({"type": "BUY", "price": prices[i], "day": i})
            elif signals[i] == -1 and position > 0:
                capital = position * prices[i]
                trades.append({"type": "SELL", "price": prices[i], "day": i,
                              "pnl": capital - values[-1]})
                position = 0

            values.append(capital + position * prices[i])

        if position > 0:
            capital = position * prices[-1]
        values[-1] = capital + position * prices[-1] if position > 0 else capital

        return {"values": values, "trades": trades, "final": values[-1]}
```

## Report Generator

```python
def generate_report(result, initial_capital):
    values = result["values"]
    trades = result["trades"]

    total_return = (values[-1] / initial_capital - 1) * 100
    n_trades = len([t for t in trades if t["type"] == "BUY"])

    peak = values[0]
    max_dd = 0
    for v in values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak
        if dd > max_dd:
            max_dd = dd

    print("=" * 40)
    print("  STRATEGY PERFORMANCE REPORT")
    print("=" * 40)
    print(f"  Initial Capital:  ${initial_capital:,.0f}")
    print(f"  Final Value:      ${values[-1]:,.0f}")
    print(f"  Total Return:     {total_return:+.1f}%")
    print(f"  Max Drawdown:     {max_dd*100:.1f}%")
    print(f"  Number of Trades: {n_trades}")
    print("=" * 40)
```

## Common Mistakes

**Not separating concerns**: Mixing data fetching, strategy logic, and reporting makes code impossible to test and iterate.

**Skipping the benchmark**: Always compare against buy-and-hold. Most strategies fail to beat the market after costs.

**Not testing on out-of-sample data**: Split your data into training and testing periods.

## Key Takeaways

- Structure quant projects into modular components: data, indicators, strategy, backtest, report
- Use classes to encapsulate related functionality
- Always generate a comprehensive performance report
- Compare strategy results against a buy-and-hold benchmark
- Keep data generation separate from analysis for reproducibility

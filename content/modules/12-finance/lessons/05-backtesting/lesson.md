---
id: "05-backtesting"
title: "Backtesting Strategies"
concepts:
  - backtesting-framework
  - trading-strategy
  - performance-metrics
  - walk-forward
why: "Backtesting simulates how a trading strategy would have performed on historical data -- it's the bridge between a strategy idea and real-world deployment."
prerequisites:
  - 04-risk-management
sources:
  - repo: "ranaroussi/yfinance"
    section: "Historical Data"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Backtesting"
    license: "Apache-2.0"
---

# Backtesting Strategies

Backtesting runs a trading strategy against historical data to see how it would have performed. It answers: "Would this strategy have made money in the past?" While past performance doesn't guarantee future results, backtesting catches broken strategies before they lose real money.

## A Simple Backtesting Framework

```python
def backtest(prices, signals, initial_capital=10000):
    """Simple backtesting engine.

    prices: list of daily prices
    signals: list of 1 (buy/hold), -1 (sell/short), or 0 (flat)
    """
    capital = initial_capital
    position = 0  # Number of shares held
    portfolio_values = [capital]

    for i in range(1, len(prices)):
        signal = signals[i]

        if signal == 1 and position == 0:
            # Buy: invest all capital
            position = capital / prices[i]
            capital = 0
        elif signal == -1 and position > 0:
            # Sell: convert shares to cash
            capital = position * prices[i]
            position = 0

        # Track portfolio value
        total = capital + position * prices[i]
        portfolio_values.append(total)

    # Close any open position
    if position > 0:
        capital = position * prices[-1]
        position = 0

    return portfolio_values
```

## SMA Crossover Strategy

A classic strategy: buy when the short SMA crosses above the long SMA, sell when it crosses below:

```python
def sma(prices, period):
    result = []
    for i in range(len(prices)):
        if i < period - 1:
            result.append(None)
        else:
            window = prices[i - period + 1:i + 1]
            result.append(sum(window) / period)
    return result

def sma_crossover_signals(prices, short_period=5, long_period=20):
    """Generate signals from SMA crossover."""
    short_sma = sma(prices, short_period)
    long_sma = sma(prices, long_period)

    signals = [0] * len(prices)

    for i in range(1, len(prices)):
        if short_sma[i] is None or long_sma[i] is None:
            continue
        if short_sma[i - 1] is None or long_sma[i - 1] is None:
            continue

        # Crossover: short crosses above long
        if short_sma[i] > long_sma[i] and short_sma[i-1] <= long_sma[i-1]:
            signals[i] = 1
        # Crossunder: short crosses below long
        elif short_sma[i] < long_sma[i] and short_sma[i-1] >= long_sma[i-1]:
            signals[i] = -1

    return signals
```

## Performance Metrics

Evaluate a strategy with key metrics:

```python
import math

def strategy_report(portfolio_values, risk_free_rate=0.02):
    """Calculate key performance metrics for a backtest."""
    # Total return
    total_return = (portfolio_values[-1] / portfolio_values[0] - 1) * 100

    # Daily returns
    daily_returns = [
        (portfolio_values[i] - portfolio_values[i-1]) / portfolio_values[i-1]
        for i in range(1, len(portfolio_values))
    ]

    # Annualized return
    n_days = len(daily_returns)
    annual_return = ((portfolio_values[-1] / portfolio_values[0]) ** (252 / n_days) - 1) * 100

    # Sharpe ratio
    mean_ret = sum(daily_returns) / len(daily_returns)
    variance = sum((r - mean_ret) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
    daily_vol = math.sqrt(variance)
    sharpe = (mean_ret - risk_free_rate/252) / daily_vol * math.sqrt(252) if daily_vol > 0 else 0

    # Max drawdown
    peak = portfolio_values[0]
    max_dd = 0
    for v in portfolio_values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak
        if dd > max_dd:
            max_dd = dd

    # Win rate
    wins = sum(1 for r in daily_returns if r > 0)
    win_rate = wins / len(daily_returns) * 100

    print(f"Total Return:      {total_return:.1f}%")
    print(f"Annual Return:     {annual_return:.1f}%")
    print(f"Sharpe Ratio:      {sharpe:.2f}")
    print(f"Max Drawdown:      {max_dd*100:.1f}%")
    print(f"Win Rate:          {win_rate:.1f}%")
    print(f"# Trading Days:   {n_days}")
```

## Buy and Hold Benchmark

Always compare your strategy against simply buying and holding:

```python
def buy_and_hold(prices, initial_capital=10000):
    """Simulate buy-and-hold: buy on day 1, hold until the end."""
    shares = initial_capital / prices[0]
    return [shares * p for p in prices]

# Compare strategies
prices = [100, 102, 105, 103, 107, 110, 108, 112, 115, 113]
bh_values = buy_and_hold(prices)
bh_return = (bh_values[-1] / bh_values[0] - 1) * 100
print(f"Buy & Hold return: {bh_return:.1f}%")
```

## Common Mistakes

**Look-ahead bias**: Using future information in your signals. Only use data available up to the current point.

**Ignoring transaction costs**: Real trades have commissions, slippage, and spread. A strategy profitable in backtesting may lose money after costs.

**Survivorship bias**: Only testing on stocks that still exist today. Failed companies are excluded, inflating results.

**Overfitting**: Optimizing parameters to fit historical data perfectly. The strategy may fail on new data.

## Key Takeaways

- Backtesting simulates strategy performance on historical data
- SMA crossover is a simple but instructive trend-following strategy
- Always compare strategies against a buy-and-hold benchmark
- Key metrics: total return, Sharpe ratio, max drawdown, win rate
- Avoid look-ahead bias, survivorship bias, and overfitting
- Transaction costs can turn a profitable backtest into a losing strategy

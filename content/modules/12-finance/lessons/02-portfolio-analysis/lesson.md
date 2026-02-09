---
id: "02-portfolio-analysis"
title: "Portfolio Analysis"
concepts:
  - portfolio-returns
  - sharpe-ratio
  - diversification
  - correlation
why: "Modern portfolio theory shows that combining assets intelligently reduces risk without sacrificing returns -- the Sharpe ratio quantifies this risk-adjusted performance."
prerequisites:
  - 01-financial-data
sources:
  - repo: "ranaroussi/yfinance"
    section: "Multiple Tickers"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Portfolio Analysis"
    license: "Apache-2.0"
---

# Portfolio Analysis

A portfolio is a collection of investments. Rather than putting all your money in one stock, diversification spreads risk across multiple assets. Portfolio analysis measures how well this strategy works.

## Portfolio Returns

A portfolio's return is the weighted average of its asset returns:

```python
def portfolio_return(weights, returns):
    """Calculate weighted portfolio return."""
    total = sum(w * r for w, r in zip(weights, returns))
    return total

# 60% stocks, 30% bonds, 10% cash
weights = [0.60, 0.30, 0.10]
asset_returns = [0.08, 0.03, 0.01]  # 8%, 3%, 1%

port_ret = portfolio_return(weights, asset_returns)
print(f"Portfolio return: {port_ret*100:.2f}%")
# Portfolio return: 5.80%
```

## Multi-Period Portfolio Value

Track how a portfolio grows over time:

```python
def portfolio_growth(initial_value, daily_returns):
    """Track portfolio value over time."""
    values = [initial_value]
    for ret in daily_returns:
        new_value = values[-1] * (1 + ret)
        values.append(new_value)
    return values

returns = [0.02, -0.01, 0.015, -0.005, 0.03]
values = portfolio_growth(10000, returns)

for i, val in enumerate(values):
    print(f"Day {i}: ${val:,.2f}")
```

Output:
```
Day 0: $10,000.00
Day 1: $10,200.00
Day 2: $10,098.00
Day 3: $10,249.47
Day 4: $10,198.22
Day 5: $10,504.17
```

## The Sharpe Ratio

The Sharpe ratio measures return per unit of risk. Higher is better:

```
Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Portfolio Volatility
```

```python
import math

def sharpe_ratio(returns, risk_free_rate=0.02):
    """Calculate the annualized Sharpe ratio."""
    mean_ret = sum(returns) / len(returns)
    excess_returns = [r - risk_free_rate/252 for r in returns]
    mean_excess = sum(excess_returns) / len(excess_returns)

    variance = sum((r - mean_ret) ** 2 for r in returns) / (len(returns) - 1)
    daily_vol = math.sqrt(variance)

    # Annualize
    annual_excess = mean_excess * 252
    annual_vol = daily_vol * math.sqrt(252)

    if annual_vol == 0:
        return 0
    return annual_excess / annual_vol

# Simulated daily returns
daily_returns = [0.001, 0.003, -0.002, 0.004, -0.001, 0.002, 0.003, -0.001, 0.002, 0.001]
sr = sharpe_ratio(daily_returns)
print(f"Sharpe Ratio: {sr:.2f}")
```

Interpretation: Sharpe > 1.0 is good, > 2.0 is very good, > 3.0 is excellent.

## Correlation and Diversification

Assets that don't move together provide diversification benefits:

```python
def correlation(x, y):
    """Calculate Pearson correlation between two return series."""
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n

    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n)) / (n - 1)
    std_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x) / (n - 1))
    std_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y) / (n - 1))

    if std_x == 0 or std_y == 0:
        return 0
    return cov / (std_x * std_y)

stock_a = [0.02, -0.01, 0.03, -0.02, 0.01]
stock_b = [0.01, 0.02, -0.01, 0.03, -0.01]

corr = correlation(stock_a, stock_b)
print(f"Correlation: {corr:.3f}")
# Negative correlation = good diversification
```

Correlation ranges from -1 (perfectly opposite) to +1 (perfectly together). Low or negative correlation means better diversification.

## Maximum Drawdown

Drawdown measures the decline from peak to trough -- the worst loss experienced:

```python
def max_drawdown(values):
    """Calculate the maximum drawdown from a series of portfolio values."""
    peak = values[0]
    max_dd = 0

    for value in values:
        if value > peak:
            peak = value
        dd = (peak - value) / peak
        if dd > max_dd:
            max_dd = dd

    return max_dd

portfolio_values = [10000, 10500, 10200, 9800, 10100, 10800, 10300]
mdd = max_drawdown(portfolio_values)
print(f"Maximum Drawdown: {mdd*100:.2f}%")
# Maximum Drawdown: 6.67%  (peak 10500 to trough 9800)
```

## Common Mistakes

**Ignoring rebalancing**: Portfolio weights drift as assets change in value. Periodic rebalancing maintains the target allocation.

**Chasing past performance**: High past returns don't guarantee future results. Focus on risk-adjusted metrics like Sharpe ratio.

**Forgetting correlation changes**: Correlations between assets can change during market stress, reducing diversification when you need it most.

## Key Takeaways

- Portfolio return is the weighted average of individual asset returns
- The Sharpe ratio measures return per unit of risk (higher is better)
- Diversification reduces risk when assets have low correlation
- Maximum drawdown measures the worst peak-to-trough decline
- Annualize daily metrics: multiply returns by 252, volatility by sqrt(252)

---
id: "04-risk-management"
title: "Risk Management"
concepts:
  - value-at-risk
  - drawdown
  - position-sizing
  - volatility
why: "Risk management is the most important skill in finance -- Value at Risk (VaR) and position sizing determine how much you can lose and how much to invest in each position."
prerequisites:
  - 03-technical-indicators
sources:
  - repo: "ranaroussi/yfinance"
    section: "Risk Analytics"
    license: "Apache-2.0"
  - repo: "quantopian/zipline"
    section: "Risk Management"
    license: "Apache-2.0"
---

# Risk Management

The best traders and portfolio managers obsess over risk, not returns. Risk management determines how much you could lose in adverse scenarios and how to size positions to survive drawdowns. The core tools are Value at Risk (VaR), drawdown analysis, and position sizing.

## Value at Risk (VaR)

VaR answers: "What is the maximum expected loss over a given period at a given confidence level?"

For example, a 1-day 95% VaR of $10,000 means: "On 95% of days, we expect to lose no more than $10,000."

### Historical VaR

The simplest approach uses historical return data:

```python
def historical_var(returns, confidence=0.95):
    """Calculate VaR using the historical method."""
    sorted_returns = sorted(returns)
    index = int((1 - confidence) * len(sorted_returns))
    return sorted_returns[index]

# Simulated 100 days of returns
import random
random.seed(42)
returns = [random.gauss(0.0005, 0.02) for _ in range(100)]

var_95 = historical_var(returns, 0.95)
print(f"95% VaR: {var_95*100:.2f}%")
print(f"On a $100,000 portfolio: ${abs(var_95)*100000:,.0f} max daily loss")
```

### Parametric VaR

Assumes returns follow a normal distribution:

```python
import math

def parametric_var(returns, confidence=0.95):
    """Calculate VaR assuming normal distribution."""
    mean = sum(returns) / len(returns)
    variance = sum((r - mean) ** 2 for r in returns) / (len(returns) - 1)
    std = math.sqrt(variance)

    # Z-scores for common confidence levels
    z_scores = {0.90: 1.282, 0.95: 1.645, 0.99: 2.326}
    z = z_scores.get(confidence, 1.645)

    return mean - z * std

returns = [0.01, -0.02, 0.005, -0.01, 0.015, -0.005, 0.02, -0.03, 0.01, -0.015]
var_95 = parametric_var(returns, 0.95)
print(f"Parametric 95% VaR: {var_95*100:.2f}%")
```

## Drawdown Analysis

Drawdown measures the decline from a historical peak. It tells you how much pain an investor would have experienced:

```python
def analyze_drawdowns(values):
    """Calculate drawdown series and find worst drawdown."""
    peak = values[0]
    drawdowns = []

    for v in values:
        if v > peak:
            peak = v
        dd = (peak - v) / peak
        drawdowns.append(dd)

    max_dd = max(drawdowns)
    max_dd_idx = drawdowns.index(max_dd)

    return {
        "max_drawdown": max_dd,
        "max_dd_date_index": max_dd_idx,
        "current_drawdown": drawdowns[-1],
        "drawdown_series": drawdowns,
    }

values = [100, 105, 110, 108, 95, 98, 103, 107, 112, 109]
result = analyze_drawdowns(values)
print(f"Maximum drawdown: {result['max_drawdown']*100:.1f}%")
print(f"Occurred at index: {result['max_dd_date_index']}")
print(f"Current drawdown: {result['current_drawdown']*100:.1f}%")
```

## Position Sizing

How much capital to allocate to each trade. The Kelly Criterion gives the optimal fraction:

```python
def kelly_criterion(win_rate, win_loss_ratio):
    """Calculate the Kelly fraction for optimal position sizing.

    win_rate: probability of winning (0-1)
    win_loss_ratio: average win / average loss
    """
    kelly = win_rate - (1 - win_rate) / win_loss_ratio
    return max(0, kelly)  # Never negative (don't bet)

# Example: 55% win rate, winners are 1.5x the size of losers
fraction = kelly_criterion(0.55, 1.5)
print(f"Kelly suggests betting {fraction*100:.1f}% of capital")

# In practice, use half-Kelly for safety
print(f"Half-Kelly: {fraction*50:.1f}% of capital")
```

## Risk-Adjusted Position Sizing

Size positions based on volatility to normalize risk:

```python
import math

def volatility_position_size(capital, risk_per_trade, price, daily_vol):
    """Calculate position size based on volatility."""
    dollar_risk = capital * risk_per_trade
    # Assume 2 standard deviations for stop loss
    stop_distance = price * daily_vol * 2
    shares = int(dollar_risk / stop_distance)
    return shares

capital = 100000
position = volatility_position_size(
    capital=capital,
    risk_per_trade=0.02,  # Risk 2% of capital per trade
    price=150.0,
    daily_vol=0.025,      # 2.5% daily volatility
)
print(f"Position size: {position} shares")
print(f"Dollar value: ${position * 150:,.0f}")
print(f"Portfolio allocation: {position * 150 / capital * 100:.1f}%")
```

## Risk Metrics Summary

```python
import math

def risk_report(returns, portfolio_value):
    """Generate a comprehensive risk report."""
    mean_ret = sum(returns) / len(returns)
    variance = sum((r - mean_ret) ** 2 for r in returns) / (len(returns) - 1)
    daily_vol = math.sqrt(variance)
    annual_vol = daily_vol * math.sqrt(252)

    sorted_rets = sorted(returns)
    var_95 = sorted_rets[int(0.05 * len(sorted_rets))]

    print(f"Daily volatility:  {daily_vol*100:.2f}%")
    print(f"Annual volatility: {annual_vol*100:.1f}%")
    print(f"95% Daily VaR:     ${abs(var_95)*portfolio_value:,.0f}")
    print(f"Worst day:         {min(returns)*100:.2f}%")
    print(f"Best day:          {max(returns)*100:.2f}%")
```

## Common Mistakes

**Ignoring tail risk**: VaR doesn't tell you how bad losses could be beyond the confidence level. CVaR (Conditional VaR) addresses this.

**Full Kelly betting**: The Kelly Criterion is optimal in theory but assumes perfect knowledge. In practice, use half-Kelly or less.

**Static position sizing**: Fixed-dollar positions ignore volatility. A $10,000 position in a volatile stock has more risk than the same amount in a stable one.

## Key Takeaways

- VaR estimates the maximum expected loss at a given confidence level
- Historical VaR uses actual past returns; parametric VaR assumes normal distribution
- Maximum drawdown measures the worst peak-to-trough decline
- The Kelly Criterion calculates optimal bet size (use half-Kelly in practice)
- Size positions based on volatility to normalize risk across assets
- Risk management is about surviving bad scenarios, not maximizing returns

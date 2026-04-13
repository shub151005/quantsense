import pandas as pd
import numpy as np
from utils.data_fetcher import get_stock_data

def run_ema_backtest(
    ticker: str,
    short_period: int = 12,
    long_period: int = 26
) -> dict:
    try:
        df = get_stock_data(ticker, period="1y")

        if df is None or df.empty:
            return {"error": f"Could not fetch data for {ticker}"}

        df["EMA_short"] = df["Close"].ewm(
            span=short_period, adjust=False
        ).mean()
        df["EMA_long"] = df["Close"].ewm(
            span=long_period, adjust=False
        ).mean()

        signals = []
        position = None
        trades = []

        for i in range(1, len(df)):
            prev_short = df["EMA_short"].iloc[i-1]
            prev_long = df["EMA_long"].iloc[i-1]
            curr_short = df["EMA_short"].iloc[i]
            curr_long = df["EMA_long"].iloc[i]
            price = df["Close"].iloc[i]
            date = df["Date"].iloc[i].strftime("%Y-%m-%d")

            if prev_short <= prev_long and curr_short > curr_long:
                signals.append({
                    "date": date,
                    "signal": "BUY",
                    "price": round(price, 2),
                    "ema_short": round(curr_short, 2),
                    "ema_long": round(curr_long, 2)
                })
                if position is None:
                    position = {"type": "BUY", "price": price, "date": date}

            elif prev_short >= prev_long and curr_short < curr_long:
                signals.append({
                    "date": date,
                    "signal": "SELL",
                    "price": round(price, 2),
                    "ema_short": round(curr_short, 2),
                    "ema_long": round(curr_long, 2)
                })
                if position and position["type"] == "BUY":
                    pnl = round(((price - position["price"]) / position["price"]) * 100, 2)
                    trades.append({
                        "buy_date": position["date"],
                        "buy_price": round(position["price"], 2),
                        "sell_date": date,
                        "sell_price": round(price, 2),
                        "pnl_pct": pnl
                    })
                    position = None

        winning_trades = [t for t in trades if t["pnl_pct"] > 0]
        losing_trades = [t for t in trades if t["pnl_pct"] <= 0]

        win_rate = round(
            len(winning_trades) / len(trades) * 100, 2
        ) if trades else 0

        avg_return = round(
            sum(t["pnl_pct"] for t in trades) / len(trades), 2
        ) if trades else 0

        chart_data = []
        for _, row in df.iterrows():
            chart_data.append({
                "date": row["Date"].strftime("%Y-%m-%d"),
                "price": round(row["Close"], 2),
                "ema_short": round(row["EMA_short"], 2),
                "ema_long": round(row["EMA_long"], 2)
            })

        last_three_signals = signals[-3:] if len(signals) >= 3 else signals

        return {
            "ticker": ticker.replace(".NS", "").replace(".BO", ""),
            "short_period": short_period,
            "long_period": long_period,
            "total_signals": len(signals),
            "total_trades": len(trades),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "win_rate": win_rate,
            "avg_return_pct": avg_return,
            "last_three_signals": last_three_signals,
            "all_signals": signals,
            "trades": trades,
            "chart_data": chart_data
        }

    except Exception as e:
        return {"error": str(e)}
import time

import pandas as pd
import yfinance as yf


MANUAL_MAP = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "WIPRO": "WIPRO.NS",
    "SBIN": "SBIN.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "ADANIENT": "ADANIENT.NS",
    "ITC": "ITC.NS",
    "MARUTI": "MARUTI.NS",
    "AXISBANK": "AXISBANK.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "TITAN": "TITAN.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "AAPL": "AAPL",
    "TSLA": "TSLA",
    "GOOGL": "GOOGL",
    "MSFT": "MSFT",
    "NVDA": "NVDA",
    "META": "META",
    "AMZN": "AMZN",
}


def resolve_ticker(ticker: str) -> str:
    clean = ticker.upper().strip()
    return MANUAL_MAP.get(clean, clean)


def get_stock_info(ticker: str) -> dict:
    try:
        resolved = resolve_ticker(ticker)
        symbol = resolved.replace(".NS", "").replace(".BO", "")

        time.sleep(1)
        history = yf.Ticker(resolved).history(period="5d")
        if history.empty or "Close" not in history:
            return {}

        close = history["Close"].dropna()
        if close.empty:
            return {}

        current_price = float(close.iloc[-1])

        return {
            "name": symbol,
            "resolved_ticker": resolved,
            "sector": "Unknown",
            "industry": "Unknown",
            "market_cap": None,
            "current_price": round(current_price, 2),
            "currency": "INR" if ".NS" in resolved or ".BO" in resolved else "USD",
            "exchange": "NSE" if ".NS" in resolved else "BSE" if ".BO" in resolved else "NASDAQ",
            "52_week_high": None,
            "52_week_low": None,
            "pe_ratio": None,
        }
    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return {}


def get_stock_data(ticker: str, period: str = "2y") -> pd.DataFrame:
    try:
        resolved = resolve_ticker(ticker)

        time.sleep(1)
        df = yf.download(
            resolved,
            period=period,
            progress=False,
            auto_adjust=True,
        )
        if df.empty:
            return None

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df = df.reset_index()
        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
        df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
        df = df.round(2)
        return df
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

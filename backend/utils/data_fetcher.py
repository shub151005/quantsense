import yfinance as yf
import pandas as pd

def resolve_ticker(ticker: str) -> str:
    clean = ticker.upper().strip()
    suffixes = [".NS", ".BO", ""]
    for suffix in suffixes:
        try:
            test = yf.Ticker(clean + suffix)
            df = test.history(period="5d", timeout=15)
            if not df.empty:
                return clean + suffix
        except:
            continue
    return None

def get_stock_data(ticker: str, period: str = "2y") -> pd.DataFrame:
    try:
        resolved = resolve_ticker(ticker)
        if not resolved:
            return None

        stock = yf.Ticker(resolved)
        df = stock.history(period=period)

        if df.empty:
            return None

        df = df.reset_index()
        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
        df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
        df = df.round(2)

        return df
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def get_stock_info(ticker: str) -> dict:
    try:
        resolved = resolve_ticker(ticker)
        if not resolved:
            return {}

        stock = yf.Ticker(resolved)
        info = stock.info

        return {
            "name": info.get("longName", ticker),
            "resolved_ticker": resolved,
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "market_cap": info.get("marketCap", None),
            "current_price": info.get("currentPrice", None),
            "currency": info.get("currency", "INR"),
            "exchange": info.get("exchange", "Unknown"),
            "52_week_high": info.get("fiftyTwoWeekHigh", None),
            "52_week_low": info.get("fiftyTwoWeekLow", None),
            "pe_ratio": info.get("trailingPE", None),
        }
    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return {}
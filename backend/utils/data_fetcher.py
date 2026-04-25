import requests
import pandas as pd
import os
import time

ALPHA_KEY = os.getenv("ALPHA_VANTAGE_KEY")

MANUAL_MAP = {
    'RELIANCE': 'RELIANCE.NS',
    'TCS': 'TCS.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'WIPRO': 'WIPRO.NS',
    'SBIN': 'SBIN.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'TATASTEEL': 'TATASTEEL.NS',
    'ADANIENT': 'ADANIENT.NS',
    'ITC': 'ITC.NS',
    'MARUTI': 'MARUTI.NS',
    'AXISBANK': 'AXISBANK.NS',
    'KOTAKBANK': 'KOTAKBANK.NS',
    'TITAN': 'TITAN.NS',
    'HINDUNILVR': 'HINDUNILVR.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'AAPL': 'AAPL',
    'TSLA': 'TSLA',
    'GOOGL': 'GOOGL',
    'MSFT': 'MSFT',
    'NVDA': 'NVDA',
    'META': 'META',
    'AMZN': 'AMZN',
}

def resolve_ticker(ticker: str) -> str:
    clean = ticker.upper().strip()
    return MANUAL_MAP.get(clean, clean)

def get_stock_info(ticker: str) -> dict:
    try:
        clean = ticker.upper().strip()
        resolved = resolve_ticker(clean)
        symbol = resolved.replace('.NS', '').replace('.BO', '')

        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={resolved}&apikey={ALPHA_KEY}"
        response = requests.get(url, timeout=15)
        data = response.json()
        quote = data.get("Global Quote", {})

        if quote and quote.get("05. price"):
            price = float(quote.get("05. price", 0))
            high = float(quote.get("03. high", 0))
            low = float(quote.get("04. low", 0))
            return {
                "name": symbol,
                "resolved_ticker": resolved,
                "sector": "Unknown",
                "industry": "Unknown",
                "market_cap": None,
                "current_price": round(price, 2),
                "currency": "INR" if '.NS' in resolved or '.BO' in resolved else "USD",
                "exchange": "NSE" if '.NS' in resolved else "BSE" if '.BO' in resolved else "NASDAQ",
                "52_week_high": round(high, 2),
                "52_week_low": round(low, 2),
                "pe_ratio": None,
            }

        import yfinance as yf
        time.sleep(2)
        stock = yf.Ticker(resolved)
        info = stock.info
        if info.get("currentPrice"):
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
        return {}
    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return {}

def get_stock_data(ticker: str, period: str = "2y") -> pd.DataFrame:
    try:
        resolved = resolve_ticker(ticker.upper().strip())
        import yfinance as yf
        time.sleep(2)
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
import requests
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

ALPHA_KEY = os.getenv("ALPHA_VANTAGE_KEY")

MANUAL_MAP = {
    'RELIANCE': 'RELIANCE.BSE',
    'TCS': 'TCS.BSE',
    'INFY': 'INFY.BSE',
    'HDFCBANK': 'HDFCBANK.BSE',
    'WIPRO': 'WIPRO.BSE',
    'SBIN': 'SBIN.BSE',
    'ICICIBANK': 'ICICIBANK.BSE',
    'ITC': 'ITC.BSE',
    'TATAMOTORS': 'TATAMOTORS.BSE',
    'MARUTI': 'MARUTI.BSE',
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
    if clean in MANUAL_MAP:
        return MANUAL_MAP[clean]
    return clean

def get_stock_data(ticker: str, period: str = "2y") -> pd.DataFrame:
    try:
        import yfinance as yf
        resolved = resolve_ticker(ticker)
        
        # Try with .NS suffix for Indian stocks
        for suffix in ['.NS', '.BO', '']:
            try:
                test_ticker = resolved if '.' in resolved else resolved + suffix
                stock = yf.Ticker(test_ticker)
                df = stock.history(period=period)
                if not df.empty:
                    df = df.reset_index()
                    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
                    df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
                    df = df.round(2)
                    return df
            except:
                continue
        return None
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def get_stock_info(ticker: str) -> dict:
    try:
        clean = ticker.upper().strip()
        resolved = resolve_ticker(clean)
        
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={resolved}&apikey={ALPHA_KEY}"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        quote = data.get("Global Quote", {})
        
        if not quote or not quote.get("05. price"):
            import yfinance as yf
            for suffix in ['.NS', '.BO', '']:
                try:
                    test = resolved + suffix if '.' not in resolved else resolved
                    stock = yf.Ticker(test)
                    info = stock.info
                    if info.get("currentPrice"):
                        return {
                            "name": info.get("longName", ticker),
                            "resolved_ticker": test,
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
                except:
                    continue
            return {}

        current_price = float(quote.get("05. price", 0))
        high = float(quote.get("03. high", 0))
        low = float(quote.get("04. low", 0))
        change_pct = quote.get("10. change percent", "0%").replace("%", "")

        return {
            "name": clean,
            "resolved_ticker": resolved,
            "sector": "Unknown",
            "industry": "Unknown",
            "market_cap": None,
            "current_price": current_price,
            "currency": "USD" if '.' not in resolved else "INR",
            "exchange": "BSE" if '.BSE' in resolved else "NSE",
            "52_week_high": high,
            "52_week_low": low,
            "pe_ratio": None,
        }
    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return {}
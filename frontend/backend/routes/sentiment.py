from fastapi import APIRouter, HTTPException
from models.sentiment_model import analyze_sentiment
from dotenv import load_dotenv
import requests
import os

load_dotenv()
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
router = APIRouter()

@router.get("/market-news")
def get_market_news():
    try:
        url = (
            f"https://gnews.io/api/v4/search"
            f"?q=indian+stock+market+NSE+BSE"
            f"&lang=en"
            f"&country=in"
            f"&max=10"
            f"&apikey={GNEWS_API_KEY}"
        )
        response = requests.get(url, timeout=10)
        data = response.json()
        articles = data.get("articles", [])
        return {
            "news": [
                {
                    "title": a.get("title", ""),
                    "url": a.get("url", ""),
                    "source": a.get("source", {}).get("name", ""),
                    "published": a.get("publishedAt", "")
                }
                for a in articles if a.get("title")
            ]
        }
    except Exception as e:
        return {"news": [], "error": str(e)}

@router.get("/flash/{ticker}")
def flash_alert(ticker: str):
    from models.sentiment_model import get_flash_alert
    result = get_flash_alert(ticker.upper())
    return result

@router.get("/{ticker}")
def get_sentiment(ticker: str):
    result = analyze_sentiment(ticker.upper())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
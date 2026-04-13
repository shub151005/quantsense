from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import requests
import os

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
analyzer = SentimentIntensityAnalyzer()

def fetch_news(ticker: str) -> list:
    try:
        clean_ticker = ticker.replace(".NS", "").replace(".BO", "")
        url = (
            f"https://gnews.io/api/v4/search"
            f"?q={clean_ticker}+stock"
            f"&lang=en"
            f"&country=in"
            f"&max=10"
            f"&apikey={GNEWS_API_KEY}"
        )
        response = requests.get(url, timeout=10)
        data = response.json()
        articles = data.get("articles", [])
        return articles
    except Exception as e:
        print(f"News fetch error: {e}")
        return []

def analyze_sentiment(ticker: str) -> dict:
    try:
        articles = fetch_news(ticker)

        if not articles:
            return {
                "ticker": ticker,
                "score": 0.0,
                "mood": "NEUTRAL",
                "headlines": [],
                "message": "No recent news found"
            }

        headlines = []
        scores = []

        for article in articles:
            title = article.get("title", "")
            url = article.get("url", "")
            published = article.get("publishedAt", "")

            if not title:
                continue

            vader_score = analyzer.polarity_scores(title)
            compound = vader_score["compound"]
            scores.append(compound)

            if compound >= 0.05:
                sentiment_label = "positive"
            elif compound <= -0.05:
                sentiment_label = "negative"
            else:
                sentiment_label = "neutral"

            headlines.append({
                "title": title,
                "url": url,
                "published": published,
                "sentiment": sentiment_label,
                "score": round(compound, 3)
            })

        if not scores:
            avg_score = 0.0
        else:
            avg_score = round(sum(scores) / len(scores), 3)

        if avg_score >= 0.05:
            mood = "BULLISH"
        elif avg_score <= -0.05:
            mood = "BEARISH"
        else:
            mood = "NEUTRAL"

        positive_count = sum(1 for s in scores if s >= 0.05)
        negative_count = sum(1 for s in scores if s <= -0.05)
        neutral_count = len(scores) - positive_count - negative_count

        return {
            "ticker": ticker.replace(".NS", "").replace(".BO", ""),
            "score": avg_score,
            "mood": mood,
            "total_articles": len(headlines),
            "breakdown": {
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count
            },
            "headlines": headlines
        }

    except Exception as e:
        return {"error": str(e)}

def get_flash_alert(ticker: str) -> dict:
    try:
        articles = fetch_news(ticker)
        if not articles:
            return {"alert": False}

        recent = articles[:3]
        scores = []
        headlines = []

        for article in recent:
            title = article.get("title", "")
            if not title:
                continue
            score = analyzer.polarity_scores(title)["compound"]
            scores.append(score)
            headlines.append(title)

        if not scores:
            return {"alert": False}

        avg = sum(scores) / len(scores)

        if avg <= -0.3:
            return {
                "alert": True,
                "type": "NEGATIVE",
                "message": f"Breaking: Negative news detected for {ticker.replace('.NS','').replace('.BO','')}",
                "headline": headlines[0],
                "score": round(avg, 3)
            }
        elif avg >= 0.5:
            return {
                "alert": True,
                "type": "POSITIVE",
                "message": f"Breaking: Strong positive news for {ticker.replace('.NS','').replace('.BO','')}",
                "headline": headlines[0],
                "score": round(avg, 3)
            }
        else:
            return {"alert": False}

    except Exception as e:
        return {"alert": False}        
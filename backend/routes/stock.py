from fastapi import APIRouter, HTTPException
from utils.data_fetcher import get_stock_data, get_stock_info
from models.prophet_model import run_forecast
from models.monte_carlo import run_monte_carlo
from models.sentiment_model import analyze_sentiment
from models.satta_score import calculate_satta_score
from models.ema_backtest import run_ema_backtest

router = APIRouter()

@router.get("/info/{ticker}")
def stock_info(ticker: str):
    info = get_stock_info(ticker.upper())
    if not info:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    return info

@router.get("/history/{ticker}")
def stock_history(ticker: str, period: str = "1y"):
    df = get_stock_data(ticker.upper(), period=period)
    if df is None:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    return {
        "ticker": ticker.upper(),
        "period": period,
        "data": df.to_dict(orient="records")
    }

@router.get("/forecast/{ticker}")
def stock_forecast(ticker: str, days: int = 30):
    result = run_forecast(ticker.upper(), days=days)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/ema/{ticker}")
def ema_backtest(ticker: str, short: int = 12, long: int = 26):
    result = run_ema_backtest(ticker.upper(), short_period=short, long_period=long)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/analyze/{ticker}")
def full_analysis(ticker: str):
    try:
        info = get_stock_info(ticker.upper())
        if not info:
            raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")

        forecast = run_forecast(ticker.upper(), days=30)
        sentiment = analyze_sentiment(ticker.upper())
        risk = run_monte_carlo(ticker.upper(), days=30, simulations=10000)

        current_price = info.get("current_price", 0)
        predicted_price = forecast.get("forecast", [{}])[-1].get("predicted", current_price)
        sentiment_score = sentiment.get("score", 0)
        probability_positive = risk.get("probability_positive", 50)

        satta = calculate_satta_score(
            probability_positive=probability_positive,
            sentiment_score=sentiment_score,
            current_price=current_price,
            predicted_price=predicted_price
        )

        return {
            "ticker": ticker.upper(),
            "info": info,
            "satta_score": satta,
            "forecast": forecast,
            "sentiment": sentiment,
            "risk": risk
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



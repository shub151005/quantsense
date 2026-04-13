from prophet import Prophet
from utils.data_fetcher import get_stock_data
import pandas as pd

def run_forecast(ticker: str, days: int = 30) -> dict:
    try:
        df = get_stock_data(ticker)
        
        if df is None or df.empty:
            return {"error": f"Could not fetch data for {ticker}"}
        
        prophet_df = df[["Date", "Close"]].rename(
            columns={"Date": "ds", "Close": "y"}
        )
        
        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=True,
            changepoint_prior_scale=0.05,
            interval_width=0.80
        )
        
        model.fit(prophet_df)
        
        future = model.make_future_dataframe(periods=days)
        forecast = model.predict(future)
        
        forecast_only = forecast.tail(days)
        
        result = []
        for _, row in forecast_only.iterrows():
            result.append({
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted": round(row["yhat"], 2),
                "lower": round(row["yhat_lower"], 2),
                "upper": round(row["yhat_upper"], 2)
            })
        
        current_price = df["Close"].iloc[-1]
        predicted_end_price = forecast_only["yhat"].iloc[-1]
        trend = "UP" if predicted_end_price > current_price else "DOWN"
        change_pct = round(
            ((predicted_end_price - current_price) / current_price) * 100, 2
        )
        
        return {
            "ticker": ticker.upper(),
            "current_price": round(current_price, 2),
            "forecast": result,
            "trend": trend,
            "expected_change_pct": change_pct,
            "forecast_days": days
        }
        
    except Exception as e:
        return {"error": str(e)}
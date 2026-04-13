import numpy as np
from utils.data_fetcher import get_stock_data

def run_monte_carlo(ticker: str, days: int = 30, simulations: int = 10000) -> dict:
    try:
        df = get_stock_data(ticker)

        if df is None or df.empty:
            return {"error": f"Could not fetch data for {ticker}"}

        closes = df["Close"].values
        daily_returns = np.diff(closes) / closes[:-1]

        mean_return = np.mean(daily_returns)
        std_return = np.std(daily_returns)
        current_price = closes[-1]

        simulation_results = np.zeros((days, simulations))

        for i in range(simulations):
            prices = [current_price]
            for d in range(days):
                shock = np.random.normal(mean_return, std_return)
                next_price = prices[-1] * (1 + shock)
                prices.append(next_price)
            simulation_results[:, i] = prices[1:]

        final_prices = simulation_results[-1, :]

        probability_positive = round(
            float(np.sum(final_prices > current_price) / simulations * 100), 2
        )
        probability_negative = round(100 - probability_positive, 2)

        worst_case = round(float(np.percentile(final_prices, 5)), 2)
        best_case = round(float(np.percentile(final_prices, 95)), 2)
        most_likely = round(float(np.percentile(final_prices, 50)), 2)

        pct_change_worst = round(
            ((worst_case - current_price) / current_price) * 100, 2
        )
        pct_change_best = round(
            ((best_case - current_price) / current_price) * 100, 2
        )
        pct_change_likely = round(
            ((most_likely - current_price) / current_price) * 100, 2
        )

        buckets = np.linspace(
            np.min(final_prices),
            np.max(final_prices),
            20
        )
        distribution, _ = np.histogram(final_prices, bins=buckets)
        distribution_data = []
        for j in range(len(distribution)):
            distribution_data.append({
                "price_range": f"{round(buckets[j], 0)}-{round(buckets[j+1], 0)}",
                "count": int(distribution[j]),
                "percentage": round(float(distribution[j] / simulations * 100), 2)
            })

        if probability_positive >= 65:
            risk_label = "LOW RISK"
            risk_color = "teal"
        elif probability_positive >= 45:
            risk_label = "MODERATE RISK"
            risk_color = "amber"
        else:
            risk_label = "HIGH RISK"
            risk_color = "crimson"

        return {
            "ticker": ticker.replace(".NS", "").replace(".BO", ""),
            "current_price": round(float(current_price), 2),
            "simulations_run": simulations,
            "forecast_days": days,
            "probability_positive": probability_positive,
            "probability_negative": probability_negative,
            "risk_label": risk_label,
            "risk_color": risk_color,
            "price_targets": {
                "worst_case": worst_case,
                "best_case": best_case,
                "most_likely": most_likely,
                "pct_change_worst": pct_change_worst,
                "pct_change_best": pct_change_best,
                "pct_change_likely": pct_change_likely
            },
            "distribution": distribution_data
        }

    except Exception as e:
        return {"error": str(e)}
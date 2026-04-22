def calculate_satta_score(
    probability_positive: float,
    sentiment_score: float,
    current_price: float,
    predicted_price: float
) -> dict:
    try:
        volatility_risk = round(100 - probability_positive, 2)
        volatility_component = (volatility_risk / 100) * 40

        if sentiment_score >= 0:
            sentiment_negativity = 0
        else:
            sentiment_negativity = abs(sentiment_score) * 100
        sentiment_component = (sentiment_negativity / 100) * 30

        price_deviation = abs(predicted_price - current_price) / current_price * 100
        deviation_normalized = min(price_deviation, 20)
        deviation_component = (deviation_normalized / 20) * 30

        raw_score = volatility_component + sentiment_component + deviation_component
        satta_score = round(min(max(raw_score, 0), 100), 1)

        if satta_score <= 30:
            label = "SAFE — FUNDAMENTALLY SOUND"
            color = "teal"
            advice = "This stock shows strong fundamentals with low speculative risk."
        elif satta_score <= 60:
            label = "MODERATE — WATCH CAREFULLY"
            color = "amber"
            advice = "This stock carries moderate risk. Monitor closely before investing."
        else:
            label = "HIGH RISK — SATTA TERRITORY"
            color = "crimson"
            advice = "High speculative risk detected. Exercise extreme caution."

        return {
            "score": satta_score,
            "label": label,
            "color": color,
            "advice": advice,
            "breakdown": {
                "volatility_contribution": round(volatility_component, 2),
                "sentiment_contribution": round(sentiment_component, 2),
                "deviation_contribution": round(deviation_component, 2)
            }
        }

    except Exception as e:
        return {"error": str(e)}
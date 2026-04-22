from fastapi import APIRouter, HTTPException
from models.monte_carlo import run_monte_carlo

router = APIRouter()

@router.get("/montecarlo/{ticker}")
def monte_carlo(ticker: str, days: int = 30, simulations: int = 10000):
    result = run_monte_carlo(ticker.upper(), days=days, simulations=simulations)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


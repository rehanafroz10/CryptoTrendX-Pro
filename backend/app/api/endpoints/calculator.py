"""
POST /api/v1/calculator
"What-IF" backtesting calculator - simulate ROI for a past investment.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

from app.services.data_fetcher import fetch_coin_market_data

router = APIRouter()


class BacktestRequest(BaseModel):
    coin_id: str
    invested_amount: float
    days_ago: int  # e.g. 180 for "6 months ago"


@router.post("")
def calculate_backtest(payload: BacktestRequest):
    try:
        raw = fetch_coin_market_data(payload.coin_id, days=payload.days_ago + 5)
        prices = [p[1] for p in raw["prices"]]

        historical_price = prices[0]
        current_price = prices[-1]

        units_bought = payload.invested_amount / historical_price
        current_value = units_bought * current_price
        roi_percent = ((current_value - payload.invested_amount) / payload.invested_amount) * 100

        return {
            "invested_amount": payload.invested_amount,
            "current_value": round(current_value, 2),
            "roi_percent": round(roi_percent, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

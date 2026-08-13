"""
GET /api/v1/trends?coin_id={coin}
Returns percentage changes across all 6 timeframes for a given coin.
"""
from fastapi import APIRouter, HTTPException
import pandas as pd

from app.services.data_fetcher import fetch_coin_market_data
from app.services.analytics_engine import multi_horizon_trends

router = APIRouter()


@router.get("")
def get_trends(coin_id: str):
    try:
        raw_data = fetch_coin_market_data(coin_id, days=365)
        prices = pd.Series([p[1] for p in raw_data["prices"]])
        trends = multi_horizon_trends(prices)
        return {"coin_id": coin_id, "trends": trends}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch trend data: {str(e)}")

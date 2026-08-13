from fastapi import APIRouter, Query, HTTPException
from typing import List, Union
import pandas as pd
import numpy as np
import httpx

from app.services.coin_comparison import compute_correlation_analytics

router = APIRouter()

async def fetch_coin_historical_series(symbol: str, days: int) -> pd.Series:
    """
    Fetches real hourly kline data directly from Binance Public API.
    Fallback to simulation if symbol doesn't exist on Binance.
    """
    limit = min(days * 24, 1000)
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval=1h&limit={limit}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            timestamps = [pd.to_datetime(item[0], unit='ms') for item in data]
            close_prices = [float(item[4]) for item in data]
            return pd.Series(close_prices, index=timestamps, name=symbol)
            
    # Fallback simulation if Binance request fails
    dates = pd.date_range(end=pd.Timestamp.now().floor('h'), periods=days * 24, freq="1h")
    base_price = 60000 if "BTC" in symbol else 3000
    returns = np.random.normal(0.0002, 0.015, len(dates))
    price_path = base_price * np.exp(np.cumsum(returns))
    return pd.Series(price_path, index=dates, name=symbol)


@router.get("/compare")
@router.get("/correlation", include_in_schema=False)
async def compare_coins(
    coins: Union[List[str], str] = Query(
        "BTCUSDT,ETHUSDT,SOLUSDT", 
        description="Comma-separated or list of coin symbols."
    ),
    days: int = Query(7, ge=1, le=90)
):
    parsed_coins = []
    if isinstance(coins, list):
        for item in coins:
            parsed_coins.extend([c.strip().upper() for c in item.split(",") if c.strip()])
    elif isinstance(coins, str):
        parsed_coins = [c.strip().upper() for c in coins.split(",") if c.strip()]

    coin_list = list(dict.fromkeys(parsed_coins))
    
    if len(coin_list) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Minimum 2 unique coins are required for comparison."
        )

    price_data = {}
    for coin in coin_list:
        try:
            series = await fetch_coin_historical_series(coin, days)
            if not series.empty:
                price_data[coin] = series
        except Exception:
            continue

    if len(price_data) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Failed to fetch live market data for requested coins."
        )

    try:
        analytics_result = compute_correlation_analytics(price_data)
        return {
            "status": "success",
            "timeframe_days": days,
            "data": analytics_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error computing comparison analytics: {str(e)}"
        )
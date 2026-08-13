"""
GET/POST /api/v1/portfolio
Manages a logged-in user's crypto holdings and calculates real-time P&L.

NOTE: Requires auth dependency (JWT) in production - simplified here for scaffold clarity.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.data_fetcher import fetch_top_coins

router = APIRouter()

# Placeholder in-memory store -> swap for real DB table:
# portfolio(id, user_id, coin_id, quantity, buy_price, buy_date)
_fake_portfolio_db = []


class PortfolioEntry(BaseModel):
    user_email: str
    coin_id: str
    quantity: float
    buy_price: float


@router.post("")
def add_holding(entry: PortfolioEntry):
    _fake_portfolio_db.append(entry.dict())
    return {"message": "Holding added", "entry": entry}


@router.get("")
def get_portfolio(user_email: str):
    holdings = [h for h in _fake_portfolio_db if h["user_email"] == user_email]

    # TODO: fetch real current prices per coin_id instead of this placeholder
    current_prices = {c["id"]: c["current_price"] for c in fetch_top_coins(limit=100)}

    enriched = []
    total_pnl = 0.0
    for h in holdings:
        current_price = current_prices.get(h["coin_id"], h["buy_price"])
        pnl = (current_price - h["buy_price"]) * h["quantity"]
        total_pnl += pnl
        enriched.append({**h, "current_price": current_price, "pnl": round(pnl, 2)})

    return {"holdings": enriched, "total_pnl": round(total_pnl, 2)}

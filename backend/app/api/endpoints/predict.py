import asyncio
import pandas as pd
from fastapi import APIRouter, Query, HTTPException, Request
from app.services.data_fetcher import BinanceDataFetcher
from app.services.ml_model import CryptoTrendMLModel
from app.services.nlp_sentiment import CryptoSentimentEngine

router = APIRouter()
fetcher = BinanceDataFetcher()
ml_engine = CryptoTrendMLModel()
nlp_engine = CryptoSentimentEngine()

@router.get("/predict/{symbol}")
async def get_48h_prediction(
    symbol: str = "BTCUSDT",
    hours: int = Query(1000, ge=100, le=5000, description="Training dataset hours (e.g. 500, 1000, 1500, 2000)")
):
    """
    Requested hours + indicator buffer data fetch karke XGBoost train karta hai aur 
    agle 48 hours ka Trend Direction (UP/DOWN) prediction return karta hai.
    """
    symbol_clean = symbol.upper().strip()
    fetch_limit = hours + 100 # Warmup buffer for RSI/SMA

    print(f"\n🚀 [PREDICT ROUTE] Request received for {symbol_clean} with {hours} hours (fetching {fetch_limit} candles)...")

    # Step 1: Binance Historical Data Fetching
    try:
        df = await fetcher.get_historical_candles(symbol=symbol_clean, interval="1h", limit=fetch_limit)
    except Exception as e:
        print(f"❌ Error fetching candles: {e}")
        df = None

    if df is None or df.empty:
        return {"status": "error", "message": f"Data fetch failed or invalid symbol: {symbol_clean}"}

    # Step 2: ML Model Training & Prediction
    print("🧠 Running XGBoost Model Training in Thread Pool...")
    ml_result = await asyncio.to_thread(ml_engine.predict_48h_trend, df, hours=hours)

    if isinstance(ml_result, dict) and "error" in ml_result:
        return {"status": "error", "message": ml_result["error"]}

    # Step 3: NLP News & Sentiment Fetching
    print("🗞️ Fetching Market News & Sentiment Scores...")
    try:
        fng_score = await asyncio.to_thread(nlp_engine.fetch_fear_and_greed)
        news_headlines = await asyncio.to_thread(nlp_engine.fetch_news, symbol_clean)
        sentiment_score = await asyncio.to_thread(nlp_engine.analyze_news_sentiment, news_headlines)
    except Exception as nlp_err:
        print(f"⚠️ NLP Fetch timed out or failed, using fallback scores: {nlp_err}")
        fng_score = 50
        sentiment_score = 50.0

    # Step 4: Decision Score Calculation
    technical_score = ml_result.get("raw_probabilities", {}).get("up_probability", 50.0) if isinstance(ml_result, dict) else 50.0
    final_combined_decision = nlp_engine.calculate_final_confidence(technical_score, sentiment_score, fng_score)

    print(f"✅ Successful Prediction generated for {symbol_clean}!\n")

    return {
        "status": "success",
        "symbol": symbol_clean,
        "coin_id": symbol_clean,
        "training_hours": hours,
        "prediction": ml_result,
        "sentiment": {"fng": fng_score, "news_score": sentiment_score},
        "final_decision": final_combined_decision
    }
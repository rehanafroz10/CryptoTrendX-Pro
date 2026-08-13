from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import json
import asyncio
import httpx

# --- Redis Imports ---
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

# --- Database Imports ---
from app.database import engine, Base, get_db
from app import models

# --- Coin Comparison Router Import ---
from app.api.endpoints import coin_comparison
from app.api.endpoints.predict import router as predict_router

# --- Services Imports ---
from app.services.data_fetcher import BinanceDataFetcher
from app.services.analytics_engine import CryptoAnalyticsEngine
from app.services.ml_model import CryptoTrendMLModel
from app.services.nlp_sentiment import CryptoSentimentEngine 

Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
limiter = Limiter(key_func=get_remote_address)

async def startup_event():
    redis = aioredis.from_url("redis://localhost:6379", encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="cryptotrendx-cache")
    print("Redis Cache Initialized! 🚀")

app = FastAPI(
    title="CryptoTrendX Pro API",
    description="Advanced Crypto Analytics, ML Predictions, Sentiment & Portfolio Management",
    version="2.0.0",
    on_startup=[startup_event]
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Include Routers ===
app.include_router(coin_comparison.router, prefix="/api/v1", tags=["Coin Comparison & Analytics"])
app.include_router(predict_router, prefix="/api/v1", tags=["ML Predictions Router"])

fetcher = BinanceDataFetcher()
analytics = CryptoAnalyticsEngine()
ml_engine = CryptoTrendMLModel()
nlp_engine = CryptoSentimentEngine()

@app.get("/")
@limiter.limit("5/minute")
def read_root(request: Request):
    return {"message": "CryptoTrendX Phase 5 API is Live with Real SQLite DB & Redis! 🚀"}

# ==========================================
# 1. CORE ENDPOINTS (With Caching & Rate Limiting)
# ==========================================

@app.get("/api/v1/coins", tags=["Market Data"])
@limiter.limit("20/minute")
@cache(expire=60)
async def get_all_coins(request: Request, fetch_all: bool = False):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get("https://api.binance.com/api/v3/ticker/24hr")
            data = res.json()

            usdt_pairs = [item for item in data if item['symbol'].endswith('USDT')]

            if fetch_all:
                all_symbols = [item['symbol'] for item in usdt_pairs]
                return {
                    "status": "success",
                    "total": len(all_symbols),
                    "coins": all_symbols
                }
            
            sorted_by_volume = sorted(usdt_pairs, key=lambda x: float(x['quoteVolume']), reverse=True)[:20]
            
            top_20 = [
                {
                    "symbol": item['symbol'],
                    "price": float(item['lastPrice']),
                    "change_24h": float(item['priceChangePercent']),
                    "high_24h": float(item['highPrice']),
                    "low_24h": float(item['lowPrice']),
                    "volume": float(item['quoteVolume'])
                }
                for item in sorted_by_volume
            ]

            return {
                "status": "success",
                "count": len(top_20),
                "top_20": top_20
            }

    except Exception as e:
        fallback_coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]
        return {"status": "fallback", "coins": fallback_coins, "error": str(e)}

@app.get("/api/v1/trends", tags=["Market Data"])
@limiter.limit("10/minute")
@cache(expire=60)
async def get_trends(request: Request, coin_id: str = "BTCUSDT", days: int = 14):
    df = await fetcher.get_historical_candles(symbol=coin_id, interval="1d", limit=days)
    if df.empty:
        raise HTTPException(status_code=400, detail="Data fetch failed")
    return {"coin_id": coin_id, "days": days, "trend_data": df.to_dict(orient="records")}

@app.get("/api/v1/analytics", tags=["Analytics"])
@limiter.limit("10/minute")
@cache(expire=60)
async def get_crypto_analytics(request: Request, coin_id: str = "BTCUSDT"):
    df = await fetcher.get_historical_candles(symbol=coin_id, interval="1d", limit=365)
    processed_data = analytics.process_all_metrics(df)
    return {"status": "success", "coin_id": coin_id, "analytics": processed_data}

@app.get("/api/v1/predict/{coin_id}", tags=["ML Predictions & Sentiment"])
@limiter.limit("10/minute")
async def get_smart_prediction(
    request: Request, 
    coin_id: str = "BTCUSDT",
    hours: int = Query(1000, ge=100, le=5000, description="Historical hours limit")
):
    print(f"\n🚀 [1/5] Request received for {coin_id} ({hours} hours)...")
    
    try:
        # ✅ FIX: Fetch limit ab exact requested hours + 100 (warmup buffer) handle karega
        fetch_limit = hours + 100
        print(f"🔄 [2/5] Fetching {fetch_limit} candles from Binance...")
        df = await fetcher.get_historical_candles(symbol=coin_id, interval="1h", limit=fetch_limit)
        
        if df is None or df.empty:
            raise HTTPException(status_code=400, detail="Failed to fetch candle data from Binance.")

        # ✅ FIX: Explicitly passing hours parameter to ml_engine
        print("🧠 [3/5] Running XGBoost Training & SHAP Explainer in Thread Pool...")
        ml_result = await asyncio.to_thread(ml_engine.predict_48h_trend, df, hours=hours)

        print("🗞️ [4/5] Fetching Sentiment and News Data...")
        try:
            fng_score = await asyncio.to_thread(nlp_engine.fetch_fear_and_greed)
            news_headlines = await asyncio.to_thread(nlp_engine.fetch_news, coin_id)
            sentiment_score = await asyncio.to_thread(nlp_engine.analyze_news_sentiment, news_headlines)
        except Exception as nlp_err:
            print(f"⚠️ NLP Fetch failed/timed out, using fallback scores: {nlp_err}")
            fng_score = 50
            sentiment_score = 50.0

        print("📊 [5/5] Calculating Final decision score...")
        technical_score = ml_result.get("raw_probabilities", {}).get("up_probability", 50.0) if isinstance(ml_result, dict) else 50.0
        final_combined_decision = nlp_engine.calculate_final_confidence(technical_score, sentiment_score, fng_score)

        print(f"✅ Prediction Successful for {coin_id}!\n")

        return {
            "coin_id": coin_id,
            "training_hours": hours,
            "prediction": ml_result,
            "sentiment": {"fng": fng_score, "news_score": sentiment_score},
            "final_decision": final_combined_decision
        }

    except Exception as e:
        print(f"❌ [CRITICAL ERROR] Prediction Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/calculator", tags=["Tools"])
async def profit_loss_calculator(buy_price: float, sell_price: float, amount: float):
    profit = (sell_price - buy_price) * amount
    return {"profit_loss": round(profit, 2), "percentage": round(((sell_price - buy_price) / buy_price) * 100, 2)}

# ==========================================
# 2. AUTHENTICATION & PORTFOLIO
# ==========================================
@app.post("/api/v1/auth/signup", tags=["Auth"])
async def signup(username: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_pw = pwd_context.hash(password)
    new_user = models.User(username=username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/api/v1/auth/login", tags=["Auth"])
async def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"access_token": f"{username}-auth-token", "token_type": "bearer"}

@app.get("/api/v1/portfolio", tags=["Portfolio"])
async def get_portfolio(username: str, db: Session = Depends(get_db)):
    user_portfolio = db.query(models.Portfolio).filter(models.Portfolio.username == username).all()
    return {"user_portfolio": user_portfolio}

@app.post("/api/v1/portfolio", tags=["Portfolio"])
async def add_to_portfolio(username: str, coin_id: str, amount: float, db: Session = Depends(get_db)):
    new_entry = models.Portfolio(username=username, coin_id=coin_id, amount=amount)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": f"Added {amount} of {coin_id} to portfolio!"}

# ==========================================
# 3. WEBSOCKETS (Live Prices)
# ==========================================
active_connections = []

@app.websocket("/ws/live-prices")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Live Price Update for {data}: $ ...")
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print("Client Disconnected")
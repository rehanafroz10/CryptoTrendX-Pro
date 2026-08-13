from fastapi import APIRouter
from app.api.endpoints import predict, coin_comparison

api_router = APIRouter()

# Include prediction router
api_router.include_router(predict.router, prefix="/v1", tags=["ML Predictions"])

# Include coin comparison router
api_router.include_router(coin_comparison.router, prefix="/v1", tags=["Coin Comparison & Analytics"])
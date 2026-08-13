"""
Central configuration for the app.
Loads environment variables (use a .env file with python-dotenv in production).
"""
import os

class Settings:
    PROJECT_NAME: str = "CryptoTrendX"

    # External APIs
    COINGECKO_BASE_URL: str = "https://api.coingecko.com/api/v3"
    FEAR_GREED_API_URL: str = "https://api.alternative.me/fng/"
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/cryptotrendx")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "CHANGE_THIS_SECRET_IN_PRODUCTION")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

settings = Settings()

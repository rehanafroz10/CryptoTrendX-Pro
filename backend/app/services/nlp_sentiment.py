import requests
from transformers import pipeline
import numpy as np
from typing import Dict, Any, List

class CryptoSentimentEngine:
    def __init__(self):
        print("FinBERT model load ho raha hai... (first time thoda time lega)")
        # FinBERT model load karna 
        self.nlp = pipeline("sentiment-analysis", model="ProsusAI/finbert")
        self.fng_url = "https://api.alternative.me/fng/"
        
        # CryptoPanic API Key yahan daalein (Agar nahi hai toh blank chhod dein, dummy data use hoga)
        self.cryptopanic_key = "" 

    def fetch_fear_and_greed(self) -> float:
        """Alternative.me se free Fear & Greed Index (0-100) fetch karta hai."""
        try:
            response = requests.get(self.fng_url, timeout=5)
            data = response.json()
            return float(data["data"][0]["value"])
        except Exception as e:
            print(f"F&G API Error: {e}")
            return 50.0  # Neutral fallback

    def fetch_news(self, symbol: str) -> List[str]:
        """CryptoPanic se headlines fetch karta hai. Key na hone par fallback."""
        coin = symbol.replace("USDT", "").lower()
        if not self.cryptopanic_key:
            # Fallback headlines for testing FinBERT without API Key
            return [
                f"{coin.upper()} forms strategic partnership with major banks, pushing adoption.",
                f"Regulatory crackdown on {coin.upper()} causes market panic.",
                f"{coin.upper()} network upgrade successfully deployed with lower fees.",
                f"Whales are moving massive amounts of {coin.upper()} to exchanges.",
                f"Analysts predict {coin.upper()} will hit new all-time highs this year."
            ]

        try:
            url = f"https://cryptopanic.com/api/v1/posts/?auth_token={self.cryptopanic_key}&currencies={coin}&filter=hot"
            response = requests.get(url, timeout=5)
            data = response.json()
            return [post["title"] for post in data.get("results", [])[:5]]
        except Exception as e:
            print(f"CryptoPanic API Error: {e}")
            return []

    def analyze_news_sentiment(self, headlines: List[str]) -> float:
        """FinBERT se headlines padh kar sentiment nikalta hai aur usko 0-100 scale par map karta hai."""
        if not headlines:
            return 50.0

        results = self.nlp(headlines)
        scores = []
        
        for res in results:
            label = res["label"]
            score = res["score"]
            if label == "positive":
                scores.append(score)
            elif label == "negative":
                scores.append(-score)
            else:
                scores.append(0.0)
                
        # Average sentiment from -1 to 1
        avg_sentiment = float(np.mean(scores))
        
        # Convert -1 to 1 range into 0 to 100 percentage scale
        sentiment_pct = ((avg_sentiment + 1) / 2) * 100
        return round(sentiment_pct, 2)

    def calculate_final_confidence(self, technical_score: float, sentiment_score: float, fng_score: float) -> Dict[str, Any]:
        """Weighted Formula: 60% Technical, 30% News Sentiment, 10% Fear & Greed"""
        final_score = (technical_score * 0.60) + (sentiment_score * 0.30) + (fng_score * 0.10)
        final_score = round(final_score, 2)

        if final_score >= 60:
            decision = "STRONG BUY 🚀"
        elif final_score >= 52:
            decision = "BUY 📈"
        elif final_score <= 40:
            decision = "STRONG SELL 🚨"
        elif final_score <= 48:
            decision = "SELL 📉"
        else:
            decision = "NEUTRAL / HOLD ⚖️"

        return {
            "combined_confidence_score": final_score,
            "final_decision": decision,
            "weights_used": {
                "technical_ml": "60%",
                "news_sentiment": "30%",
                "fear_and_greed": "10%"
            },
            "breakdown": {
                "technical_score": technical_score,
                "news_sentiment_score": sentiment_score,
                "fear_and_greed_score": fng_score
            }
        }

# ==========================================
# Execution / Testing the Pipeline
# ==========================================
if __name__ == "__main__":
    engine = CryptoSentimentEngine()
    symbol = "BTCUSDT"
    
    print(f"\n--- Testing Phase 4 for {symbol} ---")
    
    # 1. Fetch F&G
    fng = engine.fetch_fear_and_greed()
    print(f"Fear & Greed Score: {fng}")
    
    # 2. Fetch News
    news = engine.fetch_news(symbol)
    print(f"Latest News: {news}")
    
    # 3. Analyze Sentiment
    sentiment = engine.analyze_news_sentiment(news)
    print(f"News Sentiment Score: {sentiment}/100")
    
    # 4. Final Combination (Using dummy technical score 65 for testing)
    mock_technical_score = 65.0 
    final_result = engine.calculate_final_confidence(mock_technical_score, sentiment, fng)
    
    print(f"\n--- FINAL COMBINED OUTPUT ---")
    print(final_result)
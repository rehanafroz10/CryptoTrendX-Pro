import pandas as pd
import numpy as np
from typing import Dict, Any

class CryptoAnalyticsEngine:
    def __init__(self):
        pass

    def calculate_percentage_changes(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        1D, 7D, 14D, 28D, 6M (180D), 1Y (365D) ka exact percentage gain/loss calculate karta hai.
        """
        if df.empty or len(df) < 2:
            return {}

        current_price = df["close"].iloc[-1]
        total_rows = len(df)

        def get_pct_change(days_back: int) -> float:
            if total_rows > days_back:
                past_price = df["close"].iloc[-(days_back + 1)]
                pct = ((current_price - past_price) / past_price) * 100
                return round(pct, 2)
            return 0.0

        return {
            "change_1d": get_pct_change(1),
            "change_7d": get_pct_change(7),
            "change_14d": get_pct_change(14),
            "change_28d": get_pct_change(28),
            "change_6m": get_pct_change(180),
            "change_1y": get_pct_change(365),
        }

    def calculate_rsi(self, df: pd.DataFrame, period: int = 14) -> float:
        """
        14-day Relative Strength Index (RSI) calculate karta hai.
        RSI > 70: Overbought | RSI < 30: Oversold
        """
        if len(df) < period + 1:
            return 50.0

        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        # Avoid division by zero
        loss = loss.replace(0, 1e-9)

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return round(float(rsi.iloc[-1]), 2)

    def calculate_sma(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        SMA-20 aur SMA-50 (Simple Moving Average) calculate karta hai.
        """
        sma_20 = df["close"].rolling(window=20).mean().iloc[-1] if len(df) >= 20 else df["close"].iloc[-1]
        sma_50 = df["close"].rolling(window=50).mean().iloc[-1] if len(df) >= 50 else df["close"].iloc[-1]

        return {
            "sma_20": round(float(sma_20), 2),
            "sma_50": round(float(sma_50), 2)
        }

    def calculate_volatility(self, df: pd.DataFrame, days: int = 30) -> float:
        """
        Pichle 30 din ke daily log returns ka volatility index (% me) calculate karta hai.
        """
        if len(df) < days:
            return 0.0

        recent_df = df.tail(days).copy()
        recent_df["log_return"] = np.log(recent_df["close"] / recent_df["close"].shift(1))
        volatility = recent_df["log_return"].std() * np.sqrt(365) * 100
        return round(float(volatility), 2)

    def process_all_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Sabhi analytical values ko ek single output dict me combine karta hai.
        """
        if df.empty:
            return {}

        current_price = round(float(df["close"].iloc[-1]), 2)
        pct_changes = self.calculate_percentage_changes(df)
        rsi = self.calculate_rsi(df)
        smas = self.calculate_sma(df)
        volatility = self.calculate_volatility(df)

        # Market Signal Logic
        if rsi > 70:
            signal = "OVERBOUGHT (Potential Fall)"
        elif rsi < 30:
            signal = "OVERSOLD (Potential Rebound)"
        else:
            signal = "NEUTRAL"

        return {
            "current_price": current_price,
            "trends": pct_changes,
            "indicators": {
                "rsi_14": rsi,
                "sma_20": smas["sma_20"],
                "sma_50": smas["sma_50"],
                "volatility_30d_pct": volatility,
                "market_signal": signal
            }
        }
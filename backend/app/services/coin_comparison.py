import pandas as pd
import numpy as np

def compute_correlation_analytics(price_data: dict) -> dict:
    df = pd.DataFrame(price_data).ffill().bfill()
    
    if df.empty or len(df.columns) < 2:
        raise ValueError("At least 2 valid coins are required.")

    # Returns & Correlation Matrix
    returns_df = df.pct_change().dropna()
    corr_matrix = returns_df.corr(method="pearson").fillna(1.0).round(3)
    
    # Base 100 Normalized Trends (Line Chart)
    normalized_df = (df / df.iloc[0]) * 100
    normalized_series = []
    
    # Downsample points for smooth performance
    step = max(1, len(normalized_df) // 100)
    for timestamp, row in normalized_df.iloc[::step].iterrows():
        point = {"time": timestamp.strftime("%b %d %H:%M")}
        for coin in df.columns:
            point[coin] = round(float(row[coin]), 2)
        normalized_series.append(point)

    # Bar Chart Stats
    bar_chart_stats = []
    for coin in df.columns:
        series = df[coin]
        coin_returns = returns_df[coin] if coin in returns_df.columns else pd.Series([0])
        
        total_return_pct = ((series.iloc[-1] - series.iloc[0]) / series.iloc[0]) * 100
        volatility = coin_returns.std() * np.sqrt(24 * 365) * 100 # Annualized volatility %

        bar_chart_stats.append({
            "coin": coin,
            "latest_price": round(float(series.iloc[-1]), 4 if series.iloc[-1] < 1 else 2),
            "total_return_pct": round(float(total_return_pct), 2),
            "volatility": round(float(volatility), 2) if not np.isnan(volatility) else 0.0,
            "max_price": round(float(series.max()), 2),
            "min_price": round(float(series.min()), 2),
        })

    return {
        "coins": list(df.columns),
        "correlation_matrix": corr_matrix.to_dict(),
        "normalized_trends": normalized_series,
        "bar_chart_stats": bar_chart_stats
    }    
    
    
    
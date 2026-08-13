import httpx
import pandas as pd
import asyncio

BINANCE_BASE_URL = "https://api.binance.com/api/v3"

class BinanceDataFetcher:
    def __init__(self):
        self.base_url = BINANCE_BASE_URL
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def get_historical_candles(self, symbol: str = "BTCUSDT", interval: str = "1h", limit: int = 1000):
        url = f"{self.base_url}/klines"
        all_candles = []
        end_time = None
        remaining = limit

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while remaining > 0:
                fetch_count = min(remaining, 1000)
                params = {"symbol": symbol, "interval": interval, "limit": fetch_count}
                if end_time:
                    params["endTime"] = end_time

                try:
                    res = await client.get(url, params=params)
                    data = res.json()
                    
                    if not data or not isinstance(data, list):
                        break

                    all_candles = data + all_candles
                    end_time = data[0][0] - 1  # Fetch older candles in previous step
                    remaining -= len(data)

                    if len(data) < fetch_count:
                        break
                except Exception as e:
                    print(f"Fetcher Exception: {e}")
                    break

        if not all_candles:
            return pd.DataFrame()

        df = pd.DataFrame(all_candles, columns=[
            'timestamp', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ])

        numeric_cols = ['open', 'high', 'low', 'close', 'volume']
        df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric)

        # Ensure correct time alignment without duplicate boundary timestamps
        df.drop_duplicates(subset=['timestamp'], inplace=True)
        df.sort_values('timestamp', ascending=True, inplace=True)
        df.reset_index(drop=True, inplace=True)

        df.dropna(inplace=True)
        return df

if __name__ == "__main__":
    async def main():
        fetcher = BinanceDataFetcher()
        print("Binance se Bitcoin (BTCUSDT) ka 365-day data aa raha hai...")
        df = await fetcher.get_historical_candles(symbol="BTCUSDT", interval="1d", limit=365)
        print("\nData successfully fetched! Last 5 rows:")
        print(df.tail(5))

    asyncio.run(main())
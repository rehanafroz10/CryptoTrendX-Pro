import { useEffect, useState } from 'react';

export const WS_URL = 'ws://127.0.0.1:8000/ws/live-prices';

export function useLivePrices(coinId = 'BTCUSDT') {
  const [priceData, setPriceData] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(coinId);
    };

    ws.onmessage = (event) => {
      setPriceData(event.data);
    };

    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(coinId);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [coinId]);

  return { priceData, isConnected };
}


import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Link from 'next/link';

export default function TrendTable() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await api.get('/api/v1/trends');
        
        // Check karein ki response direct list hai ya object me wrap hai
        const responseData = Array.isArray(res.data)
          ? res.data
          : res.data?.trends || res.data?.data || [];

        if (responseData.length > 0) {
          setTrends(responseData);
        } else {
          setTrends(getFallbackData());
        }
      } catch (err) {
        console.error('Trend API Error:', err);
        setTrends(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const getFallbackData = () => [
    { symbol: 'BTCUSDT', price: '$64,230', h24: '+3.2%', d7: '+8.4%', status: 'Bullish' },
    { symbol: 'ETHUSDT', price: '$3,450', h24: '-1.1%', d7: '+4.2%', status: 'Neutral' },
    { symbol: 'SOLUSDT', price: '$145', h24: '+6.8%', d7: '+18.9%', status: 'Strong Bullish' },
    { symbol: 'BNBUSDT', price: '$580', h24: '+0.4%', d7: '-2.1%', status: 'Bearish' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
      <h3 className="font-semibold text-lg mb-4">Multi-Horizon Trend Summary</h3>
      {loading ? (
        <div className="text-slate-400 text-sm animate-pulse py-4">Fetching live market trends...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Trend</th>
                <th className="pb-3">7d Trend</th>
                <th className="pb-3">AI Outlook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Array.isArray(trends) && trends.map((coin) => (
                <tr key={coin.symbol} className="hover:bg-slate-800/30">
                  <td className="py-3 font-semibold">
                    <Link href={`/coin/${coin.symbol}`} className="hover:text-indigo-400 transition-colors">
                      {coin.symbol}
                    </Link>
                  </td>
                  <td className="py-3 font-mono">{coin.price}</td>
                  <td className={`py-3 ${String(coin.h24 || '').startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coin.h24}
                  </td>
                  <td className={`py-3 ${String(coin.d7 || '').startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coin.d7}
                  </td>
                  <td className="py-3">
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                      {coin.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
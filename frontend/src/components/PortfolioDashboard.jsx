import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PortfolioDashboard({ username = 'Rehan_Afroz' }) {
  const [portfolio, setPortfolio] = useState([]);
  const [coinId, setCoinId] = useState('BTCUSDT');
  const [amount, setAmount] = useState(0.5);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`/api/v1/portfolio?username=${username}`);
      setPortfolio(res.data.user_portfolio || []);
    } catch (err) {
      console.error('Portfolio Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const addCoin = async () => {
    try {
      await api.post(`/api/v1/portfolio?username=${username}&coin_id=${coinId}&amount=${amount}`);
      fetchPortfolio();
    } catch (err) {
      console.error('Add Portfolio Error:', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
      <h3 className="font-semibold text-lg mb-4">Portfolio Holdings ({username})</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={coinId}
          onChange={(e) => setCoinId(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm w-24"
        />
        <button
          onClick={addCoin}
          className="bg-emerald-600 hover:bg-emerald-500 text-sm px-4 py-1.5 rounded font-medium"
        >
          Add Asset
        </button>
      </div>

      <div className="divide-y divide-slate-800 text-sm">
        {portfolio.map((item, idx) => (
          <div key={idx} className="py-2 flex justify-between">
            <span className="font-semibold">{item.coin_id}</span>
            <span className="font-mono">{item.amount} Coins</span>
          </div>
        ))}
      </div>
    </div>
  );
}
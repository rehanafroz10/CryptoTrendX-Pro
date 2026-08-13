import { useState } from 'react';
import { api } from '../services/api';
import { Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WhatIfCalculator() {
  const [buyPrice, setBuyPrice] = useState(60000);
  const [sellPrice, setSellPrice] = useState(65000);
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);

  const calculatePnl = async () => {
    try {
      const res = await api.post('/api/v1/calculator', null, {
        params: { buy_price: buyPrice, sell_price: sellPrice, amount }
      });
      setResult(res.data);
    } catch (err) {
      console.error('Calculation Error:', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-lg">"What-IF" Profit Calculator</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Buy Price ($)</label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Sell Price ($)</label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={calculatePnl}
        className="w-full bg-indigo-600 hover:bg-indigo-500 font-medium py-2 rounded-lg transition-colors text-sm mb-4"
      >
        Calculate Returns
      </button>

      {result && (
        <div className={`p-3 rounded-lg border flex items-center justify-between text-sm ${
          result.profit_loss >= 0 
            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
            : 'bg-rose-950/40 border-rose-800/50 text-rose-400'
        }`}>
          <div className="flex items-center gap-1">
            {result.profit_loss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="font-semibold">Profit/Loss:</span> ${result.profit_loss}
          </div>
          <span className="font-mono font-bold">{result.percentage}%</span>
        </div>
      )}
    </div>
  );
}
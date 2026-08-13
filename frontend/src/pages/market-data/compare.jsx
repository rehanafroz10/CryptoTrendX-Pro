import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, CartesianGrid, Cell
} from "recharts";

const API_BASE_URL = "http://127.0.0.1:8000";

const AVAILABLE_COINS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", 
  "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT"
];

const COIN_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899", 
  "#3b82f6", "#8b5cf6", "#14b8a6", "#f97316"
];

export default function CompareCrypto() {
  const [availableCoins, setAvailableCoins] = useState(AVAILABLE_COINS);
  const [selectedCoins, setSelectedCoins] = useState(["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]);
  const [customCoinInput, setCustomCoinInput] = useState("");
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleCoin = (coin) => {
    if (selectedCoins.includes(coin)) {
      if (selectedCoins.length > 2) {
        setSelectedCoins(selectedCoins.filter((c) => c !== coin));
      } else {
        alert("At least 2 coins are required for comparison!");
      }
    } else {
      setSelectedCoins([...selectedCoins, coin]);
    }
  };

  const handleAddCustomCoin = (e) => {
    e.preventDefault();
    if (!customCoinInput.trim()) return;

    let formattedCoin = customCoinInput.trim().toUpperCase();
    if (!formattedCoin.endsWith("USDT")) {
      formattedCoin += "USDT";
    }

    if (!availableCoins.includes(formattedCoin)) {
      setAvailableCoins([...availableCoins, formattedCoin]);
    }
    if (!selectedCoins.includes(formattedCoin)) {
      setSelectedCoins([...selectedCoins, formattedCoin]);
    }
    setCustomCoinInput("");
  };

  const fetchCompareData = async () => {
    if (selectedCoins.length < 2) return;

    try {
      setLoading(true);
      setError(null);

      const coinsParam = selectedCoins.join(",");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/compare?coins=${encodeURIComponent(coinsParam)}&days=${days}`
      );
      
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Server status ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to fetch live market comparison.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompareData();
  }, [selectedCoins, days]);

  // Real Dynamic Heatmap Color Engine (-1.0 to +1.0)
  const getHeatmapBg = (val) => {
    if (val === undefined || val === null) return "rgba(30, 41, 59, 0.8)";
    if (val === 1) return "rgba(16, 185, 129, 0.85)"; // Self correlation
    if (val > 0) {
      // Positive scale: Slate to Emerald Green
      const intensity = Math.min(val, 1);
      return `rgba(16, 185, 129, ${0.15 + intensity * 0.7})`;
    } else {
      // Negative scale: Slate to Rose Red
      const intensity = Math.min(Math.abs(val), 1);
      return `rgba(244, 63, 94, ${0.15 + intensity * 0.7})`;
    }
  };

  return (
    <>
      <Head>
        <title>Live Crypto Multi-Asset Comparison | CryptoTrendX Pro</title>
      </Head>

      {/* FULL WIDTH TOP TO BOTTOM LAYOUT */}
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 w-full mx-auto space-y-8">
        
        {/* HEADER SECTION */}
<div className="border-b border-slate-800 pb-5 space-y-3">
  {/* 1. TOP LINE: Back Button */}
  <div>
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all shadow-sm cursor-pointer"
    >
      ⬅️ Back
    </Link>
  </div>

  {/* 2. MAIN HEADING & SUB-HEADING ALIGNED WITH ⚡ */}
  <div>
    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
      ⚡ Live Crypto Comparison & Correlation Analytics
    </h1>
    
    <p className="text-slate-400 text-sm mt-1">
      Real-time Binance market prices, Base-100 normalized trend charts, correlation heatmap, and annualized volatility stats.
    </p>
  </div>
</div>

        {/* CONTROLS PANEL (FULL WIDTH TOP) */}
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          {/* Coin Selectors */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-3">
              1. Select Coins to Compare (Min 2 Required):
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableCoins.map((coin, idx) => {
                const isSelected = selectedCoins.includes(coin);
                return (
                  <button
                    key={coin}
                    onClick={() => toggleCoin(coin)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-105"
                        : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COIN_COLORS[idx % COIN_COLORS.length] }}
                    />
                    {coin}
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Coin & Timeframe */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
            <form onSubmit={handleAddCustomCoin} className="flex gap-3 min-w-[300px]">
              <input
                type="text"
                placeholder="Add other symbol (e.g. LINK, MATIC, PEPE)"
                value={customCoinInput}
                onChange={(e) => setCustomCoinInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                + Add Coin
              </button>
            </form>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase text-slate-400">Timeframe:</span>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value={7}>7 Days (168h)</option>
                <option value={14}>14 Days (336h)</option>
                <option value={30}>30 Days (720h)</option>
              </select>

              <button
                onClick={fetchCompareData}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                {loading ? "Fetching..." : "🔄 Refresh Live Data"}
              </button>
            </div>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="p-20 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-400 font-bold">Fetching live Binance data for {selectedCoins.join(", ")}...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300">
            <p className="font-bold flex items-center gap-2">⚠️ Connection Error</p>
            <p className="text-sm mt-1 text-rose-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* 1. LIVE CARDS: REAL RETURNS % & LIVE PRICE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.bar_chart_stats?.map((stat, idx) => {
                const isUp = stat.total_return_pct >= 0;
                return (
                  <div key={stat.coin} className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-200">{stat.coin}</span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                        ${stat.latest_price}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-400">{days}-Day Return</span>
                        <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
                          {isUp ? "+" : ""}{stat.total_return_pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isUp ? "bg-emerald-500" : "bg-rose-500"}`}
                          style={{ width: `${Math.min(Math.abs(stat.total_return_pct) * 3 + 10, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                      <span>Vol: {stat.volatility}%</span>
                      <span>High: ${stat.max_price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. GRAPH 1: NORMALIZED PRICE PERFORMANCE TRENDS (LINE GRAPH) */}
            {data?.normalized_trends && (
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    📈 Comparative Price Performance (Base 100 Scale)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Normalizes all asset starting prices to 100 to allow direct performance comparison regardless of price scale.
                  </p>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.normalized_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
                      <Legend />
                      {data.coins?.map((coin, idx) => (
                        <Line
                          key={coin}
                          type="monotone"
                          dataKey={coin}
                          stroke={COIN_COLORS[idx % COIN_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3. GRAPH 2: REAL CORRELATION MATRIX HEATMAP */}
            {data?.correlation_matrix && (
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    🧬 Pearson Correlation Heatmap Matrix
                  </h2>
                  <p className="text-xs text-slate-400">
                    Green = Strong Positive Movement (+1.0), Red = Inverse Movement (-1.0).
                  </p>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-center border-separate border-spacing-2">
                    <thead>
                      <tr>
                        <th className="p-3 text-left text-xs font-bold text-slate-400 uppercase">Asset</th>
                        {Object.keys(data.correlation_matrix).map((coin) => (
                          <th key={coin} className="p-3 text-xs font-bold text-slate-300">
                            {coin}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.correlation_matrix).map(([coinRow, rowValues]) => (
                        <tr key={coinRow}>
                          <td className="p-3 text-left font-bold text-xs bg-slate-800/50 rounded-xl text-slate-200">
                            {coinRow}
                          </td>
                          {Object.keys(data.correlation_matrix).map((coinCol) => {
                            const val = rowValues[coinCol];
                            return (
                              <td key={coinCol} className="p-1">
                                <div
                                  style={{ backgroundColor: getHeatmapBg(val) }}
                                  className="py-4 px-3 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-inner"
                                >
                                  {typeof val === "number" ? val.toFixed(2) : val}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. GRAPH 3: RETURNS & VOLATILITY BAR CHART */}
            {data?.bar_chart_stats && (
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    📊 Asset Volatility & Total Return Comparison
                  </h2>
                  <p className="text-xs text-slate-400">Annualized volatility vs total percentage return over {days} days.</p>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bar_chart_stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="coin" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
                      <Legend />
                      <Bar dataKey="total_return_pct" name="Total Return %" fill="#10b981">
                        {data.bar_chart_stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.total_return_pct >= 0 ? "#10b981" : "#f43f5e"} />
                        ))}
                      </Bar>
                      <Bar dataKey="volatility" name="Volatility %" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}
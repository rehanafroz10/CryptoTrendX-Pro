import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { 
  TrendingUp, Search, Calendar, BarChart2, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldAlert,
  Activity, ArrowLeft, Database, Sparkles
} from 'lucide-react';

export default function TrendsPage() {
  const router = useRouter();
  const [coinId, setCoinId] = useState('ETHUSDT');
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trendsData, setTrendsData] = useState(null);

  const presetCoins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];

  const fetchTrends = async (selectedCoin = coinId, selectedDays = days) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/v1/trends', {
        params: {
          coin_id: selectedCoin,
          days: parseInt(selectedDays, 10) || 1
        }
      });
      setTrendsData(res.data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
      setError(
        err.response?.data?.detail || 
        'Backend se trend data fetch nahi ho paya. Please verify backend server.'
      );
      setTrendsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(coinId, days);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (coinId.trim()) {
      fetchTrends(coinId.toUpperCase().trim(), days);
    }
  };

  const getSummaryStats = () => {
    if (!trendsData?.trend_data || trendsData.trend_data.length === 0) return null;
    const items = trendsData.trend_data;
    
    let maxHigh = -Infinity;
    let maxHighIdx = 0;
    let minLow = Infinity;
    let minLowIdx = 0;
    let totalVol = 0;

    items.forEach((item, idx) => {
      if (item.high > maxHigh) {
        maxHigh = item.high;
        maxHighIdx = idx;
      }
      if (item.low < minLow) {
        minLow = item.low;
        minLowIdx = idx;
      }
      totalVol += (item.volume || 0);
    });

    const latestClose = items[items.length - 1]?.close || 0;
    const initialOpen = items[0]?.open || 0;
    const priceChange = latestClose - initialOpen;
    const priceChangePct = initialOpen ? ((priceChange / initialOpen) * 100) : 0;

    return {
      maxHigh,
      maxHighIdx,
      minLow,
      minLowIdx,
      totalVol,
      latestClose,
      latestIdx: items.length - 1,
      priceChange,
      priceChangePct,
      count: items.length
    };
  };

  const stats = getSummaryStats();

  const renderSVGLineChart = () => {
    if (!trendsData?.trend_data || trendsData.trend_data.length === 0 || !stats) return null;
    
    const items = trendsData.trend_data;
    const width = 800;
    const height = 420; 
    const paddingX = 60;
    const paddingY = 50;

    const prices = items.map(d => Number(d.close));
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = (maxP - minP) || 1;

    const points = items.map((item, i) => {
      const x = paddingX + (i / Math.max(1, items.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((Number(item.close) - minP) / range) * (height - 2 * paddingY);
      return { x, y, item, idx: i };
    });

    const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    const highPt = points[stats.maxHighIdx] || points[0];
    const lowPt = points[stats.minLowIdx] || points[0];
    const latestPt = points[points.length - 1];

    return (
      <div className="w-full h-full flex flex-col justify-between">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-2xl">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

          {/* Area Fill & Main Line */}
          <path d={areaD} fill="url(#areaGrad)" />
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* HIGH DOT */}
          <g transform={`translate(${highPt.x}, ${highPt.y})`}>
            <circle r="11" fill="#10b981" opacity="0.3" className="animate-ping" />
            <circle r="6.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="-58" y="-32" width="116" height="24" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
            <text x="0" y="-16" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
              High: ${stats.maxHigh.toFixed(2)}
            </text>
          </g>

          {/* LOW DOT */}
          <g transform={`translate(${lowPt.x}, ${lowPt.y})`}>
            <circle r="11" fill="#f43f5e" opacity="0.3" className="animate-ping" />
            <circle r="6.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="-58" y="14" width="116" height="24" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="0" y="30" textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="bold" fontFamily="monospace">
              Low: ${stats.minLow.toFixed(2)}
            </text>
          </g>

          {/* CLOSE DOT */}
          <g transform={`translate(${latestPt.x}, ${latestPt.y})`}>
            <circle r="12" fill="#6366f1" opacity="0.4" className="animate-ping" />
            <circle r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="2.5" />
            <rect x="-62" y="-32" width="124" height="24" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2" />
            <text x="0" y="-16" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
              Close: ${stats.latestClose.toFixed(2)}
            </text>
          </g>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-800 text-xs font-bold">
          <span className="flex items-center gap-2 text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Period High Price
          </span>
          <span className="flex items-center gap-2 text-rose-400">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span> Period Low Price
          </span>
          <span className="flex items-center gap-2 text-indigo-400">
            <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span> Latest Close Price
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      <div className="w-full space-y-6">
        
        {/* HEADER & BACK BUTTON */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold shadow-md group"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Market Intelligence
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Market Trends Analysis
              </h1>
            </div>
          </div>

          <Link
            href="/market-data/coins"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-400" /> View All Coins
          </Link>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* 50-50 SPLIT GRID - NATURAL CARD HEIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT SIDE: QUERY FORM + FULL STATS CARDS */}
          <div className="space-y-5">
            
            {/* 1. Query Form Box */}
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                    <Search className="w-4 h-4 text-indigo-400" /> Coin ID (Query)
                  </label>
                  <input
                    type="text"
                    value={coinId}
                    onChange={(e) => setCoinId(e.target.value)}
                    placeholder="e.g. BTCUSDT"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-base font-bold text-white outline-none transition-all shadow-inner"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Days (Integer)
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-base font-bold text-white outline-none transition-all shadow-inner"
                  >
                    <option value={1}>1 Day (24 Hours)</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              {/* Quick Select Buttons & Submit Button */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Select:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {presetCoins.map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => {
                          setCoinId(coin);
                          fetchTrends(coin, days);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          coinId.toUpperCase() === coin
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white font-bold py-3 px-5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Fetching Market Trends...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" /> Get Market Trends
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 2. Market Analysis Stats Card (Proper Padding & Prominent Text) */}
            {stats && (
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-base">Market Analysis Data</h3>
                  </div>
                  <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-lg font-mono font-bold border border-indigo-800/80">
                    {trendsData?.coin_id}
                  </span>
                </div>

                {/* Latest Close Big Banner */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Latest Close Price</span>
                    <div className={`text-sm font-black flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                      stats.priceChange >= 0 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                    }`}>
                      {stats.priceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stats.priceChangePct.toFixed(2)}% ({stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(2)})
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                    ${stats.latestClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* High & Low Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Period High</span>
                    <p className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                      ${stats.maxHigh.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">Peak in {days} day(s)</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Period Low</span>
                    <p className="text-xl md:text-2xl font-black text-rose-400 font-mono">
                      ${stats.minLow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">Lowest in {days} day(s)</p>
                  </div>
                </div>

                {/* Volume & Record Count Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Period Volume</span>
                    <p className="text-lg font-black text-indigo-400 font-mono">
                      {stats.totalVol.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-indigo-400" /> Data Records
                    </span>
                    <p className="text-lg font-black text-slate-200 font-mono">
                      {stats.count} Data Points
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT SIDE: LINE GRAPH PANEL */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Interactive Trend Line Graph
                </h3>
                <p className="text-slate-400 text-xs">High, Low aur Close points highlighted with 3 dots</p>
              </div>
              <span className="text-xs text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono font-bold">
                {trendsData?.days || days} Day Window
              </span>
            </div>

            {loading ? (
              <div className="py-32 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-slate-400 text-xs font-semibold">Rendering Graph...</p>
              </div>
            ) : (
              renderSVGLineChart()
            )}
          </div>

        </div>

        {/* CANDLESTICK RAW DATA TABLE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Trends Raw Candlestick Data
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Backend API Time-Series records for <span className="text-indigo-400 font-bold">{trendsData?.coin_id || coinId}</span>
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center">
              <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
            </div>
          ) : trendsData?.trend_data && trendsData.trend_data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="py-3 px-4 font-bold">Timestamp</th>
                    <th className="py-3 px-4 font-bold text-right">Open ($)</th>
                    <th className="py-3 px-4 font-bold text-right">High ($)</th>
                    <th className="py-3 px-4 font-bold text-right">Low ($)</th>
                    <th className="py-3 px-4 font-bold text-right">Close ($)</th>
                    <th className="py-3 px-4 font-bold text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {trendsData.trend_data.map((row, idx) => {
                    const isUp = row.close >= row.open;
                    const formattedDate = row.timestamp 
                      ? new Date(row.timestamp).toLocaleString() 
                      : `Point #${idx + 1}`;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-sans text-slate-300 font-medium">{formattedDate}</td>
                        <td className="py-3 px-4 text-right text-slate-200">${Number(row.open).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-semibold">${Number(row.high).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right text-rose-400 font-semibold">${Number(row.low).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`py-3 px-4 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>${Number(row.close).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-right text-slate-400">${Number(row.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              Koi trend data nahi mila.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
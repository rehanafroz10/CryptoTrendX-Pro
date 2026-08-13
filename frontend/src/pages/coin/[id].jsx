import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PredictionCard from '../../components/PredictionCard';
import WhatIfCalculator from '../../components/WhatIfCalculator';
import { useLivePrices } from '../../services/websocket';
import { 
  ArrowLeft, Activity, TrendingUp, TrendingDown, 
  BarChart2, Target, ChevronDown, Search, X
} from 'lucide-react';
import Link from 'next/link';

const SUPPORTED_COINS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT"
];

export default function CoinDetail() {
  const router = useRouter();
  const { id } = router.query;
  const coinSymbol = (id || 'BTCUSDT').toUpperCase();
  const { priceData, isConnected } = useLivePrices(coinSymbol);

  // States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Search States
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Dropdown Change Handler
  const handleCoinChange = (e) => {
    const value = e.target.value;
    if (value === "CUSTOM") {
      setIsCustomMode(true);
    } else {
      router.push(`/coin/${value}`);
    }
  };

  // Custom Search Submit Handler
  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    let searchSymbol = customInput.trim().toUpperCase();
    
    // Agar user ne sirf 'DOGE' likha hai, toh 'USDT' khud add kar do
    if (!searchSymbol.endsWith('USDT')) {
      searchSymbol += 'USDT';
    }

    router.push(`/coin/${searchSymbol}`);
    setIsCustomMode(false);
    setCustomInput('');
  };

  // Fetch Analytics Data
  useEffect(() => {
    if (!id) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/analytics?coin_id=${coinSymbol}`);
        const data = await response.json();
        
        if (data.status === "success") {
          setAnalyticsData(data.analytics);
        }
      } catch (error) {
        console.error("Analytics fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, coinSymbol]);

  const TrendValue = ({ label, value }) => {
    const isPositive = value > 0;
    const isZero = value === 0;
    
    return (
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 hover:bg-slate-900 transition-colors">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className={`flex items-center gap-1.5 text-2xl font-bold ${
          isZero ? 'text-slate-300' : isPositive ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {!isZero && (isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
          {value > 0 ? '+' : ''}{value}%
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[100rem] mx-auto px-6 py-10 space-y-8 font-sans">
      
      {/* Header Section */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-6 gap-4">
        
        {/* DROPDOWN & CUSTOM SEARCH HEADER */}
        <div>
          {isCustomMode ? (
            /* Custom Search Input Box */
            <form onSubmit={handleCustomSearchSubmit} className="flex items-center gap-2 mt-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. DOGE, ADA, MATIC"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="bg-slate-900 border-2 border-indigo-500 text-white text-2xl font-bold rounded-2xl pl-4 pr-4 py-2 outline-none uppercase shadow-lg placeholder:text-slate-600 placeholder:normal-case placeholder:text-base w-64 md:w-80"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-2xl flex items-center justify-center transition-colors shadow-lg font-medium gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button 
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-3 rounded-2xl flex items-center justify-center transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            /* Dropdown Selector */
            <div className="flex items-center gap-3">
              <div className="relative group">
                <select
                  value={SUPPORTED_COINS.includes(coinSymbol) ? coinSymbol : "CUSTOM_ACTIVE"}
                  onChange={handleCoinChange}
                  className="appearance-none bg-slate-900 border border-slate-700 text-white text-3xl md:text-4xl font-black tracking-tight rounded-xl pl-4 pr-12 py-1 outline-none focus:border-indigo-500 hover:border-slate-600 transition-colors cursor-pointer shadow-sm"
                >
                  {/* Agar custom coin searched hai jo top 5 me nahi hai */}
                  {!SUPPORTED_COINS.includes(coinSymbol) && (
                    <option value="CUSTOM_ACTIVE" className="text-lg bg-slate-900 text-indigo-400">
                      {coinSymbol.replace('USDT', '/USDT')} (Custom)
                    </option>
                  )}
                  
                  {SUPPORTED_COINS.map((coin) => (
                    <option key={coin} value={coin} className="text-lg bg-slate-900">
                      {coin.replace('USDT', '/USDT')}
                    </option>
                  ))}
                  
                  {/* Custom Option */}
                  <option value="CUSTOM" className="text-lg bg-indigo-950 text-indigo-300 font-bold">
                    🔍 + Search Other Coin...
                  </option>
                </select>
                <ChevronDown className="w-8 h-8 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-300 transition-colors" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight hidden sm:block">Analytics</h1>
            </div>
          )}
          
          <p className="text-sm text-slate-400 mt-2">
            Live API stream and machine learning breakdown
          </p>
        </div>

        <div className="text-left md:text-right bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-800">
          <div className="text-lg font-mono text-emerald-400 flex items-center gap-2 font-bold">
            <Activity className="w-5 h-5 animate-pulse" />
            {priceData || 'Connecting...'}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {isConnected ? '🟢 WebSocket Connected' : '🔴 Connection Lost'}
          </div>
        </div>
      </div>

      {/* Grid 1: ML & Calculator Cards (With Dynamic Keys) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col">
          <PredictionCard key={coinSymbol} coinId={coinSymbol} />
        </div>
        <div className="flex flex-col">
          <WhatIfCalculator key={`calc-${coinSymbol}`} />
        </div>
      </div>

      {/* Grid 2: Backend Analytics Data */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 animate-pulse font-medium">
          Loading market analysis for {coinSymbol}...
        </div>
      ) : analyticsData ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Historical Trends Card */}
          <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800/50 pb-4">
              <BarChart2 className="w-7 h-7 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Historical Performance</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <TrendValue label="24 Hours" value={analyticsData.trends.change_1d} />
              <TrendValue label="7 Days" value={analyticsData.trends.change_7d} />
              <TrendValue label="14 Days" value={analyticsData.trends.change_14d} />
              <TrendValue label="30 Days" value={analyticsData.trends.change_28d} />
              <TrendValue label="6 Months" value={analyticsData.trends.change_6m} />
              <TrendValue label="1 Year" value={analyticsData.trends.change_1y} />
            </div>
          </div>

          {/* Technical Indicators Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800/50 pb-4">
              <Target className="w-7 h-7 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Technical Indicators</h2>
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                <span className="text-slate-400 font-medium">RSI (14)</span>
                <span className="text-white font-mono text-xl font-semibold">{analyticsData.indicators.rsi_14}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                <span className="text-slate-400 font-medium">SMA (20)</span>
                <span className="text-white font-mono text-xl font-semibold">{analyticsData.indicators.sma_20.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                <span className="text-slate-400 font-medium">SMA (50)</span>
                <span className="text-white font-mono text-xl font-semibold">{analyticsData.indicators.sma_50?.toLocaleString() || '--'}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                <span className="text-slate-400 font-medium">Volatility (30d)</span>
                <span className="text-white font-mono text-xl font-semibold">{analyticsData.indicators.volatility_30d_pct}%</span>
              </div>
              
              <div className="flex justify-between items-center py-4 mt-2">
                <span className="text-slate-400 font-medium">Market Signal</span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${
                  analyticsData.indicators.market_signal === 'NEUTRAL' ? 'bg-slate-700 text-slate-200' : 
                  analyticsData.indicators.market_signal === 'BULLISH' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                  'bg-rose-900/50 text-rose-400 border border-rose-800'
                }`}>
                  {analyticsData.indicators.market_signal}
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
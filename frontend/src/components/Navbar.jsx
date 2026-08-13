import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import { 
  Menu, X, TrendingUp, Activity, BarChart2, 
  Sparkles, Wrench, LogIn, UserPlus, 
  ChevronDown, ChevronRight, Grid, GitCompare, Home 
} from 'lucide-react';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketDataOpen, setIsMarketDataOpen] = useState(false);
  const [topCoins, setTopCoins] = useState([]);
  const [loadingTicker, setLoadingTicker] = useState(true);

  // Live Top 5 Coins Fetcher
  useEffect(() => {
    const fetchLiveTopCoins = async () => {
      try {
        const res = await api.get('/api/v1/trends');
        let rawData = Array.isArray(res.data) 
          ? res.data 
          : res.data?.trends || res.data?.data || [];

        if (!rawData || rawData.length === 0) throw new Error("Empty backend data");

        const formatted = rawData.slice(0, 5).map((item) => {
          const changeStr = String(item.h24 || item.change || '0%');
          return {
            symbol: item.symbol || item.coin || 'CRYPT',
            price: item.price ? (String(item.price).startsWith('$') ? item.price : `$${item.price}`) : '$0.00',
            change: changeStr,
            isUp: !changeStr.startsWith('-')
          };
        });
        setTopCoins(formatted);
      } catch (err) {
        try {
          const binanceRes = await fetch(
            'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT"]'
          );
          const bData = await binanceRes.json();
          if (Array.isArray(bData)) {
            const formatted = bData.map((item) => {
              const changeNum = parseFloat(item.priceChangePercent);
              const priceNum = parseFloat(item.lastPrice);
              return {
                symbol: item.symbol.replace('USDT', '/USDT'),
                price: `$${priceNum > 10 ? priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : priceNum.toFixed(4)}`,
                change: `${changeNum >= 0 ? '+' : ''}${changeNum.toFixed(2)}%`,
                isUp: changeNum >= 0
              };
            });
            setTopCoins(formatted);
          }
        } catch (binanceErr) {
          console.error('Ticker Fetch Error:', binanceErr);
        }
      } finally {
        setLoadingTicker(false);
      }
    };

    fetchLiveTopCoins();
    const interval = setInterval(fetchLiveTopCoins, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-40">
      {/* 1. MAIN HEADER NAVBAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span>CryptoTrend<span className="text-indigo-500">X</span> Pro</span>
        </Link>

        {/* Center Desktop Quick Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
            <Home className="w-4 h-4 text-indigo-400" /> Dashboard
          </Link>
          <Link href="/market-data/coins" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
            <Grid className="w-4 h-4 text-indigo-400" /> All Coins
          </Link>
          <Link href="/market-data/trends" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Predictions
          </Link>
        </div>

        {/* Right CTA + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              Sign Up
            </Link>
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
            aria-label="Open Navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 2. TOP LIVE TICKER */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-xs py-2 px-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-6 min-w-max">
          <span className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Live Market Top 5:
          </span>

          {loadingTicker && topCoins.length === 0 ? (
            <span className="text-slate-500 text-xs animate-pulse">Connecting to live feeds...</span>
          ) : (
            topCoins.map((coin, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <span className="font-semibold text-slate-300">{coin.symbol}</span>
                <span className="font-mono text-white">{coin.price}</span>
                <span className={`font-mono text-[11px] ${coin.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coin.change}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. OVERLAY & DRAWER SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity flex justify-end"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="w-80 bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                <span className="font-bold text-lg text-white tracking-wide">Menu Navigation</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all font-medium text-sm"
                >
                  <Home className="w-5 h-5 text-indigo-400" />
                  Dashboard
                </Link>

                {/* ACCORDION MARKET DATA */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsMarketDataOpen(!isMarketDataOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-5 h-5 text-indigo-400" />
                      <span>Market Data</span>
                    </div>
                    {isMarketDataOpen ? (
                      <ChevronDown className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isMarketDataOpen && (
                    <div className="bg-slate-900/90 border-t border-slate-800/80 py-2 px-3 space-y-1">
                      <Link
                        href="/market-data/coins"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <Grid className="w-4 h-4" /> Get All Coins
                      </Link>
                      <Link
                        href="/market-data/trends"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Get Trends
                      </Link>
                      {/* UPDATE: Route changed to /market-data/compare & Label to Compare Crypto */}
                      <Link
                        href="/market-data/compare"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <GitCompare className="w-4 h-4 text-cyan-400" /> Compare Crypto
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/coin/BTCUSDT"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all font-medium text-sm"
                >
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  Crypto Analytics
                </Link>

                <Link
                  href="/ai_prediction_and_sentiment"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all font-medium text-sm"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Prediction and Sentiment
                </Link>

                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all font-medium text-sm"
                >
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  Tools & ROI Calculator
                </Link>
              </nav>
            </div>

            {/* Sidebar Bottom Auth Buttons */}
            <div className="border-t border-slate-800 pt-6 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" /> Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-indigo-600/30"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
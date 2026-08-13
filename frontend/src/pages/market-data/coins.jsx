import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, RefreshCw, Search, 
  Sparkles, Grid, List, ArrowLeft 
} from 'lucide-react';

export default function MarketDataCoins() {
  const [top20Coins, setTop20Coins] = useState([]);
  const [allCoins, setAllCoins] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showAllView, setShowAllView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Top 20 Coins
  const fetchTop20 = async () => {
    setLoadingTop(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/coins?fetch_all=false');
      const data = await res.json();
      if (data.top_20) {
        setTop20Coins(data.top_20);
      }
    } catch (err) {
      console.error("Failed to fetch top 20 coins:", err);
    } finally {
      setLoadingTop(false);
    }
  };

  // Fetch All Binance Coins
  const fetchAllBinanceCoins = async () => {
    if (allCoins.length > 0) {
      setShowAllView(true);
      return;
    }
    setLoadingAll(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/coins?fetch_all=true');
      const data = await res.json();
      if (data.coins) {
        setAllCoins(data.coins);
        setShowAllView(true);
      }
    } catch (err) {
      console.error("Failed to fetch all coins:", err);
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    fetchTop20();
  }, []);

  const filteredAllCoins = allCoins.filter(symbol => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[100rem] mx-auto px-6 py-10 space-y-8 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Grid className="text-indigo-500 w-8 h-8" /> Market Data — Binance Coins
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time market tracking for Top 20 Volume Leaders & complete Binance listings.
          </p>
        </div>

        {/* Action Toggle Button */}
        <div className="flex items-center gap-3">
          {!showAllView ? (
            <button
              onClick={fetchAllBinanceCoins}
              disabled={loadingAll}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {loadingAll ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <List className="w-5 h-5" />
              )}
              <span>Get All Binance Coins ({loadingAll ? 'Loading...' : 'All Pairs'})</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAllView(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-colors"
            >
              <Grid className="w-5 h-5 text-indigo-400" />
              <span>Back to Top 20 Cards</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: TOP 20 COINS WITH GRAPHS */}
      {!showAllView ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Top 20 Volume Leaders
            </h2>
            <button onClick={fetchTop20} className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
          </div>

          {loadingTop ? (
            <div className="text-center py-20 text-slate-500 animate-pulse font-medium">
              Fetching Top 20 Coins from Binance...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {top20Coins.map((coin) => {
                const isPositive = coin.change_24h >= 0;
                return (
                  <div key={coin.symbol} className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 backdrop-blur-sm transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-white">{coin.symbol.replace('USDT', '')}</h3>
                          <span className="text-xs text-slate-500 font-mono">/ USDT</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          isPositive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {coin.change_24h.toFixed(2)}%
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <p className="text-2xl font-mono font-bold text-white">
                          ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Vol: ${(coin.volume / 1e6).toFixed(2)}M
                        </p>
                      </div>

                      {/* Mini Live Sparkline Chart Representation */}
                      <div className="h-12 w-full bg-slate-950/60 rounded-xl p-2 border border-slate-800/60 flex items-end gap-1 overflow-hidden">
                        {[40, 55, 30, 65, 50, 80, 75, 90, isPositive ? 100 : 20].map((val, idx) => (
                          <div 
                            key={idx} 
                            style={{ height: `${val}%` }} 
                            className={`flex-1 rounded-t-sm ${isPositive ? 'bg-emerald-500/60' : 'bg-rose-500/60'}`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <Link 
                      href={`/coin/${coin.symbol}`}
                      className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold text-center block transition-colors"
                    >
                      View Full Analytics & AI Prediction →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: ALL BINANCE LISTED COINS (NO GRAPH LIST VIEW) */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <div>
              <h2 className="text-xl font-bold text-white">All Binance Listed USDT Pairs ({allCoins.length})</h2>
              <p className="text-xs text-slate-400 mt-1">Lightweight listing without heavy charts for fast performance.</p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coin (e.g. PEPE, SHIB)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none uppercase placeholder:normal-case placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredAllCoins.map((symbol) => (
              <Link
                key={symbol}
                href={`/coin/${symbol}`}
                className="bg-slate-900/40 border border-slate-800 hover:border-indigo-500 p-3.5 rounded-2xl flex justify-between items-center text-slate-300 hover:text-indigo-400 transition-colors group"
              >
                <span className="font-mono font-bold text-sm">{symbol}</span>
                <span className="text-xs text-slate-600 group-hover:text-indigo-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
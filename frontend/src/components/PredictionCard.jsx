import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

export default function PredictionCard({ coinId = 'BTCUSDT' }) {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/predict/${coinId}`);;
        const data = await res.json();

        // Backend Response Handling
        if (data.prediction) {
          setPredictionData(data.prediction);
        } else {
          setPredictionData(data);
        }
      } catch (err) {
        console.error('Failed to fetch prediction:', err);
      } finally {
        setLoading(false);
      }
    };

    if (coinId) {
      fetchPrediction();
    }
  }, [coinId]);

  const symbolDisplay = coinId.toUpperCase();

  // Backend Keys Mapping
  const currentPrice = predictionData?.current_price;
  const trendDirection = predictionData?.trend_direction || 'NEUTRAL';
  const isUp = trendDirection.toLowerCase().includes('up');
  
  const confidenceScore = predictionData?.confidence_score_pct ?? 50;
  
  // Nested price_prediction object se extract kar rahe hain
  const targetPrice = predictionData?.price_prediction?.target_price;
  const minPrice = predictionData?.price_prediction?.expected_range?.min;
  const maxPrice = predictionData?.price_prediction?.expected_range?.max;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800/50 pb-4 mb-6">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
          <Sparkles className="w-5 h-5" />
          <span>{symbolDisplay} AI Prediction</span>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-medium">
          {predictionData?.prediction_timeframe || 'Next 48 Hours'}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 animate-pulse font-medium">
          Calculating AI Prediction for {symbolDisplay}...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Signal Box */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${
            isUp 
              ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-400' 
              : 'bg-rose-950/20 border-rose-800/50 text-rose-400'
          }`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Predicted Signal
              </p>
              <div className="flex items-center gap-2 text-2xl font-black">
                {isUp ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                <span>{trendDirection}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Current Price
              </p>
              <p className="text-xl font-mono font-bold text-white">
                {currentPrice ? `$${Number(currentPrice).toLocaleString()}` : '--'}
              </p>
            </div>
          </div>

          {/* AI Confidence Score Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-400">AI Confidence Score</span>
              <span className="text-white font-mono font-bold">
                {Number(confidenceScore).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(confidenceScore, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Target & Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium mb-1">Target Price</p>
              <p className="text-lg font-mono font-bold text-emerald-400">
                {targetPrice ? `$${Number(targetPrice).toLocaleString()}` : '--'}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium mb-1">Expected Price Range</p>
              <p className="text-sm font-mono font-semibold text-slate-200">
                {minPrice && maxPrice 
                  ? `$${Number(minPrice).toLocaleString()} – $${Number(maxPrice).toLocaleString()}`
                  : '--'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
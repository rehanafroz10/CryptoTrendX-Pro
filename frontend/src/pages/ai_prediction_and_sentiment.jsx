import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const API_BASE_URL = "http://127.0.0.1:8000";

// Custom High Contrast Tooltip to fix Black-on-Black text issue on Hover
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-2 border-indigo-500/80 p-3 rounded-xl shadow-2xl text-white font-sans">
        {label && <p className="text-xs font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">{label}</p>}
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm font-extrabold" style={{ color: entry.color || entry.fill || '#38bdf8' }}>
            {entry.name || entry.dataKey}: <span className="text-white font-mono">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AIPredictionAndSentiment() {
  const [coinId, setCoinId] = useState("BTCUSDT");
  const [customCoin, setCustomCoin] = useState("");
  const [hours, setHours] = useState(1000); // Dynamic Training Hours State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic fetch function accepting symbol & selected hours
  const fetchPrediction = async (symbol, trainingHours) => {
    try {
      setLoading(true);
      setError(null);
      const targetUrl = `${API_BASE_URL}/api/v1/predict/${symbol}?hours=${trainingHours}`;
      console.log("🚀 Hitting Backend API URL:", targetUrl);
      
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`Server Status: ${res.status}`);
      const json = await res.json();
      
      if (json.status === "error") {
        throw new Error(json.message || "Failed to fetch prediction.");
      }
      
      console.log("✅ API Response Received:", json);
      setData(json);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setError(err.message || "Failed to fetch prediction and sentiment data from API.");
    } finally {
      setLoading(false);
    }
  };

  // FIX: Page Load aur coinId ya hours Change Hone Par Auto-Fetch Trigger Karein
  useEffect(() => {
    fetchPrediction(coinId, hours);
  }, [coinId, hours]);

  // Handler for custom/new coin form submission
  const handleAddCustomCoin = (e) => {
    e.preventDefault();
    if (customCoin.trim() !== "") {
      const formattedCoin = customCoin.toUpperCase().trim();
      setCoinId(formattedCoin);
      setCustomCoin("");
    }
  };

  // Hour Select Handler (State Update + Instant Fetch Call)
  const handleHourSelect = (selectedHour) => {
    setHours(selectedHour);
    fetchPrediction(coinId, selectedHour);
  };

  // Data Formatting safely unwrapping prediction object
  const pred = data?.prediction || data;

  const priceRangeData = pred?.price_prediction
    ? [
        { label: "Min Range", price: pred.price_prediction.expected_range.min },
        { label: "Current Price", price: pred.current_price },
        { label: "Target Price", price: pred.price_prediction.target_price },
        { label: "Max Range", price: pred.price_prediction.expected_range.max }
      ]
    : [];

  const probData = pred?.raw_probabilities
    ? [
        { name: "UP Prob (%)", value: pred.raw_probabilities.up_probability, color: "#10b981" },
        { name: "DOWN Prob (%)", value: pred.raw_probabilities.down_probability, color: "#f43f5e" }
      ]
    : [];

  const shapData = pred?.shap_explainability?.top_influencing_features
    ? Object.entries(pred.shap_explainability.top_influencing_features).map(([key, val]) => ({
        feature: key,
        impact: val,
        fill: val >= 0 ? "#10b981" : "#f43f5e"
      }))
    : [];

  const sentimentRadarData = data?.final_decision?.breakdown
    ? [
        { subject: "Technical ML", score: data.final_decision.breakdown.technical_score },
        { subject: "News Sentiment", score: data.final_decision.breakdown.news_sentiment_score },
        { subject: "Fear & Greed", score: data.final_decision.breakdown.fear_and_greed_score }
      ]
    : [];

  return (
    <>
      <Head>
        <title>AI Prediction & Sentiment Intelligence | CryptoTrendX Pro</title>
      </Head>

      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-8">
        
        {/* HEADER SECTION WITH BACK BUTTON */}
        <div className="border-b border-slate-800 pb-5 space-y-3">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-200 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-md cursor-pointer"
            >
              ⬅️ Back to Dashboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              🤖 AI Predictions & Sentiment Analytics Hub
            </h1>
            <p className="text-slate-400 text-base mt-1">
              Complete Model Explainability (SHAP), Multi-Model Decision, Directional Probabilities, and Evaluation Metrics.
            </p>
          </div>
        </div>

        {/* COIN SELECTOR + CUSTOM COIN + DYNAMIC HOURS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
          
          {/* Symbol Buttons & Add Custom Coin Form */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select / Add Coin:</span>
            {["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"].map((sym) => (
              <button
                key={sym}
                onClick={() => setCoinId(sym)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  coinId === sym
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {sym}
              </button>
            ))}

            {/* Custom Coin Search/Add Input */}
            <form onSubmit={handleAddCustomCoin} className="flex items-center gap-2 ml-1">
              <input
                type="text"
                placeholder="e.g. DOGEUSDT"
                value={customCoin}
                onChange={(e) => setCustomCoin(e.target.value)}
                className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md"
              >
                ➕ Add
              </button>
            </form>
          </div>

          {/* Dynamic Training Hours Selector & Refresh Button */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Training Hours:</span>
            {[500, 1000, 1500, 2000].map((h) => (
              <button
                key={h}
                onClick={() => handleHourSelect(h)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                  hours === h
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-md scale-105"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {h}h
              </button>
            ))}

            <button
              onClick={() => fetchPrediction(coinId, hours)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700 ml-2"
            >
              🔄 Refresh
            </button>
          </div>

        </div>

        {loading ? (
          <div className="p-24 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-300 font-bold text-lg">Running XGBoost Inference ({hours} Hours Dataset) for {coinId}...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-950/50 border border-rose-800 rounded-2xl text-rose-300 text-base font-bold">
            ⚠️ {error}
          </div>
        ) : (
          <div className="space-y-8">

            {/* BLOCK 1: FINAL DECISION & PRICE PROJECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT CARD */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">FINAL DECISION</span>
                    <span className="text-xs font-bold font-mono text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
                      {pred?.prediction_timeframe}
                    </span>
                  </div>

                  <div className="text-4xl font-black text-white mb-3 tracking-wide">
                    {data?.final_decision?.final_decision || pred?.trend_direction}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-semibold text-slate-400">Combined Confidence:</span>
                    <span className="text-lg font-black text-indigo-400 font-mono">
                      {data?.final_decision?.combined_confidence_score || pred?.confidence_score_pct}%
                    </span>
                    <span className="text-sm font-semibold text-slate-400 ml-2">Trend:</span>
                    <span className="text-base font-black text-emerald-400">{pred?.trend_direction}</span>
                  </div>

                  {/* PRICE STATS */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 font-mono">
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <p className="text-slate-400 text-xs font-bold uppercase">Current Price</p>
                      <p className="text-xl font-extrabold text-white mt-1">${pred?.current_price}</p>
                    </div>
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <p className="text-slate-400 text-xs font-bold uppercase">Target Price</p>
                      <p className="text-xl font-extrabold text-emerald-400 mt-1">${pred?.price_prediction?.target_price}</p>
                    </div>
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <p className="text-slate-400 text-xs font-bold uppercase">Expected Min</p>
                      <p className="text-base font-bold text-rose-400 mt-1">${pred?.price_prediction?.expected_range?.min}</p>
                    </div>
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60">
                      <p className="text-slate-400 text-xs font-bold uppercase">Expected Max</p>
                      <p className="text-base font-bold text-emerald-400 mt-1">${pred?.price_prediction?.expected_range?.max}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <p className="font-bold text-slate-300 mb-1.5">Decision Weights Used:</p>
                  <div className="flex justify-between font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span>Technical ML: {data?.final_decision?.weights_used?.technical_ml || "70%"}</span>
                    <span>News: {data?.final_decision?.weights_used?.news_sentiment || "15%"}</span>
                    <span>F&G: {data?.final_decision?.weights_used?.fear_and_greed || "15%"}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT GRAPH */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">📊 Price Range Projection & Target Bounds</h3>
                  <p className="text-sm text-slate-400 mt-1">Current market price vs expected min/max and target price</p>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceRangeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" domain={['dataMin - 1000', 'dataMax + 1000']} tick={{ fontSize: 12, fill: "#cbd5e1" }} />
                      <YAxis type="category" dataKey="label" stroke="#cbd5e1" tick={{ fontSize: 13, fill: "#ffffff", fontWeight: "bold" }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="price" name="Price ($)" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* BLOCK 2: RAW PROBABILITIES & EVALUATION METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT CARD */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">🎯 Raw Model Probabilities</h3>
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60 text-center">
                      <p className="text-slate-400 text-xs font-bold">UP PROBABILITY</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{pred?.raw_probabilities?.up_probability}%</p>
                    </div>
                    <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60 text-center">
                      <p className="text-slate-400 text-xs font-bold">DOWN PROBABILITY</p>
                      <p className="text-2xl font-black text-rose-400 mt-1">{pred?.raw_probabilities?.down_probability}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-lg font-bold text-white">📐 Model Evaluation Metrics</h3>
                  <div className="space-y-2.5 text-sm font-mono">
                    <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className="text-slate-300">Directional Accuracy:</span>
                      <span className="font-extrabold text-indigo-400">{pred?.evaluation_metrics?.directional_accuracy_pct}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className="text-slate-300">Mean Absolute Error (MAE):</span>
                      <span className="font-extrabold text-white">{pred?.evaluation_metrics?.mean_absolute_error_mae}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className="text-slate-300">Mean Squared Error (MSE):</span>
                      <span className="font-extrabold text-white">{pred?.evaluation_metrics?.mean_squared_error_mse}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT GRAPH */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">🥧 Directional Probability Ratio</h3>
                  <p className="text-sm text-slate-400 mt-1">Visual classification probability output from XGBoost Classifier</p>
                </div>

                <div className="h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={probData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {probData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px", fontWeight: "bold" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* BLOCK 3: SHAP EXPLAINABILITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT CARD */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">🔍 SHAP Explainability Engine</h3>
                  
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {pred?.shap_explainability?.interpretation}
                  </p>

                  <div className="p-4 bg-slate-800/60 rounded-xl text-sm space-y-2 border border-slate-700/80">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 bg-emerald-500 rounded-full inline-block shrink-0"></span>
                      <span className="text-slate-200"><strong>Green (+ Positive Values):</strong> Model ko UP direction mein push kar rahe hain.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 bg-rose-500 rounded-full inline-block shrink-0"></span>
                      <span className="text-slate-200"><strong>Red (- Negative Values):</strong> Model ko DOWN direction mein push kar rahe hain.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono">
                  <p><strong>Algorithms Used:</strong> {pred?.model_info?.algorithms}</p>
                  <p><strong>Training Dataset Size:</strong> {pred?.model_info?.training_samples_hours} Hours</p>
                </div>
              </div>

              {/* RIGHT GRAPH */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">📊 Top Influencing Feature Impact (SHAP Values)</h3>
                  <p className="text-sm text-slate-400 mt-1">Positive (Green) vs Negative (Red) feature impacts on price prediction</p>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapData} layout="vertical" margin={{ left: 30, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12, fill: "#cbd5e1" }} />
                      <YAxis type="category" dataKey="feature" stroke="#cbd5e1" tick={{ fontSize: 12, fill: "#ffffff", fontWeight: "bold" }} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="impact" name="SHAP Impact" radius={[4, 4, 4, 4]}>
                        {shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* BLOCK 4: SENTIMENT ANALYSIS & RADAR GRAPH */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT CARD */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
                <h3 className="text-lg font-bold text-white">🗞️ Market Sentiment Metrics</h3>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="p-4 bg-slate-800/60 rounded-xl flex justify-between items-center border border-slate-700/60">
                    <span className="text-slate-300">Fear & Greed Index:</span>
                    <span className="text-lg font-black text-amber-400">{data?.sentiment?.fng || "50"} / 100</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-xl flex justify-between items-center border border-slate-700/60">
                    <span className="text-slate-300">News Sentiment Score:</span>
                    <span className="text-lg font-black text-emerald-400">{data?.sentiment?.news_score || "65"}%</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-xl flex justify-between items-center border border-slate-700/60">
                    <span className="text-slate-300">Technical ML Score:</span>
                    <span className="text-lg font-black text-indigo-400">{data?.final_decision?.breakdown?.technical_score || pred?.confidence_score_pct}%</span>
                  </div>
                </div>
              </div>

              {/* RIGHT GRAPH */}
              <div className="bg-slate-900/90 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">🕸️ Multi-Factor Sentiment Radar Analysis</h3>
                  <p className="text-sm text-slate-400 mt-1">Comparison across Technical ML, News Sentiment, and Fear & Greed Index</p>
                </div>

                <div className="h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sentimentRadarData}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="subject" stroke="#ffffff" tick={{ fontSize: 13, fontWeight: "bold" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                      <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.65} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </>
  );
}
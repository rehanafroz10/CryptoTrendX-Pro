export default function CorrelationHeatmap() {
  const coins = ['BTC', 'ETH', 'SOL', 'BNB'];
  const matrix = [
    [1.00, 0.85, 0.62, 0.71],
    [0.85, 1.00, 0.74, 0.68],
    [0.62, 0.74, 1.00, 0.55],
    [0.71, 0.68, 0.55, 1.00],
  ];

  const getColor = (val) => {
    if (val === 1) return 'bg-indigo-600 text-white';
    if (val > 0.8) return 'bg-emerald-600 text-white';
    if (val > 0.6) return 'bg-emerald-800/70 text-slate-200';
    return 'bg-slate-800 text-slate-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
      <h3 className="font-semibold text-lg mb-4">Correlation Matrix</h3>
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        <div></div>
        {coins.map((c) => (
          <div key={c} className="font-bold text-slate-400 py-1">{c}</div>
        ))}
        {matrix.map((row, i) => (
          <div key={i} className="contents">
            <div className="font-bold text-slate-400 flex items-center justify-center">{coins[i]}</div>
            {row.map((val, j) => (
              <div
                key={j}
                className={`p-3 rounded font-mono font-medium ${getColor(val)}`}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
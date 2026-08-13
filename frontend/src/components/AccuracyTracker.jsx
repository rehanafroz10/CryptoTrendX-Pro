export default function AccuracyTracker({ accuracyPercent = 0, sampleSize = 0 }) {
  return (
    <div className="p-4 bg-gray-900 rounded-xl text-white">
      <h3 className="text-lg font-semibold mb-1">Model Accuracy Tracker</h3>
      <p className="text-3xl font-bold text-blue-400">{accuracyPercent}%</p>
      <p className="text-gray-400 text-sm">based on last {sampleSize} resolved predictions</p>
    </div>
  );
}

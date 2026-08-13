import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PriceChart({ data }) {
  // data: [{ date: "2026-01-01", price: 45000 }, ...]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#4ade80" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

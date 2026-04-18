import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function EquityChart({ data }) {
  return (
    <section className="analytics-chart card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Equity curve</p>
          <h3>Performance over time</h3>
        </div>
      </div>
      <div className="chart-wrapper">
        {data.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Equity"]}
                contentStyle={{ background: "rgba(15, 23, 42, 0.96)", borderRadius: 16, border: "1px solid rgba(148, 163, 184, 0.2)" }}
              />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#60a5fa" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No equity history available.</div>
        )}
      </div>
    </section>
  );
}

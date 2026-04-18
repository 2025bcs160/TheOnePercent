export default function MetricsCards({ stats, formatMoney }) {
  const cards = [
    { label: "Total trades", value: stats.totalTrades || "–" },
    { label: "Win rate", value: stats.totalTrades ? `${stats.winRate}%` : "–" },
    { label: "Profit factor", value: stats.profitFactor ? stats.profitFactor : "–" },
    { label: "Net profit", value: stats.totalTrades ? formatMoney(stats.totalProfit) : "–" },
  ];

  return (
    <section className="analytics-metrics card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Core metrics</p>
          <h3>Trusted performance KPIs</h3>
        </div>
      </div>
      <div className="metrics-grid">
        {cards.map((card) => (
          <div key={card.label} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

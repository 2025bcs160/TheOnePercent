export default function InsightsPanel({ bestSymbol, bestDay, averageRR, riskInsight }) {
  const items = [
    { label: "Best symbol", value: bestSymbol },
    { label: "Best day", value: bestDay },
    { label: "Risk summary", value: averageRR ? `${averageRR}x R ratio` : "–" },
  ];

  return (
    <section className="analytics-insights card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h3>Actionable signals</h3>
        </div>
      </div>
      <div className="insights-grid">
        {items.map((item) => (
          <div key={item.label} className="insight-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
      <p className="insights-note">{riskInsight}</p>
    </section>
  );
}

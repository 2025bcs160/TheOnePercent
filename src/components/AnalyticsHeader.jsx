export default function AnalyticsHeader({ connected, accountLabel, connectionStatus }) {
  return (
    <section className="analytics-header card">
      <div className="analytics-header-top">
        <div>
          <p className="eyebrow">Analytics Dashboard</p>
          <h2>Trade performance & account health</h2>
        </div>
        <div className="analytics-header-status">
          <span className={`status-pill ${connected ? "positive" : "negative"}`}>
            {connected ? "Connected" : "Disconnected"}
          </span>
          {accountLabel ? <span className="analytics-header-chip">{accountLabel}</span> : null}
        </div>
      </div>
      {connectionStatus ? <p className="analytics-header-note">{connectionStatus}</p> : null}
    </section>
  );
}

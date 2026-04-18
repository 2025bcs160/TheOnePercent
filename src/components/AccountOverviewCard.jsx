export default function AccountOverviewCard({ accountInfo, isConnected }) {
  const data = [
    { label: "Broker", value: accountInfo?.broker || "–" },
    { label: "Server", value: accountInfo?.server || "–" },
    { label: "Login", value: accountInfo?.login || "–" },
    { label: "Platform", value: accountInfo?.platform || "–" },
  ];

  return (
    <section className="analytics-account card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Account overview</p>
          <h3>MT5 account details</h3>
        </div>
      </div>
      <div className="account-grid">
        {data.map((item) => (
          <div key={item.label} className="account-grid-item">
            <span>{item.label}</span>
            <strong>{isConnected ? item.value : "–"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

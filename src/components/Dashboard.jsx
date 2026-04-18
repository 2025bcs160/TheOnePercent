import { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { ArrowUpRight, CheckCircle2, DollarSign, Eye, Star, TrendingUp, Wallet, TrendingDown, Target } from "lucide-react";

export default function Dashboard({ trades = [], accountBalance = 10000, accountMode = "Live" }) {
  const activeTrades = trades;

  const {
    totalTrades,
    totalProfit,
    winRate,
    equityCurve,
    currentEquity,
    growth,
    profitFactor,
    averageRR,
    maxDrawdown,
    riskPerTrade,
    avgWin,
    avgLoss,
    strategyBreakdown,
  } = useMemo(() => {
    const sortedTrades = [...activeTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalTrades = sortedTrades.length;
    const wins = sortedTrades.filter((trade) => Number(trade.profit) > 0);
    const losses = sortedTrades.filter((trade) => Number(trade.profit) < 0);
    const winCount = wins.length;
    const totalProfit = Number(
      sortedTrades.reduce((sum, trade) => sum + Number(trade.profit || 0), 0).toFixed(2)
    );
    const winRate = totalTrades ? Number(((winCount / totalTrades) * 100).toFixed(1)) : 0;

    const avgWin = winCount > 0
      ? Number((wins.reduce((sum, trade) => sum + Number(trade.profit || 0), 0) / winCount).toFixed(2))
      : 0;
    const avgLoss = losses.length > 0
      ? Number((losses.reduce((sum, trade) => sum + Number(trade.profit || 0), 0) / losses.length).toFixed(2))
      : 0;

    let runningEquity = Number(accountBalance);
    const equityCurve = sortedTrades.map((trade) => {
      runningEquity += Number(trade.profit || 0);
      return {
        label: new Date(trade.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: Number(runningEquity.toFixed(2)),
      };
    });

    const currentEquity = equityCurve.length ? equityCurve[equityCurve.length - 1].value : Number(accountBalance);
    const growth = accountBalance ? Number((((currentEquity - accountBalance) / accountBalance) * 100).toFixed(1)) : 0;

    const grossProfit = wins.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
    const grossLoss = losses.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
    const profitFactor = grossLoss === 0 ? (grossProfit === 0 ? 0 : Infinity) : Number((grossProfit / Math.abs(grossLoss)).toFixed(2));
    const averageRR = totalTrades
      ? Number((sortedTrades.reduce((sum, trade) => sum + Number(trade.rr || 0), 0) / totalTrades).toFixed(2))
      : 0;

    let peak = Number(accountBalance);
    let maxDrawdown = 0;
    equityCurve.forEach((point) => {
      if (point.value > peak) peak = point.value;
      const drawdown = peak - point.value;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const riskPerTrade = totalTrades && accountBalance > 0
      ? Number((Math.abs(grossLoss) / (totalTrades * accountBalance) * 100).toFixed(2))
      : 0;

    const strategyBreakdown = sortedTrades.reduce((acc, trade) => {
      const strategy = trade.strategy || "Unknown";
      const existing = acc.find((s) => s.name === strategy);
      if (existing) {
        existing.wins += trade.profit > 0 ? 1 : 0;
        existing.losses += trade.profit < 0 ? 1 : 0;
        existing.profit += Number(trade.profit || 0);
      } else {
        acc.push({
          name: strategy,
          wins: trade.profit > 0 ? 1 : 0,
          losses: trade.profit < 0 ? 1 : 0,
          profit: Number(trade.profit || 0),
        });
      }
      return acc;
    }, []).map((s) => ({
      ...s,
      trades: s.wins + s.losses,
      winRate: s.trades > 0 ? Number(((s.wins / s.trades) * 100).toFixed(1)) : 0,
    }));

    return {
      totalTrades,
      totalProfit,
      winRate,
      equityCurve,
      currentEquity,
      growth,
      profitFactor,
      averageRR,
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      riskPerTrade,
      avgWin,
      avgLoss,
      strategyBreakdown,
    };
  }, [activeTrades, accountBalance]);

  const totalProfitFormatted = {
    label: totalProfit >= 0 ? `+$${totalProfit.toLocaleString()}` : `-$${Math.abs(totalProfit).toLocaleString()}`,
    className: totalProfit >= 0 ? "positive" : "negative",
  };

  const growthFormatted = {
    label: growth >= 0 ? `+${growth}%` : `${growth}%`,
    className: growth >= 0 ? "positive" : "negative",
  };

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todaysTrades = activeTrades.filter(
    (trade) => new Date(trade.date).toISOString().slice(0, 10) === todayKey
  );
  const todayPnL = todaysTrades.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
  const tradesClosedToday = todaysTrades.length;
  const tradesReviewed = activeTrades.filter((trade) => (trade.notes || "").trim().length > 0).length;
  const reviewTarget = Math.max(10, totalTrades);
  const reviewProgress = reviewTarget ? Math.round((tradesReviewed / reviewTarget) * 100) : 0;
  const chartData = equityCurve.map((point) => ({ date: point.label, equity: point.value }));

  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const sortedTableTrades = useMemo(() => {
    const normalized = [...activeTrades].map((trade) => ({
      ...trade,
      pair: trade.pair || trade.symbol || "EURUSD",
      type: trade.type || trade.side || "Buy",
      entryPrice: trade.entry || trade.entryPrice || trade.openPrice || 0,
      exitPrice: trade.exit || trade.exitPrice || trade.closePrice || 0,
      profit: Number(trade.profit || 0),
      result: Number(trade.profit || 0) >= 0 ? "Win" : "Loss",
      dateValue: trade.date ? new Date(trade.date).getTime() : 0,
    }));

    return normalized.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      if (sortField === "profit") {
        return (a.profit - b.profit) * direction;
      }
      return (a.dateValue - b.dateValue) * direction;
    });
  }, [activeTrades, sortDirection, sortField]);

  const pageCount = Math.max(1, Math.ceil(sortedTableTrades.length / rowsPerPage));
  const tableTrades = sortedTableTrades.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("desc");
    setCurrentPage(1);
  };

  const formatCurrency = (value) =>
    `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatMetric = (value, type = "money") => {
    const absValue = Math.abs(value);
    const formatted = type === "percent"
      ? `${absValue.toFixed(1)}%`
      : `$${absValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (value > 0) return { label: `↑ ${formatted}`, className: "positive" };
    if (value < 0) return { label: `↓ ${formatted}`, className: "negative" };
    return { label: `↔ ${formatted}`, className: "neutral" };
  };

  const recentJournal = [...activeTrades]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div className="page-section dashboard-page">
      <section className="card topbar-panel">
        <div className="topbar-value">
          <p className="eyebrow">Balance</p>
          <strong>{formatCurrency(accountBalance)}</strong>
        </div>
        <div className="topbar-value">
          <p className="eyebrow">Equity</p>
          <strong>${currentEquity.toLocaleString()}</strong>
        </div>
        <div className="topbar-value">
          <p className="eyebrow">Win Rate</p>
          <strong>{winRate}%</strong>
        </div>
        <div className="topbar-value topbar-mode">
          <p className="eyebrow">Mode</p>
          <span className="mode-badge">{accountMode}</span>
        </div>
      </section>

      <section className="card dashboard-main">
        <div className="main-left">
          <div className="section-header">
            <div>
              <p className="eyebrow">Equity Curve</p>
              <h2>Account Performance</h2>
            </div>
          </div>
          <div className="equity-chart-wrapper">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={420}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(148, 163, 184, 0.22)",
                      borderRadius: 14,
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#cbd5e1" }}
                    formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Equity"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#c084fc"
                    strokeWidth={3}
                    fill="url(#equityGradient)"
                    fillOpacity={1}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No equity data.</div>
            )}
          </div>
        </div>

        <aside className="main-right">
          <div className="stat-stack">
            <div className="stat-stack-card">
              <p className="eyebrow">Current Equity</p>
              <strong>${currentEquity.toLocaleString()}</strong>
              <p className="stat-subtext">Live account value after trades</p>
            </div>
            <div className="stat-stack-card">
              <p className="eyebrow">Total Profit</p>
              <strong className={totalProfitFormatted.className}>{totalProfitFormatted.label}</strong>
              <p className="stat-subtext">Net gain from journaled trades</p>
            </div>
            <div className="stat-stack-card">
              <p className="eyebrow">Win Rate</p>
              <strong>{winRate}%</strong>
              <p className="stat-subtext">Success ratio across recorded trades</p>
            </div>
            <div className="stat-stack-card">
              <p className="eyebrow">Trade Growth</p>
              <strong className={growthFormatted.className}>{growthFormatted.label}</strong>
              <p className="stat-subtext">Performance change vs starting balance</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="card bottom-grid">
        <div className="bottom-panel bottom-table">
          <div className="section-header">
            <div>
              <p className="eyebrow">Trade Table</p>
              <h2>Recent Trades</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="trade-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Trade Type</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th onClick={() => handleSort("profit")} className="sortable">
                    Profit/Loss
                    {sortField === "profit" ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {tableTrades.length ? (
                  tableTrades.map((trade, index) => (
                    <tr key={`${trade.pair}-${trade.date}-${index}`}>
                      <td>{trade.pair || trade.symbol || "EURUSD"}</td>
                      <td>{trade.type || trade.side || "Buy"}</td>
                      <td>{formatCurrency(trade.entryPrice)}</td>
                      <td>{formatCurrency(trade.exitPrice)}</td>
                      <td className={trade.profit >= 0 ? "positive" : "negative"}>
                        {formatCurrency(trade.profit)}
                      </td>
                      <td>
                        <span className={`result-pill ${trade.profit >= 0 ? "win" : "loss"}`}>
                          {trade.profit >= 0 ? "Win" : "Loss"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No trade history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        </div>

        <div className="bottom-panel bottom-journal">
          <div className="section-header">
            <div>
              <p className="eyebrow">Journal</p>
              <h2>Recent Entries</h2>
            </div>
          </div>
          <div className="recent-entries-grid">
            {recentJournal.length ? (
              recentJournal.map((trade) => (
                <article key={trade.id} className="journal-entry-card">
                  <div className="journal-entry-header">
                    <div>
                      <p className="eyebrow">{trade.symbol}</p>
                      <h3>{trade.direction || "Buy"} Trade</h3>
                    </div>
                    <span className={`result-pill ${trade.profit >= 0 ? "win" : "loss"}`}>
                      {trade.profit >= 0 ? "Win" : "Loss"}
                    </span>
                  </div>
                  <div className="journal-entry-meta">
                    <span>{new Date(trade.date).toLocaleDateString()}</span>
                    <span>{trade.strategy || "Setup"}</span>
                    <span>{trade.rating || 0} ★</span>
                  </div>
                  {trade.tags?.length ? (
                    <div className="tag-list">
                      {trade.tags.map((tag) => (
                        <span key={tag} className="tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="journal-entry-notes">{trade.notes || "No notes yet."}</p>
                  <div className="journal-entry-footer">
                    <div className="entry-values">
                      <span>Entry: {formatCurrency(trade.entry)}</span>
                      <span>Exit: {formatCurrency(trade.exit)}</span>
                    </div>
                    <div className="journal-flags">
                      {trade.mistake && <span className="mistake-pill">Mistake</span>}
                      <span className={trade.profit >= 0 ? "positive" : "negative"}>
                        {formatCurrency(trade.profit)}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">No recent journal entries.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card analytics-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Advanced Analytics</p>
            <h2>Trading Performance Metrics</h2>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon-box risk-icon">
              <Target size={24} />
            </div>
            <p className="analytics-label">Risk Per Trade</p>
            <strong>{riskPerTrade.toFixed(2)}%</strong>
            <p className="analytics-subtext">Average risk exposure per trade</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-box drawdown-icon">
              <TrendingDown size={24} />
            </div>
            <p className="analytics-label">Max Drawdown</p>
            <strong>{formatCurrency(maxDrawdown)}</strong>
            <p className="analytics-subtext">Peak to trough decline</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-box win-icon">
              <CheckCircle2 size={24} />
            </div>
            <p className="analytics-label">Avg Win</p>
            <strong className="positive">{formatCurrency(avgWin)}</strong>
            <p className="analytics-subtext">Average winning trade</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-box loss-icon">
              <TrendingDown size={24} />
            </div>
            <p className="analytics-label">Avg Loss</p>
            <strong className="negative">{formatCurrency(avgLoss)}</strong>
            <p className="analytics-subtext">Average losing trade</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-box pf-icon">
              <DollarSign size={24} />
            </div>
            <p className="analytics-label">Profit Factor</p>
            <strong>{profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}</strong>
            <p className="analytics-subtext">Gross profit / Gross loss ratio</p>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon-box rr-icon">
              <ArrowUpRight size={24} />
            </div>
            <p className="analytics-label">Avg Risk:Reward</p>
            <strong>{averageRR.toFixed(2)}</strong>
            <p className="analytics-subtext">Average R:R ratio</p>
          </div>
        </div>

        {strategyBreakdown.length > 0 && (
          <div className="strategy-breakdown">
            <p className="eyebrow" style={{ marginTop: "24px", marginBottom: "16px" }}>
              Strategy Performance
            </p>
            <div className="strategy-list">
              {strategyBreakdown.map((strategy) => (
                <div key={strategy.name} className="strategy-row">
                  <div className="strategy-info">
                    <span className="strategy-name">{strategy.name}</span>
                    <span className="strategy-meta">{strategy.trades} trades</span>
                  </div>
                  <div className="strategy-stats">
                    <span className="positive">{strategy.wins}W</span>
                    <span className="negative">{strategy.losses}L</span>
                    <span className={strategy.profit >= 0 ? "positive" : "negative"}>
                      {formatCurrency(strategy.profit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

import { useState } from "react";

export default function Backtesting() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [strategy, setStrategy] = useState("Trend Following");
  const [results, setResults] = useState(null);

  const runBacktest = () => {
    // Mock backtest results
    setResults({
      totalTrades: 150,
      winRate: 65,
      profit: 2450.75,
      drawdown: -12.5,
      sharpeRatio: 1.8,
    });
  };

  return (
    <div className="page-section">
      <section className="card backtesting-controls">
        <div className="section-header">
          <div>
            <p className="eyebrow">Backtesting</p>
            <h3>Test Your Trading Strategies</h3>
          </div>
        </div>
        <div className="backtesting-form">
          <label>
            Symbol
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="EURUSD" />
          </label>
          <label>
            Start Date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            End Date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label>
            Strategy
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option>Trend Following</option>
              <option>Mean Reversion</option>
              <option>Breakout</option>
              <option>Scalping</option>
            </select>
          </label>
          <button className="primary-button" onClick={runBacktest} type="button">
            Run Backtest
          </button>
        </div>
      </section>

      {results && (
        <section className="card backtesting-results">
          <div className="section-header">
            <div>
              <p className="eyebrow">Results</p>
              <h3>Backtest Performance</h3>
            </div>
          </div>
          <div className="results-grid">
            <div className="metric-card">
              <span>Total Trades</span>
              <strong>{results.totalTrades}</strong>
            </div>
            <div className="metric-card">
              <span>Win Rate</span>
              <strong>{results.winRate}%</strong>
            </div>
            <div className="metric-card">
              <span>Profit</span>
              <strong className="positive">${results.profit.toFixed(2)}</strong>
            </div>
            <div className="metric-card">
              <span>Max Drawdown</span>
              <strong className="negative">{results.drawdown}%</strong>
            </div>
            <div className="metric-card">
              <span>Sharpe Ratio</span>
              <strong>{results.sharpeRatio}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
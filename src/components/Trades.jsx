import { useMemo, useState } from "react";

const forexSymbols = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "EURCHF",
  "EURAUD",
  "AUDJPY",
  "AUDNZD",
  "CADJPY",
  "GBPJPY",
  "GBPCHF",
  "CHFJPY",
  "NZDJPY",
  "GBPAUD",
  "GBPCAD",
];

const cryptoSymbols = [
  "BTCUSD",
  "ETHUSD",
  "BNBUSD",
  "ADAUSD",
  "SOLUSD",
  "XRPUSD",
  "DOGEUSD",
  "LTCUSD",
  "LINKUSD",
  "MATICUSD",
  "AVAXUSD",
  "DOTUSD",
];

const futuresSymbols = [
  "ES1!",
  "NQ1!",
  "YM1!",
  "CL1!",
  "GC1!",
  "SI1!",
  "NG1!",
  "ZC1!",
  "ZS1!",
  "LE1!",
  "HE1!",
  "PL1!",
  "HG1!",
  "ZB1!",
  "ZN1!",
];

const symbolOptions = {
  Forex: forexSymbols,
  Crypto: cryptoSymbols,
  Futures: futuresSymbols,
};

const initialForm = {
  assetType: "Forex",
  symbol: "EURUSD",
  direction: "Buy",
  entry: "",
  exit: "",
  lot: "",
  stopLoss: "",
  takeProfit: "",
  profit: "",
  date: new Date().toISOString().slice(0, 16),
  notes: "",
  strategy: "Trend",
  screenshot: null,
  tags: "",
  rating: 3,
  mistake: false,
};

const strategyOptions = ["Trend", "Breakout", "Reversal", "Range", "News"];

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateProfit(direction, entry, exit, lot) {
  const entryValue = parseFloat(entry);
  const exitValue = parseFloat(exit);
  const lotValue = parseFloat(lot);

  if (!Number.isFinite(entryValue) || !Number.isFinite(exitValue) || !Number.isFinite(lotValue)) {
    return 0;
  }

  const delta = direction === "Buy" ? exitValue - entryValue : entryValue - exitValue;
  return delta * lotValue * 100;
}

function calculateRR(entry, stopLoss, takeProfit) {
  const entryValue = parseFloat(entry);
  const stopLossValue = parseFloat(stopLoss);
  const takeProfitValue = parseFloat(takeProfit);

  if (!Number.isFinite(entryValue) || !Number.isFinite(stopLossValue) || !Number.isFinite(takeProfitValue)) {
    return 0;
  }

  const risk = Math.abs(entryValue - stopLossValue);
  const reward = Math.abs(takeProfitValue - entryValue);

  if (risk === 0) return 0;
  return reward / risk;
}

export default function Trades({ trades, setTrades, accountMode }) {
  const [form, setForm] = useState(initialForm);
  const [editingTradeId, setEditingTradeId] = useState(null);
  const [expandedTradeId, setExpandedTradeId] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [profitFilter, setProfitFilter] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  const emotionKeywords = [
    { label: "Mistake", regex: /mistake|error|bad entry|wrong entry|overtrade|excessive/i },
    { label: "Fear", regex: /fear|scared|nervous|doubt|hesitant|afraid/i },
    { label: "Greed", regex: /greed|FOMO|greedy|too soon|chasing/i },
    { label: "Anger", regex: /anger|frustration|revenge|upset|angry/i },
  ];

  const getTradeFlags = (notes) => {
    const normalized = notes?.toString() || "";
    return emotionKeywords.filter((item) => item.regex.test(normalized)).map((item) => item.label);
  };

  const toggleExpanded = (id) => {
    setExpandedTradeId((current) => (current === id ? null : id));
  };

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      const matchesSearch = trade.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesDate =
        (!fromDate || tradeDate >= fromDate) &&
        (!toDate || tradeDate <= new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1));
      const matchesProfit =
        profitFilter === "win"
          ? Number(trade.profit) > 0
          : profitFilter === "loss"
          ? Number(trade.profit) < 0
          : true;
      const matchesStrategy = strategyFilter ? trade.strategy === strategyFilter : true;
      const matchesDirection = directionFilter ? trade.direction === directionFilter : true;
      return matchesSearch && matchesDate && matchesProfit && matchesStrategy && matchesDirection;
    });
  }, [trades, search, dateFrom, dateTo, profitFilter, strategyFilter, directionFilter]);

  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const handleChange = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "assetType") {
        next.symbol = symbolOptions[value][0];
      }
      return next;
    });
  };

  const handleScreenshot = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, screenshot: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 16) });
    setEditingTradeId(null);
  };

  const canAdd =
    form.symbol &&
    form.direction &&
    form.entry !== "" &&
    form.lot !== "" &&
    form.stopLoss !== "" &&
    form.takeProfit !== "" &&
    form.profit !== "";

  const addTrade = () => {
    if (!canAdd) return;

    const profit = calculateProfit(form.direction, form.entry, form.exit, form.lot);
    const rr = calculateRR(form.entry, form.stopLoss, form.takeProfit);
    const updatedTrade = {
      id: editingTradeId || crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      assetType: form.assetType,
      symbol: form.symbol,
      direction: form.direction,
      entry: Number(form.entry),
      exit: Number(form.exit),
      lot: Number(form.lot),
      stopLoss: Number(form.stopLoss),
      takeProfit: Number(form.takeProfit),
      date: new Date(form.date).toISOString(),
      notes: form.notes,
      strategy: form.strategy,
      screenshot: form.screenshot,
      profit: Number.isFinite(Number(form.profit)) ? Number(form.profit) : Number(profit.toFixed(2)),
      rr: Number(rr.toFixed(2)),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      rating: Number(form.rating),
      mistake: Boolean(form.mistake),
    };

    if (editingTradeId) {
      setTrades((current) => current.map((trade) => (trade.id === editingTradeId ? updatedTrade : trade)));
    } else {
      setTrades((current) => [updatedTrade, ...current]);
    }

    resetForm();
  };

  const editTrade = (trade) => {
    setEditingTradeId(trade.id);
    setForm({
      assetType: trade.assetType || "Forex",
      symbol: trade.symbol,
      direction: trade.direction,
      entry: trade.entry,
      exit: trade.exit,
      lot: trade.lot,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      profit: trade.profit,
      date: new Date(trade.date).toISOString().slice(0, 16),
      notes: trade.notes || "",
      strategy: trade.strategy || "Trend",
      screenshot: trade.screenshot || null,
      tags: (trade.tags || []).join(", "),
      rating: trade.rating || 3,
      mistake: Boolean(trade.mistake),
    });
  };

  const deleteTrade = (id) => {
    setTrades((current) => current.filter((trade) => trade.id !== id));
  };

  return (
    <div className="page-section">
      <div className="panel-row">
        <section className="card trade-form">
          <div className="section-header">
            <div>
              <p className="eyebrow">Personal Account</p>
              <h2>Journal Entry</h2>
            </div>
            <span className="badge">Manual + Import Ready</span>
          </div>

          <div className="form-grid">
            <label>
              Market Type
              <select value={form.assetType} onChange={(e) => handleChange("assetType", e.target.value)}>
                <option value="Forex">Forex</option>
                <option value="Crypto">Crypto</option>
                <option value="Futures">Futures</option>
              </select>
            </label>
            <label>
              Symbol
              <select value={form.symbol} onChange={(e) => handleChange("symbol", e.target.value)}>
                {symbolOptions[form.assetType].map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Direction
              <select value={form.direction} onChange={(e) => handleChange("direction", e.target.value)}>
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </label>
            <label>
              Entry
              <input type="number" value={form.entry} onChange={(e) => handleChange("entry", e.target.value)} />
            </label>
            <label>
              Exit
              <input type="number" value={form.exit} onChange={(e) => handleChange("exit", e.target.value)} />
            </label>
            <label>
              Lot Size
              <input type="number" value={form.lot} onChange={(e) => handleChange("lot", e.target.value)} />
            </label>
            <label>
              Profit
              <input type="number" value={form.profit} onChange={(e) => handleChange("profit", e.target.value)} />
            </label>
            <label>
              Stop Loss
              <input type="number" value={form.stopLoss} onChange={(e) => handleChange("stopLoss", e.target.value)} />
            </label>
            <label>
              Take Profit
              <input type="number" value={form.takeProfit} onChange={(e) => handleChange("takeProfit", e.target.value)} />
            </label>
            <label>
              Strategy
              <select value={form.strategy} onChange={(e) => handleChange("strategy", e.target.value)}>
                {strategyOptions.map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date / Time
              <input type="datetime-local" value={form.date} onChange={(e) => handleChange("date", e.target.value)} />
            </label>
            <label className="full-width">
              Notes
              <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} />
            </label>
            <label>
              Tags
              <input
                type="text"
                placeholder="revenge trade, good setup"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
              />
            </label>
            <label>
              Rating
              <select value={form.rating} onChange={(e) => handleChange("rating", e.target.value)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.mistake}
                onChange={(e) => handleChange("mistake", e.target.checked)}
              />
              Mark as mistake
            </label>
            <label className="full-width">
              Screenshot
              <input type="file" accept="image/*" onChange={handleScreenshot} />
            </label>
          </div>
          {form.screenshot && (
            <div className="screenshot-preview">
              <img src={form.screenshot} alt="Trade screenshot preview" />
            </div>
          )}

          <div className="form-actions">
            <div>
              <p>Estimated Profit</p>
              <strong>{formatCurrency(calculateProfit(form.direction, form.entry, form.exit, form.lot))}</strong>
            </div>
            <div className="action-buttons">
              {editingTradeId && (
                <button className="secondary-button" onClick={resetForm} type="button">
                  Cancel
                </button>
              )}
              <button className="primary-button" onClick={addTrade} disabled={!canAdd} type="button">
                {editingTradeId ? "Save Entry" : "Add Entry"}
              </button>
            </div>
          </div>
        </section>

        <section className="card stats-panel">
          <p className="eyebrow">Journal Library</p>
          <h2>Journal Filters</h2>
          <div className="filter-grid">
            <label>
              Symbol
              <input placeholder="Search symbol" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <label>
              Date From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label>
              Date To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
            <label>
              Profit Filter
              <select value={profitFilter} onChange={(e) => setProfitFilter(e.target.value)}>
                <option value="">All</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
              </select>
            </label>
          </div>
          <div className="metric-row">
            <div className="metric-card">
              <p>Source Entries</p>
              <strong>{trades.length}</strong>
            </div>
            <div className="metric-card">
              <p>Filtered Results</p>
              <strong>{filteredTrades.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="card trade-table">
        <div className="section-header">
          <div>
            <p className="eyebrow">Journal History</p>
            <h2>Journal Entries</h2>
          </div>
          <span className="badge">Professional table</span>
        </div>

        {filteredTrades.length === 0 ? (
          <p className="empty-state">No entries match the current filters.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Lot Size</th>
                    <th>Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td>{new Date(trade.date).toLocaleDateString()}</td>
                      <td>{trade.symbol}</td>
                      <td>{trade.lot}</td>
                      <td className={trade.profit >= 0 ? "positive" : "negative"}>
                        {formatCurrency(trade.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="recent-entries-grid">
              {recentTrades.map((trade) => (
                <article key={trade.id} className="journal-entry-card">
                  <div className="journal-entry-header">
                    <div>
                      <p className="eyebrow">{trade.symbol}</p>
                      <h3>{trade.direction} Trade</h3>
                    </div>
                    <span className={`result-pill ${trade.profit >= 0 ? "win" : "loss"}`}>
                      {trade.profit >= 0 ? "Win" : "Loss"}
                    </span>
                  </div>

                  <div className="journal-entry-meta">
                    <span>{new Date(trade.date).toLocaleDateString()}</span>
                    <span>{trade.strategy || "Strategy"}</span>
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

                  {trade.screenshot ? (
                    <div className="trade-screenshot-preview">
                      <img src={trade.screenshot} alt={`${trade.symbol} screenshot`} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

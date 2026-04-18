export default function TradeTable({
  trades,
  symbolOptions,
  filterSymbol,
  fromDate,
  toDate,
  sortKey,
  sortOrder,
  onFilterSymbol,
  onFromDate,
  onToDate,
  onSetSortKey,
  onToggleSortOrder,
  formatMoney,
}) {
  return (
    <section className="analytics-trades card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Trade history</p>
          <h3>Filtered and sortable</h3>
        </div>
      </div>
      <div className="table-controls">
        <div className="filter-group">
          <label>
            Symbol
            <select value={filterSymbol} onChange={(e) => onFilterSymbol(e.target.value)}>
              <option value="">All symbols</option>
              {symbolOptions.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input type="date" value={fromDate} onChange={(e) => onFromDate(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={toDate} onChange={(e) => onToDate(e.target.value)} />
          </label>
        </div>
        <div className="sort-group">
          <span>Sort by</span>
          <button type="button" className={sortKey === "date" ? "sort-button active" : "sort-button"} onClick={() => onSetSortKey("date")}>Date</button>
          <button type="button" className={sortKey === "profit" ? "sort-button active" : "sort-button"} onClick={() => onSetSortKey("profit")}>Profit</button>
          <button type="button" className={sortKey === "symbol" ? "sort-button active" : "sort-button"} onClick={() => onSetSortKey("symbol")}>Symbol</button>
          <button type="button" className="sort-button" onClick={onToggleSortOrder}>
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Lot</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {trades.length ? (
              trades.map((trade) => (
                <tr key={trade.id}>
                  <td>{new Date(trade.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>{trade.symbol}</td>
                  <td>{trade.lot}</td>
                  <td>{trade.entry ? Number(trade.entry).toFixed(4) : "–"}</td>
                  <td>{trade.exit ? Number(trade.exit).toFixed(4) : "–"}</td>
                  <td className={trade.profit >= 0 ? "positive" : "negative"}>{formatMoney(trade.profit)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No trades match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

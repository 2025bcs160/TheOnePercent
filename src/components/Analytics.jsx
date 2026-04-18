import { useMemo, useState } from "react";
import { analyzeTrades, connectMT5Account, loadMT5Trades } from "../services/api";
import AccountOverviewCard from "./AccountOverviewCard";
import TradeTable from "./TradeTable";

const brokerOptions = ["Exness", "IC Markets", "XM", "FP Markets", "Pepperstone"];
const serverOptions = [
  "Exness-MT5Real21",
  "Exness-MT5Real30",
  "Exness-MT5Trial9",
  "Exness-MT5Real",
  "Exness-MT5Real10",
  "Exness-MT5Real11",
  "Exness-MT5Real12",
  "Exness-MT5Real14",
  "Exness-MT5Real15",
];

function formatMoney(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Analytics({ trades = [], accountBalance = 10000 }) {
  const [broker, setBroker] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [historyTrades, setHistoryTrades] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [accountLabel, setAccountLabel] = useState("");
  const [showBrokerSuggestions, setShowBrokerSuggestions] = useState(false);
  const [showServerSuggestions, setShowServerSuggestions] = useState(false);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("account");

  const filteredBrokerOptions = brokerOptions.filter((item) =>
    item.toLowerCase().includes(broker.toLowerCase())
  );

  const filteredServerOptions = serverOptions.filter((item) =>
    item.toLowerCase().includes(server.toLowerCase())
  );

  const effectiveTrades = historyTrades.length ? historyTrades : trades;
  const effectiveStartingBalance = accountInfo?.startingBalance ?? accountBalance;
  const stats = useMemo(
    () => analyzeTrades(effectiveTrades, effectiveStartingBalance),
    [effectiveTrades, effectiveStartingBalance]
  );

  const symbolOptions = useMemo(
    () => [...new Set(effectiveTrades.map((trade) => trade.symbol).filter(Boolean))],
    [effectiveTrades]
  );

  const tableTrades = useMemo(() => {
    const parsedFrom = fromDate ? new Date(fromDate) : null;
    const parsedTo = toDate ? new Date(toDate) : null;

    return [...effectiveTrades]
      .filter((trade) => {
        if (filterSymbol && trade.symbol !== filterSymbol) return false;
        if (parsedFrom && new Date(trade.date) < parsedFrom) return false;
        if (parsedTo && new Date(trade.date) > parsedTo) return false;
        return true;
      })
      .sort((a, b) => {
        const order = sortOrder === "desc" ? -1 : 1;
        if (sortKey === "profit") return (a.profit - b.profit) * order;
        if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol) * order;
        return (new Date(a.date) - new Date(b.date)) * order;
      });
  }, [effectiveTrades, filterSymbol, fromDate, toDate, sortKey, sortOrder]);

  const bestPerformingSymbol = useMemo(() => {
    const grouped = effectiveTrades.reduce((acc, trade) => {
      if (!trade.symbol) return acc;
      acc[trade.symbol] = (acc[trade.symbol] || 0) + Number(trade.profit || 0);
      return acc;
    }, {});
    const best = Object.entries(grouped).sort(([, a], [, b]) => b - a)[0];
    return best ? `${best[0]} (${formatMoney(best[1])})` : "–";
  }, [effectiveTrades]);

  const mostProfitableDay = useMemo(() => {
    const totals = effectiveTrades.reduce((acc, trade) => {
      const day = new Date(trade.date).toLocaleDateString("en-US", { weekday: "long" });
      acc[day] = (acc[day] || 0) + Number(trade.profit || 0);
      return acc;
    }, {});
    const best = Object.entries(totals).sort(([, a], [, b]) => b - a)[0];
    return best ? `${best[0]} (${formatMoney(best[1])})` : "–";
  }, [effectiveTrades]);

  const calendarData = useMemo(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const monthStart = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (monthStart.getDay() + 6) % 7;

    const tradesForMonth = effectiveTrades.filter((trade) => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
    });

    const tradesByDay = tradesForMonth.reduce((acc, trade) => {
      const dayKey = new Date(trade.date).toISOString().slice(0, 10);
      const existing = acc[dayKey] || { profit: 0, count: 0 };
      return {
        ...acc,
        [dayKey]: {
          profit: existing.profit + Number(trade.profit || 0),
          count: existing.count + 1,
        },
      };
    }, {});

    const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, index) => {
      if (index < offset || index >= offset + daysInMonth) return null;
      const day = index - offset + 1;
      const date = new Date(year, month, day);
      const key = date.toISOString().slice(0, 10);
      const entry = tradesByDay[key] || { profit: 0, count: 0 };
      return {
        date,
        day,
        profit: entry.profit,
        tradeCount: entry.count,
      };
    });

    const totalTrades = tradesForMonth.length;
    const totalProfit = tradesForMonth.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
    const wins = tradesForMonth.filter((trade) => Number(trade.profit) > 0).length;
    const winRate = totalTrades ? Number(((wins / totalTrades) * 100).toFixed(2)) : 0;

    const dayEntries = Object.entries(tradesByDay).map(([dateKey, data]) => ({
      date: new Date(dateKey),
      profit: data.profit,
      count: data.count,
    }));

    const bestDayEntry = dayEntries.reduce((best, current) => {
      if (!best || current.profit > best.profit) return current;
      return best;
    }, null);

    const worstDayEntry = dayEntries.reduce((worst, current) => {
      if (!worst || current.profit < worst.profit) return current;
      return worst;
    }, null);

    const formatDayLabel = (date) => {
      const dayNumber = date.getDate();
      const suffix = dayNumber % 10 === 1 && dayNumber !== 11 ? "st" : dayNumber % 10 === 2 && dayNumber !== 12 ? "nd" : dayNumber % 10 === 3 && dayNumber !== 13 ? "rd" : "th";
      return `${date.toLocaleString("en-US", { weekday: "short" })} ${dayNumber}${suffix}`;
    };

    return {
      monthLabel: new Date(year, month).toLocaleString("en-US", { month: "long", year: "numeric" }),
      dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      cells,
      totalTrades,
      totalProfit,
      winRate,
      bestDayLabel: bestDayEntry ? formatDayLabel(bestDayEntry.date) : "-",
      worstDayLabel: worstDayEntry ? formatDayLabel(worstDayEntry.date) : "-",
      bestDayProfit: bestDayEntry ? bestDayEntry.profit : 0,
      worstDayProfit: worstDayEntry ? worstDayEntry.profit : 0,
    };
  }, [effectiveTrades]);

  const riskInsight = useMemo(() => {
    if (!stats.totalTrades) {
      return "Connect your account or import trades to reveal risk insights.";
    }
    if (stats.averageRR && stats.averageRR < 1.5) {
      return "Average risk-reward ratio is below best-practice levels.";
    }
    if (stats.maxDrawdown && stats.maxDrawdown > accountBalance * 0.2) {
      return "Watch max drawdown: it exceeds 20% of account balance.";
    }
    return "Trading risk profile looks balanced for this dataset.";
  }, [stats, accountBalance]);

  const accountNumber = accountInfo?.login;
  const accountName = accountInfo?.accountName || accountLabel || "MT5 Account";

  const handleConnect = async () => {
    setConnecting(true);
    setConnectionStatus("");
    try {
      const connectionResponse = await connectMT5Account({ broker, login, password, server, accountMode: "Personal" });
      const loadedTrades = await loadMT5Trades({ broker, login, password, server });
      setHistoryTrades(loadedTrades);
      setAccountInfo(
        connectionResponse.accountInfo || {
          broker,
          login,
          server,
          platform: "MT5",
          accountType: /real/i.test(server) ? "Real" : "Demo",
          startingBalance: accountBalance,
          balance: accountBalance,
        }
      );
      setConnected(true);
      setAccountLabel(connectionResponse.accountInfo?.accountName || connectionResponse.accountName);
      setConnectionStatus(connectionResponse.message || "Connected. Account history loaded.");
      setPassword(savePassword ? password : "");
    } catch (error) {
      setConnectionStatus(error.message || "Unable to connect MT5 account.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="page-section">
      {!connected ? (
        <section className="card analytics-login-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">MT5 Login Required</p>
              <h3>Connect your account to load live trades</h3>
            </div>
            <span className="status-pill">Secure</span>
          </div>
          <div className="integration-card">
            <label className="input-with-suggestions">
              Broker
              <input
                value={broker}
                onChange={(e) => {
                  setBroker(e.target.value);
                  setShowBrokerSuggestions(true);
                }}
                onFocus={() => setShowBrokerSuggestions(true)}
                onBlur={() => setTimeout(() => setShowBrokerSuggestions(false), 120)}
                placeholder="Example: Exness"
              />
              {showBrokerSuggestions && filteredBrokerOptions.length > 0 && (
                <ul className="suggestion-list">
                  {filteredBrokerOptions.map((item) => (
                    <li
                      key={item}
                      onMouseDown={() => {
                        setBroker(item);
                        setShowBrokerSuggestions(false);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </label>
            <label>
              Login
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="MT5 login" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="MT5 password" />
            </label>
            <label className="input-with-suggestions">
              Server
              <input
                value={server}
                onChange={(e) => {
                  setServer(e.target.value);
                  setShowServerSuggestions(true);
                }}
                onFocus={() => setShowServerSuggestions(true)}
                onBlur={() => setTimeout(() => setShowServerSuggestions(false), 120)}
                placeholder="Example: Exness-MT5Real21"
              />
              {showServerSuggestions && filteredServerOptions.length > 0 && (
                <ul className="suggestion-list">
                  {filteredServerOptions.map((item) => (
                    <li
                      key={item}
                      onMouseDown={() => {
                        setServer(item);
                        setShowServerSuggestions(false);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </label>
            <div className="save-password-row">
              <label className="checkbox-row">
                <input type="checkbox" checked={savePassword} onChange={(e) => setSavePassword(e.target.checked)} />
                Save password
              </label>
            </div>
            <div className="settings-actions">
              <button className="primary-button" onClick={handleConnect} disabled={connecting} type="button">
                {connecting ? "Connecting..." : "Connect MT5"}
              </button>
            </div>
            {connectionStatus && <p className="status-message">{connectionStatus}</p>}
          </div>
        </section>
      ) : (
        <>
          <div className="analytics-tabs">
            {[
              { id: "account", label: "Account Overview" },
              { id: "trading", label: "Trading Overview" },
              { id: "calendar", label: "Calendar" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`analytics-tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="card analytics-account-summary">
            <div className="tab-card-header">
              <p className="eyebrow">Connected account</p>
              <span className="status-pill positive">Connected</span>
            </div>
            <h3>{accountName}</h3>
            {accountNumber && <p className="connected-account-details">Account number: {accountNumber}</p>}
          </section>

          <section className="card analytics-tab-card">
            {activeTab === "account" && (
              <div className="analytics-tab-body">
                <AccountOverviewCard accountInfo={accountInfo} isConnected={connected} />
                <div className="overview-row">
                  <div>
                    <span>Total trades</span>
                    <strong>{stats.totalTrades}</strong>
                  </div>
                  <div>
                    <span>Win rate</span>
                    <strong>{stats.totalTrades ? `${stats.winRate}%` : "–"}</strong>
                  </div>
                  <div>
                    <span>Profit factor</span>
                    <strong>{stats.profitFactor ? stats.profitFactor : "–"}</strong>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "trading" && (
              <div className="analytics-tab-body">
                <TradeTable
                  trades={tableTrades}
                  symbolOptions={symbolOptions}
                  filterSymbol={filterSymbol}
                  fromDate={fromDate}
                  toDate={toDate}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onFilterSymbol={setFilterSymbol}
                  onFromDate={setFromDate}
                  onToDate={setToDate}
                  onSetSortKey={setSortKey}
                  onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                  formatMoney={formatMoney}
                />
              </div>
            )}
            {activeTab === "calendar" && (
              <div className="analytics-tab-body">
                <div className="tab-card-header">
                  <p className="eyebrow">Calendar</p>
                </div>
                <div className="calendar-summary-grid">
                  <div>
                    <span>Total Trades</span>
                    <strong>{calendarData.totalTrades}</strong>
                  </div>
                  <div>
                    <span>P&L</span>
                    <strong className={calendarData.totalProfit >= 0 ? "positive" : "negative"}>
                      {formatMoney(calendarData.totalProfit)}
                    </strong>
                  </div>
                  <div>
                    <span>Best Day</span>
                    <strong>{calendarData.bestDayLabel}</strong>
                  </div>
                  <div>
                    <span>Worst Day</span>
                    <strong>{calendarData.worstDayLabel}</strong>
                  </div>
                  <div>
                    <span>Win Rate</span>
                    <strong>{calendarData.winRate}%</strong>
                  </div>
                </div>
                <div className="calendar-grid">
                  {calendarData.dayNames.map((dayName) => (
                    <div key={dayName} className="calendar-weekday">
                      {dayName}
                    </div>
                  ))}
                  {calendarData.cells.map((cell, index) =>
                    cell ? (
                      <div
                        key={`${cell.day}-${index}`}
                        className={`calendar-day ${cell.tradeCount ? "has-trades" : ""} ${
                          cell.tradeCount && cell.profit >= 0 ? "positive" : cell.tradeCount ? "negative" : ""
                        }`}
                      >
                        <div className="calendar-day-header">
                          <span>{cell.day}</span>
                        </div>
                        {cell.tradeCount > 0 ? (
                          <>
                            <p className="calendar-day-profit">{formatMoney(cell.profit)}</p>
                            <p className="calendar-day-count">{cell.tradeCount} Trade{cell.tradeCount > 1 ? "s" : ""}</p>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div key={`empty-${index}`} className="calendar-day empty" />
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

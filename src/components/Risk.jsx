import { useMemo, useState } from "react";
import RiskCalculator from "./RiskCalculator";

const accountCurrencies = ["USD", "EUR", "GBP", "JPY"];
const symbolsByCategory = {
  All: ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "BTCUSD", "ETHUSD", "ES1!", "NQ1!"],
  Majors: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"],
  Crypto: ["BTCUSD", "ETHUSD"],
  Indices: ["ES1!", "NQ1!"],
};

const tabItems = [
  { key: "position", label: "Position Size" },
  { key: "pip", label: "Pip Value" },
  { key: "compound", label: "Compound Profit" },
  { key: "margin", label: "Margin" },
  { key: "pnl", label: "Profit & Loss" },
  { key: "sltp", label: "SL / TP" },
  { key: "symbols", label: "Instruments" },
];

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function getPipUnit(symbol) {
  return symbol.includes("JPY") ? 0.01 : 0.0001;
}

export default function Calculator({ analytics, accountBalance, riskPercent, setAccountBalance, setRiskPercent, maxDailyLoss, setMaxDailyLoss }) {
  const [activeTab, setActiveTab] = useState("position");
  const [currency, setCurrency] = useState("USD");
  const [symbol, setSymbol] = useState("EURUSD");
  const [tradeSize, setTradeSize] = useState(0.02);
  const [pips, setPips] = useState(158.5);
  const [positionBalance, setPositionBalance] = useState(accountBalance || 2000);
  const [positionRiskPercent, setPositionRiskPercent] = useState(riskPercent || 1);
  const [positionResults, setPositionResults] = useState(null);
  const [compoundBalance, setCompoundBalance] = useState(10000);
  const [compoundPeriods, setCompoundPeriods] = useState(12);
  const [compoundGain, setCompoundGain] = useState(20);
  const [entryPrice, setEntryPrice] = useState(1.25032);
  const [takeProfitPrice, setTakeProfitPrice] = useState(1.27);
  const [riskAmount, setRiskAmount] = useState(300);
  const [direction, setDirection] = useState("Long");

  const riskUsage = useMemo(() => {
    return Math.min(
      100,
      Number.isFinite(maxDailyLoss) && maxDailyLoss > 0 ? (Math.abs(analytics.maxDailyLossObserved) / maxDailyLoss) * 100 : 0
    );
  }, [analytics.maxDailyLossObserved, maxDailyLoss]);

  const pipValue = useMemo(() => {
    if (!tradeSize || tradeSize <= 0) return 0;
    const base = symbol.includes("JPY") ? 9.13 : 10.0;
    return Number((tradeSize * base).toFixed(2));
  }, [tradeSize, symbol]);

  const pipValueTotal = useMemo(() => Number((pipValue * pips).toFixed(2)), [pipValue, pips]);

  const calculatedRiskAmount = useMemo(() => {
    return Number((positionBalance * (positionRiskPercent / 100)).toFixed(2));
  }, [positionBalance, positionRiskPercent]);

  const compoundResult = useMemo(() => {
    const principal = Number(compoundBalance);
    const rate = Number(compoundGain) / 100;
    const periods = Number(compoundPeriods);
    if (!principal || !periods || !Number.isFinite(rate)) {
      return { endingBalance: 0, totalProfit: 0, totalPercent: 0, schedule: [] };
    }

    const endingBalance = principal * Math.pow(1 + rate, periods);
    const totalProfit = endingBalance - principal;
    const schedule = Array.from({ length: periods }, (_, index) => {
      const period = index + 1;
      const balance = principal * Math.pow(1 + rate, period);
      return {
        period,
        profit: balance - principal,
        balance,
        percent: ((balance - principal) / principal) * 100,
      };
    });

    return {
      endingBalance: Number(endingBalance.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      totalPercent: Number(((totalProfit / principal) * 100).toFixed(2)),
      schedule,
    };
  }, [compoundBalance, compoundGain, compoundPeriods]);

  const sltp = useMemo(() => {
    const entry = Number(entryPrice);
    const takeProfit = Number(takeProfitPrice);
    const risk = Number(riskAmount);
    if (!entry || !takeProfit || !risk || !tradeSize) {
      return {
        stopLoss: 0,
        gainAmount: 0,
        rr: 0,
        pipsToTP: 0,
        riskPips: 0,
      };
    }
    const step = getPipUnit(symbol);
    const pipValueSL = pipValue;
    const pipsToTP = Math.abs(takeProfit - entry) / step;
    const gainAmount = Number((pipsToTP * pipValueSL).toFixed(2));
    const riskPips = Number((risk / pipValueSL).toFixed(2));
    const stopLoss = direction === "Long" ? entry - riskPips * step : entry + riskPips * step;
    const rr = risk ? Number((gainAmount / risk).toFixed(2)) : 0;
    return { stopLoss, gainAmount, rr, pipsToTP, riskPips };
  }, [entryPrice, takeProfitPrice, riskAmount, direction, symbol, tradeSize, pipValue]);

  const instrumentSearchResults = useMemo(() => {
    const query = symbol.toLowerCase();
    return Object.fromEntries(
      Object.entries(symbolsByCategory).map(([category, list]) => [
        category,
        list.filter((item) => item.toLowerCase().includes(query) || category.toLowerCase().includes(query)),
      ])
    );
  }, [symbol]);

  return (
    <div className="page-section space-y-6">
      <div className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Calculator Suite</p>
            <h2>Trading Toolkit</h2>
          </div>
          <span className="badge">Risk, pip & position tools</span>
        </div>
        <div className="tab-list">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "position" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-card">
              <span>Account Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {accountCurrencies.map((currencyOption) => (
                  <option key={currencyOption} value={currencyOption}>
                    {currencyOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Instrument</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {symbolsByCategory.All.map((symbolOption) => (
                  <option key={symbolOption} value={symbolOption}>
                    {symbolOption}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-card">
              <span>Account Balance</span>
              <input
                type="number"
                min="1"
                value={positionBalance}
                onChange={(e) => {
                  setPositionBalance(Number(e.target.value));
                  setPositionResults(null);
                }}
              />
            </label>
            <label className="input-card">
              <span>Risk Percentage</span>
              <div className="input-suffix-row">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={positionRiskPercent}
                  onChange={(e) => {
                    setPositionRiskPercent(Number(e.target.value));
                    setPositionResults(null);
                  }}
                />
                <span className="suffix">%</span>
              </div>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-card">
              <span>Risk Amount</span>
              <input type="number" value={calculatedRiskAmount} readOnly />
            </label>
            <label className="input-card">
              <span>Stop Loss Pips</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={pips}
                onChange={(e) => {
                  setPips(Number(e.target.value));
                  setPositionResults(null);
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="detail-card">
              <p>Calculated Risk</p>
              <strong>{formatCurrency(calculatedRiskAmount)}</strong>
            </div>
            <div className="detail-card">
              <p>Stop Loss</p>
              <strong>{pips.toFixed(2)} pips</strong>
            </div>
          </div>

          <button
            type="button"
            className="primary-button w-full md:w-auto"
            onClick={() => {
              const resultRiskAmount = calculatedRiskAmount;
              const pipValuePerLot = symbol.includes("JPY") ? 9.13 : 10.0;
              const lotSize = pips > 0 ? Number((resultRiskAmount / (pips * pipValuePerLot)).toFixed(4)) : 0;
              const units = Number((lotSize * 100000).toFixed(2));
              const miniLots = Number((lotSize * 10).toFixed(2));
              const microLots = Number((lotSize * 100).toFixed(1));
              setPositionResults({
                pipValuePerLot,
                lotSize,
                units,
                miniLots,
                microLots,
                balance: positionBalance,
                riskPercent: positionRiskPercent,
                riskAmount: resultRiskAmount,
                stopLossPips: pips,
                symbol,
                currency,
              });
            }}
          >
            Calculate Position Size
          </button>

          {positionResults ? (
            <section className="results-panel">
              <div className="result-row">
                <span>Risk Amount</span>
                <strong>{formatCurrency(positionResults.riskAmount)}</strong>
              </div>
              <div className="result-row">
                <span>Units</span>
                <strong>{formatNumber(positionResults.units, 2)}</strong>
              </div>
              <div className="result-row">
                <span>Standard Lots</span>
                <strong>{formatNumber(positionResults.lotSize, 4)}</strong>
              </div>
              <div className="result-row">
                <span>Mini Lots</span>
                <strong>{positionResults.miniLots}</strong>
              </div>
              <div className="result-row">
                <span>Micro Lots</span>
                <strong>{positionResults.microLots}</strong>
              </div>
              <div className="result-row">
                <span>Pip Value per Lot</span>
                <strong>{formatCurrency(positionResults.pipValuePerLot)}</strong>
              </div>
              <div className="result-row result-more">
                <span>More Results</span>
                <span>›</span>
              </div>
            </section>
          ) : (
            <div className="detail-card" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="font-semibold">Results will appear here after calculating.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === "pip" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="input-card">
              <span>Account Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {accountCurrencies.map((currencyOption) => (
                  <option key={currencyOption} value={currencyOption}>
                    {currencyOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Symbol</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {symbolsByCategory.All.map((symbolOption) => (
                  <option key={symbolOption} value={symbolOption}>
                    {symbolOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Trade Size (lots)</span>
              <input type="number" min="0" step="0.01" value={tradeSize} onChange={(e) => setTradeSize(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Pips</span>
              <input type="number" min="0" step="1" value={pips} onChange={(e) => setPips(Number(e.target.value))} />
            </label>
          </div>

          <button type="button" className="primary-button w-full md:w-auto">
            Calculate
          </button>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="detail-card">
              <p>Pip Value</p>
              <strong>{formatCurrency(pipValue)}</strong>
            </div>
            <div className="detail-card">
              <p>Pip Value × {pips}</p>
              <strong>{formatCurrency(pipValueTotal)}</strong>
            </div>
          </div>

          <div className="detail-card" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="font-semibold">{symbol}</p>
            <p className="mt-2">Lot Size: {formatNumber(tradeSize, 2)} {symbol.slice(0, 3)}</p>
            <p>Pip position: {getPipUnit(symbol) === 0.01 ? "1 / 0.01" : "1 / 0.0001"}</p>
          </div>
        </section>
      )}

      {activeTab === "compound" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="input-card">
              <span>Starting Balance</span>
              <input type="number" min="0" value={compoundBalance} onChange={(e) => setCompoundBalance(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Periods</span>
              <input type="number" min="1" value={compoundPeriods} onChange={(e) => setCompoundPeriods(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Gain % per Period</span>
              <input type="number" min="0" step="0.1" value={compoundGain} onChange={(e) => setCompoundGain(Number(e.target.value))} />
            </label>
          </div>

          <button type="button" className="primary-button w-full md:w-auto">
            Calculate
          </button>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="detail-card">
              <p>Ending Balance</p>
              <strong>{formatCurrency(compoundResult.endingBalance)}</strong>
            </div>
            <div className="detail-card">
              <p>Total Profit</p>
              <strong>{formatCurrency(compoundResult.totalProfit)}</strong>
            </div>
            <div className="detail-card">
              <p>Total Profit (%)</p>
              <strong>{formatNumber(compoundResult.totalPercent, 2)}%</strong>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 p-4">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profit</th>
                  <th>Balance</th>
                  <th>Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {compoundResult.schedule.map((row) => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>{formatCurrency(row.profit)}</td>
                    <td>{formatCurrency(row.balance)}</td>
                    <td>{formatNumber(row.percent, 2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "margin" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="input-card">
              <span>Account Balance</span>
              <input type="number" min="0" value={accountBalance} readOnly />
            </label>
            <label className="input-card">
              <span>Symbol</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {symbolsByCategory.All.map((symbolOption) => (
                  <option key={symbolOption} value={symbolOption}>
                    {symbolOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Trade Size (lots)</span>
              <input type="number" min="0" step="0.01" value={tradeSize} onChange={(e) => setTradeSize(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Leverage</span>
              <input type="number" min="1" step="1" defaultValue={100} />
            </label>
          </div>

          <button type="button" className="primary-button w-full md:w-auto">
            Calculate Margin
          </button>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="detail-card">
              <p>Required Margin</p>
              <strong>{formatCurrency((tradeSize * 100000) / 100)}</strong>
            </div>
            <div className="detail-card">
              <p>Notional Size</p>
              <strong>{formatCurrency(tradeSize * 100000)}</strong>
            </div>
            <div className="detail-card">
              <p>Margin Ratio</p>
              <strong>1:100</strong>
            </div>
          </div>
        </section>
      )}

      {activeTab === "pnl" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="input-card">
              <span>Symbol</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {symbolsByCategory.All.map((symbolOption) => (
                  <option key={symbolOption} value={symbolOption}>
                    {symbolOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Entry Price</span>
              <input type="number" step="0.00001" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Exit Price</span>
              <input type="number" step="0.00001" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Trade Size (lots)</span>
              <input type="number" min="0" step="0.01" value={tradeSize} onChange={(e) => setTradeSize(Number(e.target.value))} />
            </label>
          </div>

          <button type="button" className="primary-button w-full md:w-auto">
            Calculate P&L
          </button>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="detail-card">
              <p>P&L</p>
              <strong>{formatCurrency((takeProfitPrice - entryPrice) * tradeSize * 100000)}</strong>
            </div>
            <div className="detail-card">
              <p>Pip Move</p>
              <strong>{Math.abs(takeProfitPrice - entryPrice) / getPipUnit(symbol)} pips</strong>
            </div>
            <div className="detail-card">
              <p>Direction</p>
              <strong>{takeProfitPrice >= entryPrice ? "Long" : "Short"}</strong>
            </div>
          </div>
        </section>
      )}

      {activeTab === "sltp" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="input-card">
              <span>Symbol</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {symbolsByCategory.All.map((symbolOption) => (
                  <option key={symbolOption} value={symbolOption}>
                    {symbolOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="input-card">
              <span>Trade Size (lots)</span>
              <input type="number" min="0" step="0.01" value={tradeSize} onChange={(e) => setTradeSize(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Entry Price</span>
              <input type="number" step="0.00001" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Risk Amount</span>
              <input type="number" min="0" value={riskAmount} onChange={(e) => setRiskAmount(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Take Profit Price</span>
              <input type="number" step="0.00001" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(Number(e.target.value))} />
            </label>
            <label className="input-card">
              <span>Direction</span>
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option>Long</option>
                <option>Short</option>
              </select>
            </label>
          </div>

          <button type="button" className="primary-button w-full md:w-auto">
            Calculate
          </button>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="detail-card">
              <p>Stop Loss</p>
              <strong>{sltp.stopLoss ? sltp.stopLoss.toFixed(5) : "—"}</strong>
            </div>
            <div className="detail-card">
              <p>Risk Reward Ratio</p>
              <strong>{sltp.rr || 0}:1</strong>
            </div>
            <div className="detail-card">
              <p>Gain Amount</p>
              <strong>{formatCurrency(sltp.gainAmount)}</strong>
            </div>
            <div className="detail-card">
              <p>Pip Value</p>
              <strong>{formatCurrency(pipValue)}</strong>
            </div>
            <div className="detail-card">
              <p>Pips to TP</p>
              <strong>{sltp.pipsToTP.toFixed(1)}</strong>
            </div>
            <div className="detail-card">
              <p>Risk Pips</p>
              <strong>{sltp.riskPips}</strong>
            </div>
          </div>
        </section>
      )}

      {activeTab === "symbols" && (
        <section className="card grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="input-card md:col-span-2">
              <span>Search instruments</span>
              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Search.." />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(instrumentSearchResults).map(([category, list]) => (
              <div key={category} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{category}</p>
                <ul className="mt-3 space-y-2 text-slate-200">
                  {list.length ? (
                    list.map((item) => (
                      <li key={item} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-b-0">
                        <span>{item}</span>
                        <span className="text-slate-400">{item === "BTCUSD" || item === "ETHUSD" ? "Crypto" : item.includes("!") ? "Index" : "FX"}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">No instruments found.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

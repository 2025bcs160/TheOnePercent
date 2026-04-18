import { useMemo, useState } from "react";

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function validateNumber(value) {
  return Number.isFinite(value) && value > 0;
}

export default function RiskCalculator({
  balance = 10000,
  riskPercent = 1,
  onBalanceChange,
  onRiskPercentChange,
  initialStopLoss = 20,
}) {
  const [stopLoss, setStopLoss] = useState(initialStopLoss);

  const balanceValue = Number(balance);
  const riskPercentValue = Number(riskPercent);
  const stopLossValue = Number(stopLoss);

  const errors = useMemo(() => {
    return {
      balance: !validateNumber(balanceValue) ? "Balance must be greater than 0." : "",
      riskPercent: !validateNumber(riskPercentValue) ? "Risk percentage must be greater than 0." : "",
      stopLoss: !validateNumber(stopLossValue) ? "Stop loss must be greater than 0." : "",
    };
  }, [balanceValue, riskPercentValue, stopLossValue]);

  const valid = !errors.balance && !errors.riskPercent && !errors.stopLoss;

  const riskAmount = useMemo(() => {
    if (!valid) return 0;
    return Number((balanceValue * (riskPercentValue / 100)).toFixed(2));
  }, [balanceValue, riskPercentValue, valid]);

  const pipValuePerLot = 10;

  const lotSize = useMemo(() => {
    if (!valid) return 0;
    const size = riskAmount / (stopLossValue * pipValuePerLot);
    return Number(size > 0 ? size.toFixed(2) : 0);
  }, [riskAmount, stopLossValue, valid]);

  const handleBalanceChange = (event) => {
    const value = Number(event.target.value);
    if (onBalanceChange) onBalanceChange(value);
  };

  const handleRiskPercentChange = (event) => {
    const value = Number(event.target.value);
    if (onRiskPercentChange) onRiskPercentChange(value);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-slate-100">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Risk Calculator</p>
          <h2 className="text-2xl font-semibold text-slate-100">Position Sizing</h2>
        </div>
        <span className="rounded-full bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
          Realtime
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
          <span className="font-medium text-slate-300">Account Balance</span>
          <input
            type="number"
            value={balanceValue}
            onChange={handleBalanceChange}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-cyan-400"
            min="0"
          />
          {errors.balance && <span className="text-xs text-rose-400">{errors.balance}</span>}
        </label>

        <label className="grid gap-2 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
          <span className="font-medium text-slate-300">Risk % per Trade</span>
          <input
            type="number"
            value={riskPercentValue}
            onChange={handleRiskPercentChange}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-cyan-400"
            min="0"
          />
          {errors.riskPercent && <span className="text-xs text-rose-400">{errors.riskPercent}</span>}
        </label>

        <label className="grid gap-2 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
          <span className="font-medium text-slate-300">Stop Loss (pips)</span>
          <input
            type="number"
            value={stopLossValue}
            onChange={(event) => setStopLoss(event.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-cyan-400"
            min="0"
          />
          {errors.stopLoss && <span className="text-xs text-rose-400">{errors.stopLoss}</span>}
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Risk Amount</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{formatCurrency(riskAmount)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lot Size</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">{lotSize}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pip Value / Lot</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">$10.00</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stop Loss</p>
          <p className="mt-3 text-2xl font-semibold text-slate-100">{stopLossValue} pips</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
        <p className="font-medium text-slate-100">Calculation</p>
        <p className="mt-3">Lot Size = Risk Amount ÷ (Stop Loss × Pip Value per Lot)</p>
        <p className="mt-2 text-slate-200">
          {valid
            ? `${formatCurrency(riskAmount)} ÷ (${stopLossValue} × $10) = ${lotSize}`
            : "Enter valid positive values to calculate position size."}
        </p>
      </div>
    </div>
  );
}

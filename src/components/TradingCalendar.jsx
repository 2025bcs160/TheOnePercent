import { useMemo, useState } from "react";

const defaultTrades = [
  { date: "2026-04-01", profit: 320 },
  { date: "2026-04-02", profit: -150 },
  { date: "2026-04-03", profit: 180 },
  { date: "2026-04-05", profit: 220 },
  { date: "2026-04-07", profit: -90 },
  { date: "2026-04-09", profit: 140 },
  { date: "2026-04-11", profit: -210 },
  { date: "2026-04-14", profit: 360 },
  { date: "2026-04-18", profit: 120 },
  { date: "2026-04-23", profit: -70 },
  { date: "2026-04-25", profit: 400 },
  { date: "2026-04-28", profit: 90 },
];

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatCurrency(value) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function buildCalendarGrid(month, year) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - offset + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
  });
}

function TradingCalendar({ tradeItems = defaultTrades }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const { dayMap, stats, calendarCells } = useMemo(() => {
    const monthTrades = tradeItems.filter((trade) => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === viewDate.month && tradeDate.getFullYear() === viewDate.year;
    });

    const dayMap = monthTrades.reduce((map, trade) => {
      const tradeDate = new Date(trade.date);
      const key = tradeDate.toISOString().slice(0, 10);
      const entry = map[key] || { profit: 0, trades: 0, date: tradeDate };
      entry.profit += Number(trade.profit || 0);
      entry.trades += 1;
      map[key] = entry;
      return map;
    }, {});

    const formattedDays = Object.values(dayMap).map((entry) => ({
      date: entry.date,
      profit: entry.profit,
      trades: entry.trades,
    }));

    const totalTrades = formattedDays.reduce((sum, item) => sum + item.trades, 0);
    const totalPL = formattedDays.reduce((sum, item) => sum + item.profit, 0);
    const profitDays = formattedDays.filter((item) => item.profit > 0).length;
    const bestDay = formattedDays.reduce((best, item) => (best === null || item.profit > best.profit ? item : best), null);
    const worstDay = formattedDays.reduce((worst, item) => (worst === null || item.profit < worst.profit ? item : worst), null);
    const winRate = formattedDays.length ? Number(((profitDays / formattedDays.length) * 100).toFixed(1)) : 0;

    return {
      dayMap,
      stats: {
        totalTrades,
        totalPL,
        bestDay,
        worstDay,
        winRate,
      },
      calendarCells: buildCalendarGrid(viewDate.month, viewDate.year),
    };
  }, [tradeItems, viewDate.month, viewDate.year]);

  const title = `${new Date(viewDate.year, viewDate.month).toLocaleString("default", {
    month: "long",
  })} ${viewDate.year}`;

  const moveMonth = (delta) => {
    setViewDate((current) => {
      const target = new Date(current.year, current.month + delta, 1);
      return { month: target.getMonth(), year: target.getFullYear() };
    });
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-slate-100">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-slate-900 p-4 shadow-inner border border-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Trades</p>
          <p className="mt-2 text-3xl font-semibold">{stats.totalTrades}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 shadow-inner border border-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total P&amp;L</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatCurrency(stats.totalPL)}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 shadow-inner border border-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Best Day</p>
          <p className="mt-2 text-base font-semibold">
            {stats.bestDay ? `${stats.bestDay.date.toLocaleDateString()} (${formatCurrency(stats.bestDay.profit)})` : "-"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 shadow-inner border border-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Worst Day</p>
          <p className="mt-2 text-base font-semibold">
            {stats.worstDay ? `${stats.worstDay.date.toLocaleDateString()} (${formatCurrency(stats.worstDay.profit)})` : "-"}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 shadow-inner border border-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Win Rate</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{stats.winRate}%</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Month</p>
          <h3 className="text-2xl font-semibold">{title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-400">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold uppercase tracking-[0.25em]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {calendarCells.map((dayNumber, index) => {
          if (!dayNumber) {
            return <div key={index} className="min-h-[110px] rounded-3xl bg-slate-950/50 border border-slate-800" />;
          }

          const dateKey = new Date(viewDate.year, viewDate.month, dayNumber).toISOString().slice(0, 10);
          const cell = dayMap[dateKey];
          const isProfit = cell?.profit > 0;
          const isLoss = cell?.profit < 0;
          const cellBg = isProfit
            ? "bg-emerald-600/15 border-emerald-400/20"
            : isLoss
            ? "bg-rose-600/15 border-rose-400/20"
            : "bg-slate-950/60 border-slate-800";

          return (
            <div
              key={index}
              className={`min-h-[110px] rounded-3xl border p-3 transition-colors duration-200 ${cellBg}`}
            >
              <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                <span>{dayNumber}</span>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                  {cell?.trades ?? 0} trade{cell?.trades === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-100">
                {cell ? formatCurrency(cell.profit) : "No trades"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TradingCalendar;

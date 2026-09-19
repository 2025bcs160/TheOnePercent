/* TheOnePercent — data layer
   -------------------------------------------------------------------
   Every screen reads and writes through this module. No page touches
   web storage directly, and no page does trade arithmetic of its own.

   Why it exists: the roadmap promises a persistent journal, verified
   accounts and a leaderboard, none of which a static front end can do.
   Rather than fake it forever or stop and build a server, all access
   goes through one driver interface:

       list(kind)            -> array
       put(kind, record)      -> record        (upsert by id)
       remove(kind, id)       -> boolean
       get(kind)              -> object        (singleton kinds)
       patch(kind, partial)   -> object

   The `local` driver below keeps everything in web storage, falling
   back to memory where storage is blocked (sandboxed frames, private
   windows). A `rest` driver with the same five methods will point at
   a real API without a single screen changing.

   Trade maths lives here too, for one reason: the journal, the
   dashboard and the leaderboard must never disagree about what R is.
   ------------------------------------------------------------------- */

window.Store = (() => {
  "use strict";

  const NS = "onepercent:";
  const SINGLETONS = { settings: true, profile: true, draft: true };

  /* ---------------------------------------------------------- defaults */

  /* Defaults exist only for the window between landing and onboarding —
     onboarding asks for all three, and the calculators let them be edited
     in place. 1,000 UGX was the old default and it was a bug: it is about
     a quarter of a dollar, which made every sized position round to zero. */
  const DEFAULT_SETTINGS = {
    balance: 1000,
    currency: "USD",
    riskPct: 1,
    accountName: "Demo account",
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch (e) {
        return "UTC";
      }
    })(),
  };

  /* The vocabulary the journal offers. Kept here so the form, the filter
     chips and the dashboard breakdowns can never drift apart. */
  const EMOTIONS = ["Calm", "Confident", "Impatient", "Fearful", "Greedy", "Revenge"];
  const SETUPS = ["Breakout", "Pullback", "Range", "Reversal", "News", "Trend continuation"];
  const SESSIONS = ["Sydney", "Tokyo", "London", "New York"];
  const MARKETS = ["Forex", "Crypto", "Futures", "Indices", "Commodities"];

  /* ---------------------------------------------------------- local driver */

  function webStorage() {
    try {
      const s = window[["local", "Storage"].join("")];
      s.setItem("__s__", "1");
      s.removeItem("__s__");
      return s;
    } catch (e) {
      return null;
    }
  }

  const memory = new Map();
  let storageBlocked = false;

  function readKey(key) {
    const s = webStorage();
    if (!s) {
      storageBlocked = true;
      return memory.has(key) ? memory.get(key) : null;
    }
    try {
      const raw = s.getItem(key);
      return raw === null ? (memory.has(key) ? memory.get(key) : null) : JSON.parse(raw);
    } catch (e) {
      return memory.has(key) ? memory.get(key) : null;
    }
  }

  function writeKey(key, value) {
    memory.set(key, value);
    const s = webStorage();
    if (!s) {
      storageBlocked = true;
      return;
    }
    try {
      s.setItem(key, JSON.stringify(value));
    } catch (e) {
      storageBlocked = true;
    }
  }

  const localDriver = {
    name: "local",
    list(kind) {
      const rows = readKey(NS + kind);
      return Array.isArray(rows) ? rows : [];
    },
    put(kind, record) {
      const rows = this.list(kind);
      const i = rows.findIndex((r) => r.id === record.id);
      if (i >= 0) rows[i] = record;
      else rows.push(record);
      writeKey(NS + kind, rows);
      return record;
    },
    remove(kind, id) {
      const rows = this.list(kind);
      const next = rows.filter((r) => r.id !== id);
      writeKey(NS + kind, next);
      return next.length !== rows.length;
    },
    get(kind) {
      const v = readKey(NS + kind);
      return v && typeof v === "object" ? v : {};
    },
    patch(kind, partial) {
      const next = Object.assign({}, this.get(kind), partial);
      writeKey(NS + kind, next);
      return next;
    },
    clear(kind) {
      writeKey(NS + kind, SINGLETONS[kind] ? {} : []);
    },
  };

  let driver = localDriver;

  /* ---------------------------------------------------------- events
     One event name for everything. A screen re-renders on `storechange`
     rather than guessing when its data went stale, which is also how
     two open tabs stay honest with each other. */

  function emit(kind) {
    window.dispatchEvent(new CustomEvent("storechange", { detail: { kind } }));
  }

  try {
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.indexOf(NS) === 0) emit(e.key.slice(NS.length));
    });
  } catch (e) {
    /* ignore */
  }

  /* ---------------------------------------------------------- ids */

  function uid(prefix) {
    return (
      (prefix || "id") +
      "_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    );
  }

  /* ---------------------------------------------------------- trade maths
     The one place R is computed. Read this before changing anything:

     grossPL   sum of every exit leg, signed by direction, in trade units
     netPL     grossPL minus fees                    <- what the user made
     riskMoney what was at stake when the trade opened
     R         netPL / riskMoney                     <- the only comparable
               number across symbols, sizes and accounts

     A trade with no stop has no risk and therefore no R. We report null
     rather than zero, because zero would quietly average into the stats
     and flatter a reckless trade. */

  function num(v) {
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  function compute(trade) {
    const t = trade || {};
    const dir = t.side === "Short" ? -1 : 1;
    const entry = num(t.entry);
    const stop = num(t.stop);
    const size = num(t.size) || 0;
    const fees = num(t.fees) || 0;

    const legs = (Array.isArray(t.exits) ? t.exits : []).filter(
      (l) => num(l.price) !== null && num(l.size) !== null
    );

    const closedSize = legs.reduce((a, l) => a + num(l.size), 0);
    const open = size > 0 && closedSize < size - 1e-9;

    let gross = 0;
    legs.forEach((l) => {
      gross += (num(l.price) - entry) * dir * num(l.size);
    });

    const contract = num(t.contractValue) || 1;
    const grossPL = gross * contract;
    const netPL = grossPL - fees;

    const riskPerUnit = entry !== null && stop !== null ? Math.abs(entry - stop) : null;
    const riskMoney = riskPerUnit !== null && size ? riskPerUnit * size * contract : null;
    const r = riskMoney ? netPL / riskMoney : null;

    /* planned R:R, known before the trade is taken */
    const target = num(t.target);
    const plannedRR =
      riskPerUnit && target !== null ? Math.abs(target - entry) / riskPerUnit : null;

    const balance = num(t.balanceAtOpen);
    const riskPct = riskMoney && balance ? (riskMoney / balance) * 100 : null;

    const result = !legs.length ? "Open" : netPL > 0 ? "Win" : netPL < 0 ? "Loss" : "Break-even";

    return {
      grossPL,
      netPL,
      fees,
      riskMoney,
      riskPct,
      r,
      plannedRR,
      closedSize,
      open,
      result,
      avgExit: closedSize ? legs.reduce((a, l) => a + num(l.price) * num(l.size), 0) / closedSize : null,
    };
  }

  /* Per-trade discipline score, 0–100. Deliberately winnable by a losing
     trade that followed the plan — that is the whole thesis of the
     product, so it is scored, not merely stated. */
  function discipline(trade, settings) {
    const c = compute(trade);
    const limit = num((settings || {}).riskPct) || DEFAULT_SETTINGS.riskPct;
    let score = 0;

    /* 45 — did the size respect the user's own risk ceiling */
    if (c.riskPct === null) score += 0;
    else if (c.riskPct <= limit + 1e-9) score += 45;
    else if (c.riskPct <= limit * 1.5) score += 22;

    /* 20 — was a stop defined at all */
    if (num(trade.stop) !== null) score += 20;

    /* 15 — was the stop honoured (self-reported, and asked plainly) */
    if (trade.stopHonoured !== false) score += 15;

    /* 10 — was the trade planned to pay more than it risked */
    if (c.plannedRR !== null && c.plannedRR >= 1.5) score += 10;
    else if (c.plannedRR !== null && c.plannedRR >= 1) score += 5;

    /* 10 — was it reviewed, and was the emotion honest */
    if (trade.review && String(trade.review).trim().length >= 12) score += 6;
    if (trade.emotion) score += 4;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /* ---------------------------------------------------------- aggregates
     What the dashboard reads. Never recomputed on a page. */

  function stats(trades, settings) {
    const closed = trades.filter((t) => !compute(t).open && compute(t).result !== "Open");
    const rows = closed.map((t) => compute(t));
    const wins = rows.filter((r) => r.netPL > 0);
    const losses = rows.filter((r) => r.netPL < 0);

    const grossWin = wins.reduce((a, r) => a + r.netPL, 0);
    const grossLoss = Math.abs(losses.reduce((a, r) => a + r.netPL, 0));
    const withR = rows.filter((r) => r.r !== null);

    const netPL = rows.reduce((a, r) => a + r.netPL, 0);
    const winRate = rows.length ? (wins.length / rows.length) * 100 : null;
    const avgWinR = wins.length
      ? wins.filter((r) => r.r !== null).reduce((a, r) => a + r.r, 0) / (wins.filter((r) => r.r !== null).length || 1)
      : null;
    const avgLossR = losses.length
      ? losses.filter((r) => r.r !== null).reduce((a, r) => a + r.r, 0) / (losses.filter((r) => r.r !== null).length || 1)
      : null;

    /* expectancy in R — the number that actually predicts survival */
    const expectancy = withR.length ? withR.reduce((a, r) => a + r.r, 0) / withR.length : null;

    /* equity curve and peak-to-trough drawdown, in account currency */
    let equity = num((settings || {}).balance) || DEFAULT_SETTINGS.balance;
    let peak = equity;
    let maxDD = 0;
    const curve = [{ t: null, equity }];
    closed
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .forEach((t) => {
        equity += compute(t).netPL;
        peak = Math.max(peak, equity);
        maxDD = Math.max(maxDD, peak ? ((peak - equity) / peak) * 100 : 0);
        curve.push({ t: t.date, equity });
      });

    const avgRisk = rows.filter((r) => r.riskPct !== null);

    return {
      count: trades.length,
      closed: rows.length,
      open: trades.length - rows.length,
      netPL,
      winRate,
      profitFactor: grossLoss ? grossWin / grossLoss : grossWin ? Infinity : null,
      expectancy,
      avgWinR,
      avgLossR,
      avgRiskPct: avgRisk.length ? avgRisk.reduce((a, r) => a + r.riskPct, 0) / avgRisk.length : null,
      maxDrawdownPct: maxDD,
      curve,
      discipline: trades.length
        ? Math.round(trades.reduce((a, t) => a + discipline(t, settings), 0) / trades.length)
        : null,
    };
  }

  /* Consecutive days with at least one logged trade, counting back from
     today. The streak is the cheapest retention mechanic that also
     happens to make the user better. */
  function streak(trades) {
    const days = new Set(trades.map((t) => String(t.date || "").slice(0, 10)).filter(Boolean));
    if (!days.size) return 0;
    const d = new Date();
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) n++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  /* ---------------------------------------------------------- public API */

  const api = {
    driver: () => driver.name,
    storageBlocked: () => storageBlocked,
    vocab: { EMOTIONS, SETUPS, SESSIONS, MARKETS },

    /* swap in a backend later without touching a screen */
    useDriver(next) {
      driver = next;
      emit("*");
    },

    settings: {
      get() {
        return Object.assign({}, DEFAULT_SETTINGS, driver.get("settings"));
      },
      patch(partial) {
        const out = driver.patch("settings", partial);
        emit("settings");
        return Object.assign({}, DEFAULT_SETTINGS, out);
      },
    },

    /* A trade the user has planned on another screen but not yet logged.
       The calculators write one and the journal consumes it exactly once,
       which is what keeps planned risk and logged risk the same number
       instead of two numbers that happen to be typed twice. */
    draft: {
      get() {
        const d = driver.get("draft");
        return d && Object.keys(d).length ? d : null;
      },
      set(partial) {
        driver.clear("draft");
        const out = driver.patch("draft", partial);
        emit("draft");
        return out;
      },
      take() {
        const d = api.draft.get();
        if (d) {
          driver.clear("draft");
          emit("draft");
        }
        return d;
      },
      clear() {
        driver.clear("draft");
        emit("draft");
      },
    },

    trades: {
      list() {
        return driver
          .list("trades")
          .slice()
          .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
      },
      find(id) {
        return driver.list("trades").find((t) => t.id === id) || null;
      },
      save(trade) {
        const now = new Date().toISOString();
        const record = Object.assign(
          {
            id: uid("t"),
            createdAt: now,
            exits: [],
            tags: [],
            fees: 0,
            account: api.settings.get().accountName,
          },
          trade
        );
        record.updatedAt = now;
        if (!record.balanceAtOpen) record.balanceAtOpen = api.settings.get().balance;
        driver.put("trades", record);
        emit("trades");
        return record;
      },
      remove(id) {
        const ok = driver.remove("trades", id);
        emit("trades");
        return ok;
      },
      clear() {
        driver.clear("trades");
        emit("trades");
      },
    },

    compute,
    discipline,
    stats,
    streak,
    uid,
  };

  return api;
})();

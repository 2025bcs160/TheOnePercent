/* Dashboard (pages/dashboard.html)
   -------------------------------------------------------------------
   Two states, decided by one question: has anything been logged?

   Empty  -> the guided "start here" block and the watchlist only. No
             wall of zeroes, no fake sparklines.
   Live   -> equity curve, R by setup, recent trades, real metrics.

   Every number comes from Store.stats / Store.compute, so this screen
   cannot disagree with the journal. The account + period filter at the
   top governs the whole page, which is the thing the original roadmap
   was missing: four widgets each with their own implied date range
   read as four contradictions.
   ------------------------------------------------------------------- */

(() => {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const state = { range: "30", account: "all" };

  const settings = () => Store.settings.get();

  function money(n, signed) {
    if (n === null || n === undefined || !Number.isFinite(n)) return "—";
    const s = settings();
    const abs = Math.abs(n);
    const dp = abs >= 1000 || s.currency === "UGX" ? 0 : 2;
    const body = abs.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
    return (n < 0 ? "−" : signed && n > 0 ? "+" : "") + body + " " + (s.currency || "");
  }

  function bare(n, signed) {
    if (n === null || !Number.isFinite(n)) return "—";
    const abs = Math.abs(n);
    const dp = abs >= 1000 || settings().currency === "UGX" ? 0 : 2;
    return (
      (n < 0 ? "−" : signed && n > 0 ? "+" : "") +
      abs.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })
    );
  }

  const rfmt = (n) =>
    n === null || !Number.isFinite(n) ? "—" : (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(2) + "R";
  const pct = (n, dp) => (n === null || !Number.isFinite(n) ? "—" : n.toFixed(dp === undefined ? 1 : dp) + "%");
  const dir = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");
  const esc = (s) =>
    String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* ------------------------------------------------------------ data */

  function filtered() {
    const cut = state.range === "all" ? null : Date.now() - parseInt(state.range, 10) * 864e5;
    return Store.trades.list().filter((t) => {
      if (cut && new Date(t.date).getTime() < cut) return false;
      if (state.account !== "all" && (t.account || "") !== state.account) return false;
      return true;
    });
  }

  /* ------------------------------------------------------------ metrics */

  function renderStats(trades) {
    const s = Store.stats(trades, settings());
    const streak = Store.streak(Store.trades.list());
    const limit = settings().riskPct;

    /* A win rate on five trades is noise dressed as information, so it
       stays hidden until the sample can carry it. */
    const enoughForWinRate = s.closed >= 10;

    const cards = [
      {
        k: "Net P/L",
        v: money(s.netPL, true),
        n: s.closed ? s.closed + " closed" + (s.open ? ", " + s.open + " open" : "") : "nothing closed yet",
        cls: dir(s.netPL),
      },
      {
        k: "Expectancy",
        v: rfmt(s.expectancy),
        n: s.expectancy === null ? "needs a closed trade" : "per trade, in R",
        cls: dir(s.expectancy),
      },
      {
        k: "Win rate",
        v: enoughForWinRate ? pct(s.winRate, 0) : "—",
        n: enoughForWinRate
          ? "profit factor " + (s.profitFactor === null ? "—" : s.profitFactor === Infinity ? "∞" : s.profitFactor.toFixed(2))
          : s.closed + " of 10 closed trades",
      },
      {
        k: "Discipline",
        v: s.discipline === null ? "—" : s.discipline + "/100",
        n:
          s.avgRiskPct === null
            ? "no sized trades yet"
            : "avg risk " + pct(s.avgRiskPct, 2) + " vs " + limit + "% rule",
        cls: s.discipline === null ? "" : s.discipline >= 75 ? "up" : s.discipline < 50 ? "down" : "",
      },
    ];

    if (streak > 0) {
      cards[3].n = streak + " day streak · " + cards[3].n;
    }

    $("#stats").innerHTML = cards
      .map(
        (c) =>
          `<div class="stat"><div class="k">${esc(c.k)}</div>` +
          `<div class="v ${c.cls || ""}">${esc(c.v)}</div><div class="n">${esc(c.n)}</div></div>`
      )
      .join("");

    return s;
  }

  /* ------------------------------------------------------------ equity */

  function drawEquity(stats) {
    const cv = $("#equity");
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || cv.parentElement.clientWidth;
    const h = 180;
    cv.width = w * dpr;
    cv.height = h * dpr;
    cv.style.height = h + "px";
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const pts = stats.curve;
    if (pts.length < 2) {
      g.fillStyle = css("--faint");
      g.font = "13px " + (css("--sans") || "sans-serif");
      g.textAlign = "center";
      g.fillText("Close a trade and the curve starts here.", w / 2, h / 2);
      return;
    }

    const vals = pts.map((p) => p.equity);
    let lo = Math.min.apply(null, vals);
    let hi = Math.max.apply(null, vals);
    const padv = (hi - lo || Math.abs(hi) * 0.02 || 1) * 0.14;
    lo -= padv;
    hi += padv;

    const padL = 8, padR = 8, padT = 12, padB = 20;
    const x = (i) => padL + (i / (pts.length - 1)) * (w - padL - padR);
    const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB);

    /* the starting balance, so gains and losses are read against it */
    const start = pts[0].equity;
    g.strokeStyle = css("--line-strong");
    g.setLineDash([3, 4]);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(padL, y(start));
    g.lineTo(w - padR, y(start));
    g.stroke();
    g.setLineDash([]);

    const ending = vals[vals.length - 1];
    const colour = ending >= start ? css("--up") : css("--down");

    /* fill under the curve, clipped to the baseline */
    const grad = g.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, colour + "38");
    grad.addColorStop(1, colour + "00");
    g.beginPath();
    g.moveTo(x(0), y(vals[0]));
    pts.forEach((p, i) => g.lineTo(x(i), y(p.equity)));
    g.lineTo(x(pts.length - 1), y(start));
    g.lineTo(x(0), y(start));
    g.closePath();
    g.fillStyle = grad;
    g.fill();

    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(x(i), y(p.equity)) : g.moveTo(x(i), y(p.equity))));
    g.strokeStyle = colour;
    g.lineWidth = 1.8;
    g.lineJoin = "round";
    g.stroke();

    /* last point marked, because the current balance is the only value
       anyone actually looks for */
    g.beginPath();
    g.arc(x(pts.length - 1), y(ending), 3.2, 0, Math.PI * 2);
    g.fillStyle = colour;
    g.fill();

    $("#eq-note").textContent = money(ending);
    $("#eq-dd").innerHTML =
      stats.maxDrawdownPct > 0.01
        ? `<span><i class="dot down"></i> max drawdown ${pct(stats.maxDrawdownPct, 1)}</span>`
        : "";
  }

  /* ------------------------------------------------------------ by setup */

  function renderBySetup(trades) {
    const map = new Map();
    trades.forEach((t) => {
      const c = Store.compute(t);
      if (c.open || c.r === null) return;
      const k = t.setup || "Untagged";
      const cur = map.get(k) || { n: 0, r: 0, pl: 0 };
      cur.n += 1;
      cur.r += c.r;
      cur.pl += c.netPL;
      map.set(k, cur);
    });

    const rows = Array.from(map.entries())
      .map(([k, v]) => ({ k, n: v.n, exp: v.r / v.n, pl: v.pl }))
      .sort((a, b) => b.exp - a.exp);

    if (!rows.length) {
      $("#by-setup").innerHTML =
        '<p class="muted-note">Nothing closed in this period yet. Setups appear here once a trade has an exit.</p>';
      return;
    }

    const max = Math.max.apply(null, rows.map((r) => Math.abs(r.exp)).concat([0.5]));
    $("#by-setup").innerHTML = rows
      .map((r) => {
        const wide = (Math.abs(r.exp) / max) * 50;
        const left = r.exp >= 0 ? 50 : 50 - wide;
        return `<div class="bs-row">
          <div>
            <div class="lab">${esc(r.k)}<small>${r.n} trade${r.n > 1 ? "s" : ""} · ${bare(r.pl, true)}</small></div>
            <div class="track"><i class="${r.exp < 0 ? "neg" : ""}" style="left:${left}%;width:${wide}%"></i></div>
          </div>
          <div class="val ${dir(r.exp)}">${rfmt(r.exp)}</div>
        </div>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------ recent */

  function renderRecent(trades) {
    const rows = trades.slice(0, 8);
    $("#recent-body").innerHTML = rows
      .map((t) => {
        const c = Store.compute(t);
        const d = Store.discipline(t, settings());
        const band = d >= 75 ? "" : d >= 50 ? "mid" : "low";
        return `<tr>
          <td class="t-date"><b>${String(t.date).slice(5, 10)}</b></td>
          <td><div class="t-sym"><span class="side ${t.side === "Short" ? "short" : "long"}">${esc(t.side)}</span><b>${esc(t.symbol)}</b></div></td>
          <td>${esc(t.setup || "—")}</td>
          <td class="num ${c.r === null ? "" : dir(c.r)}">${c.open ? '<span class="t-open">open</span>' : rfmt(c.r)}</td>
          <td class="num ${c.open ? "" : dir(c.netPL)}">${c.open ? "—" : bare(c.netPL, true)}</td>
          <td class="num"><span class="disc"><span>${d}</span><span class="disc-bar ${band}"><i style="width:${d}%"></i></span></span></td>
        </tr>`;
      })
      .join("");
  }

  /* ------------------------------------------------------------ greeting */

  function renderGreeting() {
    const me = Shell.profile();
    const hour = new Date().getHours();
    const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const total = Store.trades.list().length;

    if (!me) {
      $("#notice").hidden = false;
      $("#greeting").textContent = part;
      $("#sub").textContent =
        "You are signed in as a guest with no preferences saved. Pick your markets and experience level and this page starts adapting to you.";
      return;
    }

    $("#notice").hidden = true;
    $("#greeting").textContent = part + (me.name ? ", " + me.name.split(" ")[0] : "");

    if (total) {
      const s = Store.stats(filtered(), settings());
      $("#sub").textContent =
        s.closed >= 1
          ? "You have closed " + s.closed + " trade" + (s.closed > 1 ? "s" : "") +
            " in this period at " + rfmt(s.expectancy) + " a trade. " +
            (s.expectancy > 0
              ? "Keep the size where it is."
              : "The size is the first thing to check, not the strategy.")
          : "Trades are logged but none are closed yet, so there is nothing to measure.";
    } else {
      const exp = (me.experience || "").toLowerCase();
      $("#sub").textContent =
        exp.indexOf("new") >= 0 || exp.indexOf("begin") >= 0
          ? "You told us you are new to trading, so the Learn path is unlocked first and position sizes stay capped at one percent until ten trades are logged."
          : exp.indexOf("exp") >= 0 || exp.indexOf("adv") >= 0
          ? "You told us you are experienced, so the journal opens with the full field set and the risk cap is yours to set."
          : "Your preferences are saved. The journal and calculators are ready when you are.";
    }

    const list = me.markets && me.markets.length ? me.markets : [];
    $("#chips").innerHTML =
      list.map((m) => `<span class="chip accent">${esc(m)}</span>`).join("") +
      (me.experience ? `<span class="chip">${esc(me.experience)}</span>` : "");
  }

  /* ------------------------------------------------------------ watchlist */

  function renderWatchlist() {
    const me = Shell.profile();
    const picked = me && me.markets && me.markets.length ? me.markets.map((m) => String(m).toLowerCase()) : null;
    const rows = picked
      ? Shell.quotes.filter((q) =>
          picked.some(
            (p) =>
              q.cls.toLowerCase().indexOf(p) >= 0 ||
              p.indexOf(q.cls.toLowerCase()) >= 0 ||
              q.symbol.toLowerCase() === p
          )
        )
      : Shell.quotes;
    const show = rows.length ? rows : Shell.quotes;

    $("#wl-source").textContent = picked && rows.length ? "from onboarding" : "defaults";
    $("#watchlist").innerHTML = show
      .map((q) => {
        const up = q.chg >= 0;
        return `<div class="wl-row">
          <span><b>${esc(q.symbol)}</b><small>${esc(q.name)} · ${esc(q.cls)}</small></span>
          <span class="wl-price">${q.price.toLocaleString("en-US", {
            minimumFractionDigits: q.dec,
            maximumFractionDigits: q.dec,
          })}
          <small class="chg ${up ? "up" : "down"}">${(up ? "+" : "−") + Math.abs(q.chg).toFixed(2)}%</small></span>
        </div>`;
      })
      .join("");

    if (!picked) {
      $("#wl-foot").textContent = "Showing the default five until you pick your markets in onboarding.";
    }
  }

  /* ------------------------------------------------------------ render */

  function render() {
    const trades = filtered();
    const hasAny = Store.trades.list().length > 0;

    $("#live-grid").hidden = !hasAny;
    /* the guided block keeps its place until the journal is genuinely
       started — an empty period is not an empty journal */
    $("#empty-grid").classList.toggle("started", hasAny);
    $$("#empty-grid .panel").forEach((p) => {
      if (p.querySelector("#watchlist")) return;
      p.hidden = hasAny;
    });

    const stats = renderStats(trades);
    renderGreeting();
    renderWatchlist();

    if (hasAny) {
      drawEquity(stats);
      renderBySetup(trades);
      renderRecent(trades);
    }

    const accounts = Array.from(new Set(Store.trades.list().map((t) => t.account).filter(Boolean)));
    const sel = $("#f-account");
    const want = accounts.join("|");
    if (sel.dataset.k !== want) {
      sel.dataset.k = want;
      sel.innerHTML =
        '<option value="all">All accounts</option>' + accounts.map((a) => `<option>${esc(a)}</option>`).join("");
      sel.value = accounts.indexOf(state.account) >= 0 ? state.account : "all";
      state.account = sel.value;
    }
  }

  function init() {
    $("#f-range").addEventListener("change", (e) => {
      state.range = e.target.value;
      render();
    });
    $("#f-account").addEventListener("change", (e) => {
      state.account = e.target.value;
      render();
    });

    window.addEventListener("storechange", render);
    window.addEventListener("themechange", () => {
      const s = Store.stats(filtered(), settings());
      drawEquity(s);
    });

    let t = null;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (!$("#live-grid").hidden) drawEquity(Store.stats(filtered(), settings()));
      }, 140);
    });

    render();
  }

  /* shell.js loads after this file, so wait for it before reading the profile */
  if (window.Shell) init();
  else window.addEventListener("load", init);
})();

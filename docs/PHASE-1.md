# TheOnePercent · Phase 1 (revised)

This supersedes `TheOnePercent-Phase-1-Roadmap.pdf` where the two disagree. The
PDF got the screens right. What it was missing was everything underneath them:
a data model, a market-data source, a theme, and an honest split between the
loop that must ship and the surfaces that can follow it.

---

## 1. What changed and why

### 1.1 Phase 1 is now 1A and 1B

The PDF's own closing page admits the risk: "building all twelve surfaces to
sixty percent instead of the loop to a hundred percent." That is not a risk to
watch, it is a plan to write down. So it is written down.

**Phase 1A — the loop that has to close.** Cover page, auth, onboarding,
journal, calculators, dashboard, settings. A stranger lands, signs up, sizes a
position, logs the trade, and sees the truth about it. Nothing here is optional,
because removing any one of them breaks the loop.

**Phase 1B — the surfaces that make it a product.** Charts and Market Watch,
market context (news, calendar, sentiment), Learn, leaderboard. Each one is
valuable and each one can arrive a week late without the product being broken.

### 1.2 There is now a data layer, and it is swappable

The PDF describes email verification, a persistent journal and a leaderboard —
none of which a static front end can actually do. Rather than choose between
"fake it forever" and "stop and build a backend", every screen talks to one
module, `assets/store.js`, which exposes a driver interface:

```
Store.trades.list()  .save(t)  .remove(id)
Store.profile.get()  .patch(p)
Store.settings.get() .patch(p)
```

Today the driver is `local` (browser storage, with an in-memory fallback for
sandboxed frames). Later, a `rest` driver with the same five methods points at a
real API and no screen changes. This is the single most important structural
decision in the revision: it is what stops Phase 1 from being a demo that has to
be rewritten.

**Honest labelling until the backend exists.** Sign-up says the account is local
to this browser. The verification screen does not pretend an email was sent.
The leaderboard ships in 1B, after the backend, because a leaderboard with one
device and no server is theatre.

### 1.3 Charts: Lightweight Charts, not hand-rolled

Hand-building candlesticks, Fibonacci, zones, indicators and a volume pane is a
month of work that ends up worse than free. Phase 1B uses
[Lightweight Charts](https://tradingview.github.io/lightweight-charts/), the
charting engine TradingView open-sourced, with our own toolbar, drawing overlay
and — the part that actually matters — our own **Save to journal** button. The
engine is theirs; the product is ours. The existing canvas sparklines stay,
because they are small, fast, and nothing about them is worth a dependency.

### 1.4 Market data: simulated now, real behind one interface

All quotes come from `Feed`, which streams deterministic, realistic prices and
carries a visible **Demo data** badge wherever it is displayed. Swapping in a
real provider is one module, and the badge is the promise that we will never
quietly show fake prices as real ones. The PDF's "visible refresh time and a
graceful failure state" is kept, and now has something to be true about.

### 1.5 Dark first

Traders sit in front of these screens for hours, at night, next to a broker
terminal that is already dark. TradingView is dark by default for a reason.
Dark is now the default theme, light is a first-class toggle in the rail, and
every colour is a token so neither theme is a second-class citizen.

### 1.6 Onboarding asks a third question

Every calculator reads account balance, account currency and default risk
percent. The PDF buried all three in Settings, which means the calculators are
broken on day one for anyone who never opens Settings. Onboarding is now three
questions: markets, experience, and **starting balance plus default risk**.

### 1.7 The discipline score drops win rate

The PDF's formula is risk adherence 40, win rate 30, journaling consistency 30 —
and then says the point is to not reward luck. Win rate *is* partly luck, and it
actively punishes the correct low-win-rate, high-R strategies the lessons teach.
Revised:

| Component | Weight | Why |
| --- | --- | --- |
| Risk adherence | 40% | Share of trades inside the user's own risk rule. |
| Risk consistency | 25% | Low variance in risk per trade. Punishes revenge sizing. |
| Journaling consistency | 25% | Days logged against days traded. |
| Plan adherence | 10% | Trades where the stop was honoured, self-reported. |

Profit and loss is still excluded. Win rate is still shown on the dashboard,
where it is information, and kept out of the ranking, where it is noise. A
minimum of twenty logged trades is required to appear at all, which is the
cheapest anti-gaming rule available.

### 1.8 The journal spec grew the fields that make R correct

Without these, every R multiple the dashboard shows is wrong:

- **Fees and commissions** per trade, subtracted before R is computed.
- **Partial exits** — one trade, several exits, a weighted average result.
- **Trade currency vs account currency**, so a JPY pair reports in UGX.
- **Multiple accounts** (demo and live at minimum), filterable everywhere.
- **CSV import** from a broker statement, because nobody retypes six months.

### 1.9 A global filter bar on the dashboard

Stat cards over "all trades ever" are close to meaningless. The dashboard gets
one persistent filter — date range and account — that every widget reads.

### 1.10 Things the PDF did not mention at all

- **Command palette.** `Ctrl/⌘ K` already focuses search; it becomes a real
  palette that can jump to a symbol, a tool, or a lesson, plus `/` to search
  and `N` to log a trade. This is most of what makes a terminal feel fast.
- **Loading, empty and error states as a first-class item**, not just the one
  dashboard empty state.
- **Instrumentation.** A handful of events — signed up, onboarded, first trade
  logged, second session — because "does the loop close" is a measurable
  question and we should not guess at it.
- **Legal surface.** A persistent risk disclaimer, "not financial advice" on
  sentiment and news, and the DOB age gate actually enforced rather than
  collected.
- **Accessibility in the definition of done.** Keyboard reachable, visible
  focus, WCAG AA contrast — including the up/down greens and reds, which fail
  contrast in almost every trading product ever shipped.

---

## 2. Build order

Steps 1–5 are complete. Step 6 is next.

| # | Step | State |
| --- | --- | --- |
| 1 | Cover page, shell, navigation, right rail | done |
| 2 | Sign-up, login, onboarding | done |
| 3 | Theme system, data layer, simulated feed | done |
| 4 | Journal — log, filters, detail drawer, import | done |
| 5 | Calculators and converters | done |
| 6 | **Dashboard widgets over real journal data** | next |
| 7 | Settings | next |
| 8 | Charts and Market Watch (Lightweight Charts) | 1B |
| 9 | Market context — news, calendar, sentiment | 1B |
| 10 | Learn — lesson paths and resource library | 1B |
| 11 | Backend (`rest` driver), real accounts and verification | 1B |
| 12 | Leaderboard | 1B, after the backend |

The journal comes before the dashboard because the dashboard is a view over
journal data. The calculators come before the dashboard because they are
self-contained and immediately useful. That part of the PDF was right.

---

## 3. Definition of done

**Phase 1A**

- A new user goes from cover page to a logged, reviewed trade in one sitting,
  unaided.
- Dashboard numbers are derived from journal entries and are arithmetically
  correct, including fees and partial exits.
- Position size, pip value and margin agree with a broker's own calculator to
  two decimal places.
- Every screen is usable at 375px. Mobile is not a Phase 2 concern in this
  market.
- Every screen works in both themes.
- Any simulated data carries a Demo badge.
- Keyboard reachable, visible focus, AA contrast.

**Phase 1B** adds: charts end in a journal entry, context panels degrade
gracefully when a feed fails, lessons gate at eighty percent, and the
leaderboard shows handles only with the formula printed on the page.

---

## 4. Out of scope, unchanged

Broker connections, live orders, copy trading, backtesting, signal selling,
social features beyond the leaderboard, payments, native apps, AI trade
analysis. All deliberate. The last one stays out until there is journal data
worth analysing, which is precisely the point of shipping the journal first.

---

## 5. Architecture notes

```
index.html              cover page (logged out)
pages/
  sign-up.html          account creation
  login.html
  onboarding.html       markets → experience → balance & risk
  dashboard.html        feedback surface
  journal.html          trade log
  calculators.html      sizing, risk, margin, P&L, converters
assets/
  theme.js              sets data-theme before first paint (no flash)
  shell.css  shell.js   tokens, chrome, top nav, right rail, palette
  store.js              data layer — local driver today, rest driver later
  instruments.js        instrument + currency reference, all sizing maths
                        (demo prices and rates, carries the Demo badge)
  <page>.css/.js        page-specific
docs/PHASE-1.md         this file
```

Conventions: every colour is a token, every page sets `data-page` and
`data-depth` on `<body>` and includes `shell.js` last, and no screen touches
browser storage directly — it goes through `Store`.

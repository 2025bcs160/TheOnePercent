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
Store.settings.get() .patch(p)  .clear()
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

Steps 1–7 are complete, plus the pre-trade checklist below. Step 8 (charts) is next.

| # | Step | State |
| --- | --- | --- |
| 1 | Cover page, shell, navigation, right rail | done |
| 2 | Sign-up, login, onboarding | done |
| 3 | Theme system, data layer, simulated feed | done |
| 4 | Journal — log, filters, detail drawer, import | done |
| 5 | Calculators and converters | done |
| 6 | **Dashboard widgets over real journal data** | done |
| 7 | Settings — account, risk rules, guardrails, profile, data | done |
| 8 | Charts and Market Watch (Lightweight Charts) | 1B |
| 9 | Market context — news, calendar, sentiment | 1B |
| 10 | **Learn — lesson paths, quiz gates, resource library** | done |
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

## 3d. Calculators: one at a time

The calculators screen shipped as eight panels stacked down one page, two to
a row. Every one of them worked, and the screen was still wrong: whichever
calculator you came for was below the fold, and the two-column grid kept a
calculator you were not using in your eyeline while you typed into one you
were.

It is now a dropdown — grouped into "before you enter", "what it would
mean" and "quick conversions" — showing one calculator at a time, with a
line under it saying in plain words what that calculator answers, because a
list of eight nouns does not tell a beginner which one they need. Arrows
step through them for when you do not know what you are looking for.

The choice lives in the URL fragment, which costs nothing and pays for
itself three times: the back button behaves, `calculators.html#mg` is a
link straight to margin, and every existing deep link into this page still
lands on a visible panel instead of a hidden one. It is deliberately not
saved to settings — a UI preference is not account data, and writing one on
every click would fire a change event across every open screen for nothing.

The demo-rates badge now hides itself on the compounding calculator, which
is the one view on the page that uses no rates at all.

## 3c. Added beyond the original plan: leak detection

The roadmap asked for dashboard widgets over journal data. Widgets were the
easy half. The screen as specified — net P/L, expectancy, win rate, a curve —
is entirely descriptive: it says what happened and nothing about what to
change, and a trader opening it every morning is asking the second question.

So the dashboard now leads with **what is costing you money**, and the
engine behind it (`Store.leaks()`) separates two kinds of claim:

| | Rules | Patterns |
| --- | --- | --- |
| What it is | A rule the user set, broken | A statistical claim about the future |
| Sample gate | none — one occurrence counts | 3 in the subset, 6 closed in the journal |
| Priced as | exact arithmetic (excess risk, R past the stop, P&L of the extra entries) | subset expectancy minus the expectancy of the rest of the journal |
| Shown as | red left edge, "Rule broken" | neutral edge, sample size printed on the card |

Rules detected: sizing above the risk rule, a loss past 1.15R (the stop
moved), a trade logged with no stop at all, entries past the daily trade
limit. Patterns detected: entries taken within ninety minutes of closing a
loss, and the worst session, state of mind, setup, day and instrument.

Three honesty rules are built in and should not be relaxed:

1. A pattern is measured against the rest of the journal, never against
   zero. A losing session inside a losing month is not a leak.
2. Every pattern carries its sample size on the card, without exception.
3. A finding only appears if removing it would have helped. Two cuts over
   exactly the same trades are deduped — that is one finding said twice.

The panel also names the best setup and the best session. A screen that
only lists faults gets opened once and never again.

**Open risk** was added alongside it, and it is the only forward-looking
number on the site: what is at stake right now if every open stop is hit,
measured against the daily loss rail, so a three percent day is visible
before it happens. Positions with no stop are counted separately, never
silently as zero.

The equity curve got a cursor readout — balance, change and date per point
— because a line without numbers is decoration.

Deliberately **not** built: a setup/session/day grouping toggle on the
dashboard. The journal's insights tables already do that, and the
dashboard's job here is diagnosis, not a second copy of the breakdown.

## 3b. Added beyond the original plan: guardrails

The plan graded trades **after** they were closed. A discipline score of 62 tells
a trader what they already know — the money is gone. The rule that would have
saved the money has to be checked *before* the next entry, so `Store.guardrails()`
reads the journal for today and answers a different question: should there be
another trade at all?

Three rails, all of them the user's own numbers, all of them set in Settings:

| Rail | Setting | Default |
| --- | --- | --- |
| Daily loss stop | `maxDailyLossPct` | 3% of balance |
| Trades per day | `maxTradesPerDay` | 3 |
| Cool-off after losses in a row | `coolOffAfterLosses` | 3 |

Any rail set to `0` is switched off. "Today" is the local calendar day, not UTC —
a Kampala trader's day does not end at 3am. When a rail is broken the journal and
the dashboard show a banner naming the rule and what it is protecting; nothing is
ever *blocked*, because a tool that locks a trader out gets closed and the trade
goes in the broker anyway, unlogged. The point is that the trade is taken
knowingly. With warnings switched off the breach is still computed and flagged
`muted`, so Settings can tell the user the rule is broken and nothing is saying so.

`minRR` moved out of the code and into Settings at the same time: the discipline
score used to award its planned-R:R marks against a hard-coded 1.5.

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
  settings.html         account, risk rules, guardrails, profile, data
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

## 3e. Added beyond the original plan: the pre-trade checklist

Every leak the dashboard can name — oversized, stop overrun, revenge entry, one
trade too many — was a decision made in the minute before the entry. The
dashboard reports them after the money is gone. The checklist runs while it can
still change the outcome, and it is the only screen in the app that can.

It lives as the last fieldset in the trade form, titled **Before you enter**, and
is split deliberately.

**What the app already knows** is computed and re-checked on every keystroke, so
there is nothing to tick:

| Check | Passes when |
| --- | --- |
| A stop is set | `stop` is a number |
| The stop is on the losing side | long stop below entry, short stop above (only shown once a stop exists) |
| Inside your risk rule | `riskPct` ≤ `settings.riskPct` |
| Meets your minimum R:R | `plannedRR` ≥ `settings.minRR`; no target counts as unmet, because unknown reward is not the same as good reward |
| The setup is named | the setup select is no longer on its placeholder |
| The session is named | same |
| No guardrail breached today | `Store.guardrails()` reports no breach, or guardrails are muted |

**What only you can answer** is three things and no more, because a longer list
is a list people tick without reading:

- a one-line written reason, saved as `t.plan`
- "my stop is where the idea is wrong, not at the loss I can stomach"
- "this is my setup, not the last trade" — reworded to name the loss when the
  last closed trade lost

The verdict stays quiet until there is an entry and a size to judge; being told
eight things are wrong before typing a character is nagging, not coaching.

**It does not block saving.** A checklist that refuses gets lied to, and nothing
here can stop an order at the broker anyway. Overriding costs a sentence
instead: the submit button becomes **Log it anyway**, a confirm names exactly
what is unmet, and the trade is saved carrying `t.unmet` — which the detail
drawer shows as *Taken off plan* and the CSV exports as an `offPlan` column.

Two things follow from that record, and they are the reason the gate is worth
obeying at all:

- `Store.leaks()` gained two cuts — trades taken with the checklist unmet, and
  trades with no reason written — both priced against the rest of the journal by
  the existing `versusRest()` machinery, never against zero. Identical subsets
  still dedupe, so if every off-plan trade is also an unplanned one you see it
  once.
- Editing a trade never rewrites its pre-trade record. A journal that lets you
  tidy up history is worth nothing.

On an existing trade the section relabels to **The plan behind it**: the checks
and the verdict come off, since grading a trade you already took teaches
nothing, but the reason stays editable because writing it down late still beats
leaving it blank.

`discipline()` weights were deliberately **not** changed. Folding the checklist
into the score would silently rewrite every past trade's grade.

---

## 3f. Learn: the path, the gates and the library

Twenty-four lessons in four blocks — Foundations and Risk first (beginner),
Reading the market (intermediate), Build a system (advanced) — about 191
minutes of reading, ten questions at the end of each block, eighty percent
to pass. That is the roadmap's specification and it is built as written:

- Lessons run in order. A lesson opens when the one above it is done; a
  block opens when the block before it was passed at eighty percent.
- Locked lessons are **greyed, not hidden**, with the reason on the row.
  You should be able to see what you are working towards.
- Ten questions, two attempts, then thirty minutes away from it. The
  cooldown shows the exact time it reopens rather than a vague "later".
- **Every wrong answer links back to the lesson that answers it** — by
  question, not by block, so the reading list for the cooldown writes
  itself.
- One worked example per market, filtered to the markets chosen in
  onboarding. A crypto trader reads funding, not swap on a standard lot.
- Progress is visible in the page header, on every block and in the resume
  button, which continues exactly where you stopped.
- A second sub-tab holds the resource library; `learn.html#path`,
  `#library`, `#glossary` and `#lesson/<id>` are all linkable, the same
  fragment pattern the calculators use.

### Five things added beyond the roadmap

**1. Lessons recommended by your own journal.** `Store.leaks()` already
names what is costing money. The path reads it and puts the matching lesson
at the top with the cost attached: "8 trades sized above your own rule,
−7.82R — the lesson for this is Sizing from the stop." A course that
ignores the journal sitting next to it is a blog with a quiz.

**2. A review deck.** Every quiz question enters a five-box Leitner
schedule — missed questions come back tomorrow, known ones at one, three,
seven and twenty-one days, then retire. Passing a gate once is not the same
as knowing it in March.

**3. Real downloads.** The roadmap says PDFs. Ten files ship instead as
Markdown and CSV generated in the browser from the same content object the
lessons read, so nothing can 404 and no PDF renderer has to be shipped in
Phase 1. The journal template is a CSV whose columns are the ones the
journal importer already expects, so the library round-trips into the app.

**4. An apply step on every lesson.** Each lesson ends in one action inside
the product — size this in the position-size calculator, set this rail in
settings, read your own leak panel — because a lesson that ends in "makes
sense" changes nothing.

**5. A glossary of 75 terms, inline.** Terms are underlined in the prose
with a definition on hover *and* on keyboard focus, listed in the lesson's
side rail, searchable on their own sub-tab, and indexed in the shell's
search box, so "what is expectancy" is answered from any screen.

Two smaller decisions worth writing down. An **experienced** profile can
sit the beginner gates immediately without reading the block — the gate is
the proof, so it can be earned early rather than assumed, and the lessons
are still there when the gate is missed. And the **video slot** is drawn as
a labelled placeholder saying the recording is in progress, rather than an
empty player: Phase 1 has no recordings, and a player that does nothing
reads as a bug.

Progress lives in `Store.learn` — read timestamps, per-block quiz results,
the review schedule and per-lesson notes — so no screen touches browser
storage directly and the `rest` driver in step 11 needs no change here.
The curriculum itself is data in `assets/lessons.js`, which is why the
shell's search box can index every lesson, term and file without a second
copy of any of it.

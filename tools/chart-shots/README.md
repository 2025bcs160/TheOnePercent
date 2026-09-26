# The1% chart shots

Renders the "On a real chart" images used in the Academy
(`assets/academy/shots/*.webp`) from real OHLC price history, in The1% style
(dark paper, brand colours, IBM Plex, The1% watermark and badge).

These are **not** screenshots of TradingView or any other platform. Every
image is drawn from raw price data, so the annotations sit on the exact
candles and the branding is ours.

## Files

- `render.py` — the renderer (HTML/SVG drawn in headless Chromium, saved as WebP) (candles, zones, FVG boxes, lines, rings, arrows, session bands).
- `specs.py` — one entry per image: symbol, timeframe, date window and annotations.
- `preview.py` — contact sheet for scanning date windows: `python preview.py out.png EURUSD,1D,2025-02-01,2025-04-10 ...`
- `data/` — OHLC CSVs (`Datetime,Open,High,Low,Close`, times in UTC). Only the files the specs use are committed.
- `fonts/` — IBM Plex (SIL Open Font License).

## Usage

```bash
pip install pillow playwright && playwright install chromium
python render.py                 # renders every spec to assets/academy/shots/
python render.py fvg-bull-eurusd # renders one
```

Data came from Yahoo Finance via `yfinance` (1H history). Intraday timestamps are
stored in UTC and 4H bars are resampled from 1H on UTC boundaries. Forex daily bars
are rebuilt from the 1H series because Yahoo's FX daily bars are unreliable (the
older EURUSD, GBPUSD and AUDUSD daily files use London-midnight days, the newer
pairs use UTC days).

Worked examples use `{"t": "step", "n": 1, "at": ..., "p": ..., "dx": .., "dy": ..}`
markers; the lesson figure's `steps` list explains each number in order.

Add `"before": {"cut": <timestamp>, "ann": [...]}` to a spec to also render
`<id>-before.webp`: the same window cut at the decision bar, with the plan drawn
and later price hidden. The lesson shows both behind a Before / After toggle.
To add a new image, add the CSV to `data/`, add a spec to `specs.py`, render,
and check it visually before using it in a lesson with
`{ type: "shot", src: "<id>", title, caption, meta, alt }`.

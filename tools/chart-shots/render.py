"""The1% chart screenshots.

Renders real market data (OHLC CSVs in ./data) into platform-style chart
screenshots carrying The1% branding, then annotates them from a spec so the
drawing always sits on the exact candles the lesson talks about.

  python tools/chart-shots/render.py            # render every spec
  python tools/chart-shots/render.py cs-hammer  # render one

Specs live in specs.py. Output: assets/academy/shots/<id>.webp
Data: Yahoo Finance daily / hourly history, 4H resampled from 1H.
"""

import csv
import datetime as dt
import glob
import html
import math
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "assets" / "academy" / "shots"
DATA = HERE / "data"
FONTS = HERE / "fonts"

W, H = 1440, 810
TOP = 46          # toolbar
AXR = 78          # right price axis
AXB = 30          # bottom time axis
PADT, PADB = 22, 18

C = {
    "bg": "#0d111a",
    "panel": "#121620",
    "grid": "#1a2030",
    "line": "#242b3a",
    "ink": "#e9edf6",
    "muted": "#8a94aa",
    "brand": "#5b78ff",
    "up": "#2ed08a",
    "down": "#ff5f6d",
    "warn": "#e2b23f",
    "demand": "#2ed08a",
    "supply": "#ff5f6d",
    "white": "#ffffff",
}


def col(k):
    return C.get(k or "brand", k if (k or "").startswith("#") else C["brand"])


def esc(s):
    return html.escape(str(s), quote=True)


# --------------------------------------------------------------- data

def load(symbol, tf):
    rows = []
    with open(DATA / f"{symbol}_{tf}.csv") as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            try:
                t = row[0][:19]
                o, h, l, c = (float(x) for x in row[1:5])
            except (ValueError, IndexError):
                continue
            if not all(math.isfinite(v) for v in (o, h, l, c)):
                continue
            rows.append({"t": t, "o": o, "h": max(h, o, c), "l": min(l, o, c), "c": c})
    return rows


def window(rows, start, end):
    return [r for r in rows if start <= r["t"][: len(start)] and r["t"][: len(end)] <= end]


# ------------------------------------------------------------- render

def fmt_price(p, dec):
    return f"{p:,.{dec}f}"


def render(spec):
    rows = load(spec["symbol"], spec["tf"])
    bars = window(rows, spec["start"], spec["end"])
    if len(bars) < 5:
        raise SystemExit(f"{spec['id']}: only {len(bars)} bars in window")
    n = len(bars)
    dec = spec.get("dec", {"EURUSD": 5, "GBPUSD": 5, "AUDUSD": 5, "NZDUSD": 5, "USDCAD": 5, "USDCHF": 5, "EURGBP": 5, "USDJPY": 3, "EURJPY": 3, "GBPJPY": 3, "AUDJPY": 3, "BTCUSD": 0, "SPX": 1, "NAS100": 1}.get(spec["symbol"], 2))

    idx = {b["t"]: i for i, b in enumerate(bars)}

    def bi(t):
        """bar index from a timestamp prefix or an int index (negatives from end)."""
        if isinstance(t, (int, float)):
            return t if t >= 0 else n + t
        for i, b in enumerate(bars):
            if b["t"].startswith(t):
                return i
        # nearest bar at/after the time
        for i, b in enumerate(bars):
            if b["t"] >= t:
                return i
        return n - 1

    # "cut": a before-the-trade view. The x scale keeps the whole window, but only
    # bars up to the cut are drawn; the rest of the chart is left blank.
    ci = bi(spec["cut"]) if spec.get("cut") else n - 1
    vis = bars[: ci + 1]
    lo = min(b["l"] for b in vis)
    hi = max(b["h"] for b in vis)
    for a in spec.get("ann", []):
        for k in ("lo", "hi", "p", "entry", "stop", "target"):  # steps are placed inside the range
            if k in a and isinstance(a[k], (int, float)):
                lo, hi = min(lo, a[k]), max(hi, a[k])
    pad = (hi - lo) * spec.get("pad", 0.08)
    lo, hi = lo - pad, hi + pad

    x0, x1 = 12, W - AXR - 10
    y0, y1 = TOP + PADT, H - AXB - PADB
    right_room = spec.get("room", 6)  # empty bars on the right, like a live chart
    step = (x1 - x0) / (n + right_room)
    bw = max(1.5, step * 0.64)

    X = lambda i: x0 + step * (i + 0.5)
    Y = lambda p: y0 + (hi - p) / (hi - lo) * (y1 - y0)

    s = []
    s.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    s.append(
        "<style>"
        ".sans{font-family:'Plex Sans',sans-serif}.mono{font-family:'Plex Mono',monospace}"
        "</style>"
    )
    s.append(f'<rect width="{W}" height="{H}" fill="{C["bg"]}"/>')

    # watermark: symbol + brand, the way platforms print the ticker behind price
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s.append(
        f'<text x="{cx}" y="{cy - 6}" text-anchor="middle" class="sans" font-size="92" font-weight="600" fill="{C["ink"]}" fill-opacity="0.045">{esc(spec["symbol"])}, {esc(spec["tf"])}</text>'
        f'<text x="{cx}" y="{cy + 58}" text-anchor="middle" class="mono" font-size="40" font-weight="600" fill="{C["brand"]}" fill-opacity="0.13">The1%</text>'
    )

    # grid + price axis
    span = hi - lo
    raw = span / 8
    mag = 10 ** math.floor(math.log10(raw))
    stepp = min((m * mag for m in (1, 2, 2.5, 5, 10)), key=lambda v: abs(v - raw))
    p = math.ceil(lo / stepp) * stepp
    while p < hi:
        y = Y(p)
        s.append(f'<line x1="0" x2="{W - AXR}" y1="{y:.1f}" y2="{y:.1f}" stroke="{C["grid"]}"/>')
        s.append(f'<text x="{W - AXR + 10}" y="{y + 4:.1f}" class="mono" font-size="12" fill="{C["muted"]}">{fmt_price(p, dec)}</text>')
        p += stepp

    # time axis
    s.append(f'<rect x="0" y="{H - AXB}" width="{W}" height="{AXB}" fill="{C["panel"]}"/>')
    s.append(f'<line x1="0" x2="{W}" y1="{H - AXB}" y2="{H - AXB}" stroke="{C["line"]}"/>')
    s.append(f'<rect x="{W - AXR}" y="{TOP}" width="{AXR}" height="{H - TOP}" fill="{C["panel"]}" fill-opacity="0.55"/>')
    s.append(f'<line x1="{W - AXR}" x2="{W - AXR}" y1="{TOP}" y2="{H}" stroke="{C["line"]}"/>')
    every = max(1, round(n / 9))
    intraday = spec["tf"] != "1D"
    for i in range(0, n, every):
        t = bars[i]["t"]
        d = dt.datetime.fromisoformat(t[:19] if len(t) > 10 else t)
        lab = d.strftime("%d %b %H:%M") if intraday else d.strftime("%d %b '%y")
        x = X(i)
        if x < 44 or x > W - AXR - 44:
            continue
        s.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{TOP}" y2="{H - AXB}" stroke="{C["grid"]}" stroke-opacity="0.6"/>')
        s.append(f'<text x="{x:.1f}" y="{H - 10}" text-anchor="middle" class="mono" font-size="11.5" fill="{C["muted"]}">{lab}</text>')

    if ci < n - 1:
        fx = X(ci) + step / 2
        s.append(f'<rect x="{fx:.1f}" y="{TOP}" width="{W - AXR - fx:.1f}" height="{H - AXB - TOP}" fill="{C["panel"]}" fill-opacity="0.55"/>')
        s.append(f'<line x1="{fx:.1f}" x2="{fx:.1f}" y1="{TOP}" y2="{H - AXB}" stroke="{C["brand"]}" stroke-dasharray="4 5" stroke-opacity="0.7"/>')
        s.append(f'<text x="{fx + 16:.1f}" y="{H - AXB - 18}" class="mono" font-size="12" fill="{C["muted"]}">{esc(spec.get("hidden", "Price after this point is hidden"))}</text>')

    anns = spec.get("ann", [])

    # zones and boxes go under the candles
    under, over = [], []
    for a in anns:
        (under if a.get("t") in ("zone", "box", "fvg", "band", "vband") else over).append(a)

    def label_box(x, y, text, kind, anchor="start", size=13):
        text = str(text)
        w = 7.9 * len(text) * size / 13 + 16
        if anchor == "middle":
            bx = x - w / 2
        elif anchor == "end":
            bx = x - w
        else:
            bx = x
        bx = max(4, min(bx, W - AXR - w - 4))
        return (
            f'<rect x="{bx:.1f}" y="{y - size - 4:.1f}" width="{w:.1f}" height="{size + 11}" rx="5" fill="{C["bg"]}" fill-opacity="0.88" stroke="{col(kind)}" stroke-opacity="0.55"/>'
            f'<text x="{bx + w / 2:.1f}" y="{y + 1:.1f}" text-anchor="middle" class="sans" font-size="{size}" font-weight="600" fill="{col(kind)}">{esc(text)}</text>'
        )

    for a in under:
        k = a.get("kind", "brand")
        if a["t"] in ("zone", "fvg", "band"):
            i0 = bi(a["from"])
            i1 = bi(a["to"]) if a.get("to") is not None else n - 1 + right_room
            xa, xb = X(i0) - step / 2, X(i1) + step / 2
            ya, yb = Y(a["hi"]), Y(a["lo"])
            s.append(f'<rect x="{xa:.1f}" y="{ya:.1f}" width="{xb - xa:.1f}" height="{max(2, yb - ya):.1f}" fill="{col(k)}" fill-opacity="{a.get("op", 0.14)}" stroke="{col(k)}" stroke-opacity="0.55" stroke-width="1"/>')
            if a.get("label"):
                ly = ya - 8 if a.get("lpos") != "below" else yb + 20
                s.append(label_box(xa + 6, ly, a["label"], k, size=12))
        elif a["t"] == "vband":  # session / time window shading
            i0, i1 = bi(a["from"]), bi(a["to"])
            xa, xb = X(i0) - step / 2, X(i1) + step / 2
            s.append(f'<rect x="{xa:.1f}" y="{TOP}" width="{xb - xa:.1f}" height="{H - AXB - TOP}" fill="{col(k)}" fill-opacity="{a.get("op", 0.06)}"/>')
            if a.get("label"):
                s.append(f'<text x="{(xa + xb) / 2:.1f}" y="{TOP + 22}" text-anchor="middle" class="mono" font-size="11" font-weight="600" letter-spacing="1" fill="{col(k)}" fill-opacity="0.9">{esc(a["label"])}</text>')
        elif a["t"] == "box":  # position tool
            i0, i1 = bi(a["from"]), bi(a["to"])
            xa, xb = X(i0) - step / 2, X(i1) + step / 2
            e, st, tg = a["entry"], a["stop"], a["target"]
            s.append(f'<rect x="{xa:.1f}" y="{min(Y(e), Y(tg)):.1f}" width="{xb - xa:.1f}" height="{abs(Y(tg) - Y(e)):.1f}" fill="{C["up"]}" fill-opacity="0.16"/>')
            s.append(f'<rect x="{xa:.1f}" y="{min(Y(e), Y(st)):.1f}" width="{xb - xa:.1f}" height="{abs(Y(st) - Y(e)):.1f}" fill="{C["down"]}" fill-opacity="0.16"/>')
            s.append(f'<line x1="{xa:.1f}" x2="{xb:.1f}" y1="{Y(e):.1f}" y2="{Y(e):.1f}" stroke="{C["ink"]}" stroke-opacity="0.7" stroke-width="1.2"/>')
            rr = abs(tg - e) / abs(e - st)
            s.append(label_box(xb + 6, Y(tg) + 6, a.get("tlabel", f"Target  {rr:.1f}R"), "up", size=12))
            s.append(label_box(xb + 6, Y(e) + 6, a.get("elabel", "Entry"), "ink", size=12))
            s.append(label_box(xb + 6, Y(st) + 6, a.get("slabel", "Stop  -1R"), "down", size=12))

    # candles
    for i, b in enumerate(vis):
        up = b["c"] >= b["o"]
        cl = C["up"] if up else C["down"]
        x = X(i)
        s.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{Y(b["h"]):.1f}" y2="{Y(b["l"]):.1f}" stroke="{cl}" stroke-width="{1.3 if bw > 4 else 1}"/>')
        yt, yb = Y(max(b["o"], b["c"])), Y(min(b["o"], b["c"]))
        s.append(f'<rect x="{x - bw / 2:.1f}" y="{yt:.1f}" width="{bw:.1f}" height="{max(1.2, yb - yt):.1f}" fill="{cl}"/>')

    for a in over:
        k = a.get("kind", "brand")
        dash = ' stroke-dasharray="7 5"' if a.get("dash") else ""
        if a["t"] == "hline":
            i0 = bi(a["from"]) if a.get("from") is not None else 0
            i1 = bi(a["to"]) if a.get("to") is not None else n - 1 + right_room
            y = Y(a["p"])
            s.append(f'<line x1="{X(i0) - step / 2:.1f}" x2="{X(i1) + step / 2:.1f}" y1="{y:.1f}" y2="{y:.1f}" stroke="{col(k)}" stroke-width="1.6"{dash}/>')
            if a.get("label"):
                lx = X(i1) + step / 2 if a.get("lat") != "start" else X(i0)
                anchor = "end" if a.get("lat") != "start" else "start"
                ly = y - 9 if a.get("lpos") != "below" else y + 23
                s.append(label_box(lx, ly, a["label"], k, anchor=anchor, size=12))
            if a.get("tag", True):
                s.append(f'<rect x="{W - AXR + 1}" y="{y - 10:.1f}" width="{AXR - 2}" height="20" fill="{col(k)}"/>')
                s.append(f'<text x="{W - AXR + 10}" y="{y + 4.5:.1f}" class="mono" font-size="12" font-weight="600" fill="{C["bg"]}">{fmt_price(a["p"], dec)}</text>')
        elif a["t"] in ("seg", "arrow"):
            (ta, pa), (tb, pb) = a["a"], a["b"]
            xa, ya, xb, yb = X(bi(ta)), Y(pa), X(bi(tb)), Y(pb)
            s.append(f'<line x1="{xa:.1f}" y1="{ya:.1f}" x2="{xb:.1f}" y2="{yb:.1f}" stroke="{col(k)}" stroke-width="{a.get("w", 1.8)}"{dash}/>')
            if a["t"] == "arrow":
                ang = math.atan2(yb - ya, xb - xa)
                L = 13
                p1 = (xb - L * math.cos(ang - 0.42), yb - L * math.sin(ang - 0.42))
                p2 = (xb - L * math.cos(ang + 0.42), yb - L * math.sin(ang + 0.42))
                s.append(f'<polygon points="{xb:.1f},{yb:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{col(k)}"/>')
            if a.get("label"):
                mx, my = (xa + xb) / 2, (ya + yb) / 2
                s.append(label_box(mx, my - 10 if a.get("lpos") != "below" else my + 24, a["label"], k, anchor="middle", size=12))
        elif a["t"] == "poly":
            pts = " ".join(f"{X(bi(t)):.1f},{Y(p):.1f}" for t, p in a["pts"])
            s.append(f'<polyline points="{pts}" fill="none" stroke="{col(k)}" stroke-width="{a.get("w", 2)}" stroke-linejoin="round"{dash}/>')
            for lt in a.get("labels", []):
                t, p, text, pos = lt
                x, y = X(bi(t)), Y(p)
                s.append(label_box(x, y - 12 if pos == "above" else y + 26, text, k, anchor="middle", size=12))
        elif a["t"] == "ring":
            x, y = X(bi(a["at"])), Y(a["p"])
            r = a.get("r", 16)
            s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="none" stroke="{col(k)}" stroke-width="2.2"/>')
        elif a["t"] == "mark":  # highlight one or more candles with a bracket box
            i0, i1 = bi(a["from"]), bi(a.get("to", a["from"]))
            bs = bars[i0 : i1 + 1]
            ya, yb = Y(max(b["h"] for b in bs)) - 8, Y(min(b["l"] for b in bs)) + 8
            xa, xb = X(i0) - step * 0.55 - 3, X(i1) + step * 0.55 + 3
            s.append(f'<rect x="{xa:.1f}" y="{ya:.1f}" width="{xb - xa:.1f}" height="{yb - ya:.1f}" rx="6" fill="{col(k)}" fill-opacity="0.07" stroke="{col(k)}" stroke-width="1.8" stroke-dasharray="5 4"/>')
            if a.get("label"):
                pos = a.get("lpos", "above")
                s.append(label_box((xa + xb) / 2, ya - 10 if pos == "above" else yb + 24, a["label"], k, anchor="middle", size=12.5))
        elif a["t"] == "step":  # numbered marker, explained in the lesson's step list
            x, y = X(bi(a["at"])), Y(a["p"])
            dx, dy = a.get("dx", 0), a.get("dy", 0)
            if dx or dy:
                s.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x + dx:.1f}" y2="{y + dy:.1f}" stroke="{col(k)}" stroke-width="1.4" stroke-opacity="0.8"/>')
            x, y = x + dx, y + dy
            s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="15" fill="{col(k)}" stroke="{C["bg"]}" stroke-width="3"/>')
            s.append(f'<text x="{x:.1f}" y="{y + 5.5:.1f}" text-anchor="middle" class="sans" font-size="15" font-weight="600" fill="{C["bg"]}">{esc(a["n"])}</text>')
        elif a["t"] == "label":
            x, y = X(bi(a["at"])), Y(a["p"])
            s.append(label_box(x, y, a["text"], k, anchor=a.get("anchor", "middle"), size=a.get("size", 12.5)))

    # toolbar
    last = bars[ci]
    chg = last["c"] - bars[ci - 1]["c"]
    s.append(f'<rect width="{W}" height="{TOP}" fill="{C["panel"]}"/>')
    s.append(f'<line x1="0" x2="{W}" y1="{TOP}" y2="{TOP}" stroke="{C["line"]}"/>')
    s.append(f'<rect x="14" y="10" width="26" height="26" rx="7" fill="#3654ff"/>')
    s.append(f'<text x="27" y="27.5" text-anchor="middle" class="mono" font-size="11" font-weight="600" fill="#fff">1%</text>')
    s.append(f'<text x="50" y="29" class="sans" font-size="15" font-weight="600" fill="{C["ink"]}">The1%</text>')
    s.append(f'<line x1="112" x2="112" y1="12" y2="34" stroke="{C["line"]}"/>')
    s.append(f'<text x="126" y="29" class="sans" font-size="15" font-weight="600" fill="{C["ink"]}">{esc(spec.get("name", spec["symbol"]))}</text>')
    nx = 126 + 9.2 * len(spec.get("name", spec["symbol"])) + 14
    s.append(f'<rect x="{nx}" y="12" width="{12 + 8 * len(spec["tf"])}" height="22" rx="5" fill="{C["brand"]}" fill-opacity="0.16"/>')
    s.append(f'<text x="{nx + 6 + 4 * len(spec["tf"])}" y="27.5" text-anchor="middle" class="mono" font-size="12" font-weight="600" fill="{C["brand"]}">{esc(spec["tf"])}</text>')
    ox = nx + 12 + 8 * len(spec["tf"]) + 16
    cl = C["up"] if chg >= 0 else C["down"]
    parts = [("O", last["o"]), ("H", last["h"]), ("L", last["l"]), ("C", last["c"])]
    for lab, v in parts:
        s.append(f'<text x="{ox}" y="28" class="mono" font-size="12" fill="{C["muted"]}">{lab}<tspan fill="{cl}"> {fmt_price(v, dec)}</tspan></text>')
        ox += 20 + 7.3 * len(fmt_price(v, dec)) + 12
    if spec.get("phase"):
        pk = C["warn"] if spec["phase"] == "BEFORE" else C["up"]
        pw = 16 + 8.2 * len(spec["phase"])
        s.append(f'<rect x="{W - AXR - pw - 14:.1f}" y="{TOP + 12}" width="{pw:.1f}" height="24" rx="6" fill="{pk}" fill-opacity="0.16" stroke="{pk}" stroke-opacity="0.6"/>')
        s.append(f'<text x="{W - AXR - pw / 2 - 14:.1f}" y="{TOP + 28.5}" text-anchor="middle" class="mono" font-size="12" font-weight="600" fill="{pk}">{spec["phase"]}</text>')
    s.append(f'<text x="{W - 16}" y="28" text-anchor="end" class="mono" font-size="11.5" fill="{C["muted"]}">THE1% CHARTS  ·  {esc(spec.get("stamp", "Real market data"))}</text>')

    # corner badge, where platforms put their logo
    by = H - AXB - 40
    s.append(f'<rect x="14" y="{by}" width="92" height="28" rx="8" fill="{C["panel"]}" fill-opacity="0.92" stroke="{C["line"]}"/>')
    s.append(f'<rect x="19" y="{by + 5}" width="18" height="18" rx="5" fill="#3654ff"/>')
    s.append(f'<text x="28" y="{by + 17.5}" text-anchor="middle" class="mono" font-size="8" font-weight="600" fill="#fff">1%</text>')
    s.append(f'<text x="44" y="{by + 19}" class="sans" font-size="13" font-weight="600" fill="{C["ink"]}">The1%</text>')
    s.append("</svg>")
    return "".join(s)


def page(svg):
    fonts = "".join(
        f"@font-face{{font-family:'{fam}';src:url('file://{FONTS}/{f}.ttf');font-weight:{w}}}"
        for fam, f, w in [
            ("Plex Sans", "IBMPlexSans-Regular", 400),
            ("Plex Sans", "IBMPlexSans-SemiBold", 600),
            ("Plex Mono", "IBMPlexMono-Regular", 400),
            ("Plex Mono", "IBMPlexMono-SemiBold", 600),
        ]
    )
    return f"<html><head><style>{fonts}html,body{{margin:0;background:#0d111a}}</style></head><body>{svg}</body></html>"


def main(ids):
    sys.path.insert(0, str(HERE))
    from specs import SPECS
    from playwright.sync_api import sync_playwright
    from PIL import Image

    OUT.mkdir(parents=True, exist_ok=True)
    todo = []
    for sp in SPECS:  # a spec with "before" renders two images: <id>-before and <id>
        if ids and sp["id"] not in ids:
            continue
        if sp.get("before"):
            bf = sp["before"]
            todo.append({**sp, "id": sp["id"] + "-before", "cut": bf["cut"], "ann": bf["ann"], "phase": "BEFORE", "hidden": bf.get("hidden", "Price after this point is hidden")})
            todo.append({**sp, "phase": "AFTER"})
        else:
            todo.append(sp)
    exe = (glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell")) or [None])[0]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for spec in todo:
            tmp = HERE / ".tmp.html"
            tmp.write_text(page(render(spec)))
            pg.goto(f"file://{tmp}")
            pg.wait_for_timeout(150)
            png = HERE / ".tmp.png"
            pg.screenshot(path=str(png), clip={"x": 0, "y": 0, "width": W, "height": H})
            Image.open(png).save(OUT / f"{spec['id']}.webp", "WEBP", quality=86, method=6)
            print("rendered", spec["id"])
        b.close()
    for f in (HERE / ".tmp.html", HERE / ".tmp.png"):
        f.unlink(missing_ok=True)


if __name__ == "__main__":
    main(sys.argv[1:])

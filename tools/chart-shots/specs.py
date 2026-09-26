"""Chart screenshot specs. Times are bar timestamps (prefix match); prices are real."""

SPECS = [
    {
        "id": "cs-hammer-audusd",
        "symbol": "AUDUSD", "tf": "1D", "start": "2024-06-20", "end": "2024-08-30",
        "stamp": "Aug 2024",
        "ann": [
            {"t": "mark", "from": "2024-08-05", "kind": "up", "label": "Hammer: long lower wick, small body", "lpos": "below"},
            {"t": "hline", "p": 0.63566, "from": "2024-08-05", "to": "2024-08-30", "kind": "down", "dash": True, "label": "Stop goes below the wick", "lpos": "below"},
            {"t": "arrow", "a": ["2024-08-07", 0.6545], "b": ["2024-08-19", 0.6705], "kind": "up"},
        ],
    },
]

SPECS += [
    # ---------------------------------------------------------------- candlesticks
    {
        "id": "cs-engulf-eurusd",
        "symbol": "EURUSD", "tf": "1D", "start": "2024-06-24", "end": "2024-08-26", "stamp": "Aug 2024",
        "ann": [
            {"t": "hline", "p": 1.0778, "from": "2024-06-24", "to": "2024-08-26", "kind": "muted", "dash": True, "label": "Support from late June", "lpos": "below", "lat": "start", "tag": False},
            {"t": "mark", "from": "2024-08-01", "to": "2024-08-02", "kind": "up", "label": "Bullish engulfing at support", "lpos": "below"},
            {"t": "arrow", "a": ["2024-08-05", 1.1030], "b": ["2024-08-21", 1.1185], "kind": "up"},
        ],
    },
    {
        "id": "cs-doji-eurusd",
        "symbol": "EURUSD", "tf": "1D", "start": "2024-11-20", "end": "2025-02-05", "stamp": "Jan 2025",
        "ann": [
            {"t": "arrow", "a": ["2024-12-31", 1.0470], "b": ["2025-01-10", 1.0290], "kind": "down", "dash": True},
            {"t": "mark", "from": "2025-01-13", "kind": "warn", "label": "Doji: sellers stall after a fall", "lpos": "below"},
            {"t": "mark", "from": "2025-01-14", "kind": "up", "label": "Confirmation candle", "lpos": "above"},
        ],
    },
    # ---------------------------------------------------------------- market structure
    {
        "id": "ms-uptrend-gold",
        "symbol": "XAUUSD", "name": "XAUUSD", "tf": "1D", "start": "2025-07-15", "end": "2025-10-20", "stamp": "Jul - Oct 2025", "dec": 1,
        "ann": [
            {"t": "poly", "kind": "brand", "pts": [["2025-07-30", 3263.9], ["2025-08-08", 3534.1], ["2025-08-20", 3353.4], ["2025-09-17", 3744.0], ["2025-09-19", 3664.4], ["2025-10-20", 4398.0]],
             "labels": [["2025-07-30", 3263.9, "Low", "below"], ["2025-08-08", 3534.1, "HH", "above"], ["2025-08-20", 3353.4, "HL", "below"], ["2025-09-17", 3744.0, "HH", "above"], ["2025-09-19", 3664.4, "HL", "below"]]},
            {"t": "hline", "p": 3534.1, "from": "2025-08-08", "to": "2025-09-02", "kind": "up", "label": "BOS", "tag": False},
        ],
    },
    {
        "id": "ms-choch-btc",
        "symbol": "BTCUSD", "tf": "1D", "start": "2025-08-10", "end": "2025-12-05", "stamp": "Aug - Dec 2025",
        "ann": [
            {"t": "poly", "kind": "brand", "pts": [["2025-09-01", 107271], ["2025-10-06", 126198], ["2025-10-17", 103598], ["2025-10-27", 116273], ["2025-11-04", 98962], ["2025-11-11", 107428], ["2025-11-21", 80660]],
             "labels": [["2025-09-01", 107271, "HL", "below"], ["2025-10-06", 126198, "Last HH", "above"], ["2025-10-27", 116273, "LH", "above"], ["2025-11-11", 107428, "LH", "above"]]},
            {"t": "hline", "p": 107271, "from": "2025-09-01", "to": "2025-10-17", "kind": "down", "label": "CHoCH: the HL breaks", "lpos": "below", "tag": False},
            {"t": "hline", "p": 103598, "from": "2025-10-17", "to": "2025-11-04", "kind": "down", "label": "BOS", "lpos": "below", "tag": False},
        ],
    },
    # ---------------------------------------------------------------- supply & demand
    {
        "id": "sd-demand-eurusd",
        "symbol": "EURUSD", "tf": "4H", "start": "2025-03-31 12", "end": "2025-04-15 20", "stamp": "Apr 2025",
        "ann": [
            {"t": "zone", "from": "2025-04-03 00", "to": "2025-04-09 00", "lo": 1.08838, "hi": 1.09266, "kind": "up", "label": "Demand: the pause before the second leg up", "lpos": "below"},
            {"t": "ring", "at": "2025-04-08 12", "p": 1.08956, "kind": "warn", "r": 18},
            {"t": "label", "at": "2025-04-08 12", "p": 1.0835, "text": "Retest holds", "kind": "warn"},
            {"t": "arrow", "a": ["2025-04-09 00", 1.0990], "b": ["2025-04-11 04", 1.1390], "kind": "up"},
        ],
    },
    {
        "id": "sd-supply-btc",
        "symbol": "BTCUSD", "tf": "1D", "start": "2024-07-10", "end": "2024-09-12", "stamp": "Aug 2024",
        "ann": [
            {"t": "zone", "from": "2024-07-31", "to": "2024-08-28", "lo": 64620, "hi": 66810, "kind": "down", "label": "Supply: the base before the drop"},
            {"t": "arrow", "a": ["2024-08-02", 61000], "b": ["2024-08-05", 50500], "kind": "down", "dash": True},
            {"t": "ring", "at": "2024-08-25", "p": 64996, "kind": "warn", "r": 18},
            {"t": "arrow", "a": ["2024-08-27", 62500], "b": ["2024-09-06", 53500], "kind": "down"},
        ],
    },
    # ---------------------------------------------------------------- liquidity
    {
        "id": "liq-eqh-gold",
        "symbol": "XAUUSD", "tf": "1D", "start": "2021-06-24", "end": "2021-08-20", "stamp": "Jul - Aug 2021", "dec": 1,
        "ann": [
            {"t": "hline", "p": 1835.0, "from": "2021-07-15", "to": "2021-08-06", "kind": "warn", "dash": True, "label": "Equal highs = buy stops resting above", "lat": "start", "tag": False},
            {"t": "mark", "from": "2021-08-04", "kind": "down", "label": "Sweep", "lpos": "above"},
            {"t": "arrow", "a": ["2021-08-05", 1805], "b": ["2021-08-09", 1690], "kind": "down"},
        ],
    },
    {
        "id": "liq-eql-btc",
        "symbol": "BTCUSD", "tf": "1D", "start": "2024-12-10", "end": "2025-01-24", "stamp": "Jan 2025",
        "ann": [
            {"t": "hline", "p": 91220, "from": "2024-12-30", "to": "2025-01-15", "kind": "warn", "dash": True, "label": "Equal lows = sell stops", "lpos": "below", "lat": "start", "tag": False},
            {"t": "mark", "from": "2025-01-13", "kind": "up", "label": "Sweep and reclaim", "lpos": "below"},
            {"t": "arrow", "a": ["2025-01-14", 95500], "b": ["2025-01-20", 107500], "kind": "up"},
        ],
    },
    # ---------------------------------------------------------------- order blocks
    {
        "id": "ob-bull-gold",
        "symbol": "XAUUSD", "tf": "4H", "start": "2025-11-03 08", "end": "2025-11-19 16", "stamp": "Nov 2025", "dec": 1,
        "ann": [
            {"t": "hline", "p": 4059.9, "from": "2025-11-03 08", "to": "2025-11-10 08", "kind": "up", "label": "BOS", "tag": False},
            {"t": "zone", "from": "2025-11-07 12", "to": "2025-11-18 16", "lo": 3991.0, "hi": 4016.9, "kind": "brand", "label": "Bullish order block", "lpos": "below"},
            {"t": "ring", "at": "2025-11-18 04", "p": 3997.4, "kind": "warn", "r": 18},
        ],
    },
    # ---------------------------------------------------------------- fvg
    {
        "id": "fvg-bull-eurusd",
        "symbol": "EURUSD", "tf": "1D", "start": "2025-02-10", "end": "2025-04-08", "stamp": "Mar 2025",
        "ann": [
            {"t": "fvg", "from": "2025-03-04", "to": "2025-03-31", "lo": 1.06304, "hi": 1.07712, "kind": "brand", "label": "Bullish FVG: candle 1 high to candle 3 low", "lpos": "below"},
            {"t": "mark", "from": "2025-03-04", "to": "2025-03-06", "kind": "muted"},
            {"t": "ring", "at": "2025-03-26", "p": 1.07411, "kind": "warn", "r": 18},
            {"t": "label", "at": "2025-03-26", "p": 1.0915, "text": "Price returns to the gap", "kind": "warn"},
        ],
    },
    {
        "id": "fvg-bear-btc",
        "symbol": "BTCUSD", "tf": "1D", "start": "2025-12-28", "end": "2026-02-10", "stamp": "Jan - Feb 2026",
        "ann": [
            {"t": "fvg", "from": "2026-01-19", "to": "2026-01-30", "lo": 90430, "hi": 92089, "kind": "down"},
            {"t": "label", "at": "2026-01-26", "p": 93600, "text": "Bearish FVG", "kind": "down"},
            {"t": "ring", "at": "2026-01-23", "p": 91100, "kind": "warn", "r": 18},
            {"t": "arrow", "a": ["2026-01-28", 88000], "b": ["2026-02-05", 64000], "kind": "down"},
        ],
    },
    # ---------------------------------------------------------------- support & resistance
    {
        "id": "sr-flip-gold",
        "symbol": "XAUUSD", "tf": "1D", "start": "2025-01-27", "end": "2025-04-22", "stamp": "Feb - Apr 2025", "dec": 1,
        "ann": [
            {"t": "band", "from": "2025-02-11", "to": "2025-04-14", "lo": 2955, "hi": 2974, "kind": "warn"},
            {"t": "label", "at": "2025-02-20", "p": 3010, "text": "Resistance", "kind": "down"},
            {"t": "mark", "from": "2025-03-13", "kind": "up", "label": "Break", "lpos": "above"},
            {"t": "ring", "at": "2025-04-07", "p": 2970.4, "kind": "warn", "r": 18},
            {"t": "label", "at": "2025-04-07", "p": 2905, "text": "Old resistance becomes support", "kind": "up"},
        ],
    },
    # ---------------------------------------------------------------- risk
    {
        "id": "rm-position-gold",
        "symbol": "XAUUSD", "tf": "1D", "start": "2025-08-01", "end": "2025-10-15", "stamp": "Sep 2025", "dec": 1, "room": 3,
        "ann": [
            {"t": "box", "from": "2025-08-25", "to": "2025-09-12", "entry": 3372, "stop": 3310, "target": 3558, "elabel": "Entry 3,372", "slabel": "Stop 3,310  -1R", "tlabel": "Target 3,558  +3R"},
            {"t": "label", "at": "2025-09-18", "p": 3470, "text": "Risk $62/oz to make $186/oz", "kind": "ink", "anchor": "start"},
        ],
    },
    # ---------------------------------------------------------------- day trading
    {
        "id": "dt-sessions-eurusd",
        "symbol": "EURUSD", "tf": "1H", "start": "2026-08-18 12", "end": "2026-08-19 21", "stamp": "19 Aug 2026 · times UTC", "room": 3,
        "ann": [
            {"t": "vband", "from": "2026-08-19 00", "to": "2026-08-19 05", "kind": "muted", "label": "ASIA", "op": 0.07},
            {"t": "vband", "from": "2026-08-19 07", "to": "2026-08-19 11", "kind": "brand", "label": "LONDON", "op": 0.07},
            {"t": "vband", "from": "2026-08-19 12", "to": "2026-08-19 20", "kind": "up", "label": "NEW YORK", "op": 0.06},
            {"t": "zone", "from": "2026-08-19 00", "to": "2026-08-19 05", "lo": 1.15741, "hi": 1.15929, "kind": "warn", "label": "Asian range", "lpos": "below"},
            {"t": "hline", "p": 1.15808, "from": "2026-08-18 21", "kind": "ink", "dash": True, "label": "P", "lat": "start"},
            {"t": "hline", "p": 1.15902, "from": "2026-08-18 21", "kind": "up", "dash": True, "label": "R1", "lat": "start"},
            {"t": "hline", "p": 1.16009, "from": "2026-08-18 21", "kind": "up", "dash": True, "label": "R2", "lat": "start"},
            {"t": "hline", "p": 1.157, "from": "2026-08-18 21", "kind": "down", "dash": True, "label": "S1", "lat": "start", "lpos": "below"},
        ],
    },
]

SPECS += [
    {
        "id": "cs-star-gbpusd",
        "symbol": "GBPUSD", "tf": "1D", "start": "2025-08-18", "end": "2025-10-10", "stamp": "Sep 2025",
        "ann": [
            {"t": "mark", "from": "2025-09-17", "kind": "down", "label": "Shooting star at the high", "lpos": "above"},
            {"t": "hline", "p": 1.36201, "from": "2025-09-17", "to": "2025-09-26", "kind": "muted", "dash": True, "label": "Trigger: close below the star low", "lpos": "below", "lat": "start", "tag": False},
            {"t": "arrow", "a": ["2025-09-18", 1.3620], "b": ["2025-09-25", 1.3380], "kind": "down"},
        ],
    },
    {
        "id": "psy-fomo-btc",
        "symbol": "BTCUSD", "tf": "1D", "start": "2025-09-10", "end": "2025-10-24", "stamp": "Oct 2025",
        "ann": [
            {"t": "mark", "from": "2025-09-30", "to": "2025-10-06", "kind": "warn", "label": "Six green days. This is where FOMO buys", "lpos": "above"},
            {"t": "hline", "p": 126198, "from": "2025-10-06", "to": "2025-10-24", "kind": "down", "dash": True, "label": "All-time high", "tag": False},
            {"t": "mark", "from": "2025-10-10", "kind": "down", "label": "-17% in four days", "lpos": "below"},
        ],
    },
    {
        "id": "rm-stops-eurusd",
        "symbol": "EURUSD", "tf": "4H", "start": "2025-04-02 12", "end": "2025-04-11 04", "stamp": "Apr 2025", "room": 4,
        "ann": [
            {"t": "zone", "from": "2025-04-03 00", "to": "2025-04-09 00", "lo": 1.08838, "hi": 1.09266, "kind": "up", "op": 0.1},
            {"t": "hline", "p": 1.0905, "from": "2025-04-07 12", "kind": "down", "dash": True, "label": "Tight stop: taken by the wick", "lpos": "below"},
            {"t": "hline", "p": 1.0870, "from": "2025-04-07 12", "kind": "up", "dash": True, "label": "Structure stop: below the zone, survives", "lpos": "below"},
            {"t": "ring", "at": "2025-04-08 12", "p": 1.08956, "kind": "warn", "r": 18},
        ],
    },
    {
        "id": "sr-range-eurusd",
        "symbol": "EURUSD", "tf": "1D", "start": "2025-07-01", "end": "2025-12-01", "stamp": "Jul - Nov 2025",
        "ann": [
            {"t": "band", "from": "2025-07-20", "to": "2025-12-01", "lo": 1.1730, "hi": 1.1792, "kind": "down", "op": 0.12},
            {"t": "band", "from": "2025-07-30", "to": "2025-12-01", "lo": 1.1396, "hi": 1.1500, "kind": "up", "op": 0.12},
            {"t": "label", "at": "2025-11-03", "p": 1.1880, "text": "Range high: sellers defend", "kind": "down"},
            {"t": "label", "at": "2025-09-01", "p": 1.1355, "text": "Range low: buyers defend", "kind": "up"},
            {"t": "mark", "from": "2025-09-17", "kind": "warn", "label": "Fake breakout", "lpos": "above"},
            {"t": "hline", "p": 1.1594, "from": "2025-07-01", "kind": "muted", "dash": True, "label": "Middle: no edge", "lat": "start", "tag": False},
        ],
    },
    {
        "id": "tf-pips-eurusd",
        "symbol": "EURUSD", "tf": "1H", "start": "2026-08-19 03", "end": "2026-08-19 20", "stamp": "19 Aug 2026 · times UTC", "room": 5,
        "ann": [
            {"t": "hline", "p": 1.16063, "from": "2026-08-19 11", "kind": "muted", "dash": True, "label": "1.16063", "lat": "start", "lpos": "below", "tag": False},
            {"t": "hline", "p": 1.16809, "from": "2026-08-19 14", "kind": "muted", "dash": True, "tag": False},
            {"t": "arrow", "a": ["2026-08-19 20", 1.16063], "b": ["2026-08-19 20", 1.16809], "kind": "up", "w": 2.2},
            {"t": "label", "at": "2026-08-19 16", "p": 1.1638, "text": "+74.6 pips = +$746 on 1 standard lot", "kind": "up"},
        ],
    },
]

# ------------------------------------------------------------------ worked examples
# Step-by-step charts: numbered markers ("step") are explained, in order, by the
# lesson's step list underneath the image. More pairs: JPY crosses, CAD, GBP.
SPECS += [
    {
        "id": "we-fvg-eurjpy",
        "symbol": "EURJPY", "tf": "1D", "start": "2024-06-24", "end": "2024-08-16", "stamp": "Jul - Aug 2024", "room": 3,
        "ann": [
            {"t": "fvg", "from": "2024-07-16", "to": "2024-07-26", "lo": 171.572, "hi": 172.269, "kind": "down", "op": 0.22},
            {"t": "label", "at": "2024-07-01", "p": 171.0, "text": "Bearish FVG 171.572 - 172.269", "kind": "down"},
            {"t": "box", "from": "2024-07-22", "to": "2024-07-25", "entry": 171.60, "stop": 172.40, "target": 168.40, "tlabel": "Target 168.40  4R"},
            {"t": "step", "n": 1, "at": "2024-07-11", "p": 175.424, "kind": "brand", "dx": 30, "dy": -18},
            {"t": "step", "n": 2, "at": "2024-07-17", "p": 169.98, "kind": "brand", "dx": 0, "dy": 34},
            {"t": "step", "n": 3, "at": "2024-07-22", "p": 171.657, "kind": "warn", "dx": -34, "dy": -40},
            {"t": "step", "n": 4, "at": "2024-07-24", "p": 166.135, "kind": "up", "dx": 0, "dy": 30},
            {"t": "step", "n": 5, "at": "2024-08-05", "p": 154.393, "kind": "brand", "dx": 32, "dy": 0},
        ],
    },
    {
        "id": "we-fvg-eurgbp",
        "symbol": "EURGBP", "tf": "1D", "start": "2025-02-20", "end": "2025-04-11", "stamp": "Mar - Apr 2025", "room": 3,
        "ann": [
            {"t": "fvg", "from": "2025-03-04", "to": "2025-04-03", "lo": 0.83122, "hi": 0.83595, "kind": "up", "op": 0.18, "label": "Bullish FVG 0.83122 - 0.83595", "lpos": "below"},
            {"t": "hline", "p": 0.83122, "from": "2025-03-04", "to": "2025-04-11", "kind": "down", "dash": True, "label": "Closes below here = gap failed", "lpos": "below", "tag": False},
            {"t": "step", "n": 1, "at": "2025-03-05", "p": 0.83804, "kind": "brand", "dx": -30, "dy": -26},
            {"t": "step", "n": 2, "at": "2025-03-20", "p": 0.83504, "kind": "warn", "dx": 0, "dy": 58},
            {"t": "step", "n": 3, "at": "2025-03-28", "p": 0.8315, "kind": "warn", "dx": 0, "dy": 34},
            {"t": "step", "n": 4, "at": "2025-04-03", "p": 0.84482, "kind": "up", "dx": -30, "dy": -18},
            {"t": "step", "n": 5, "at": "2025-04-11", "p": 0.87382, "kind": "brand", "dx": -34, "dy": 0},
        ],
    },
    {
        "id": "we-flip-eurjpy",
        "symbol": "EURJPY", "tf": "1D", "start": "2025-09-08", "end": "2025-11-21", "stamp": "Sep - Nov 2025", "room": 3,
        "ann": [
            {"t": "zone", "from": "2025-09-18", "to": "2025-11-21", "lo": 174.81, "hi": 175.052, "kind": "brand", "op": 0.2},
            {"t": "label", "at": "2025-11-04", "p": 174.2, "text": "Old resistance 175.05 = new support", "kind": "brand"},
            {"t": "step", "n": 1, "at": "2025-09-26", "p": 175.052, "kind": "down", "dx": 0, "dy": -32},
            {"t": "step", "n": 2, "at": "2025-10-02", "p": 172.259, "kind": "brand", "dx": 0, "dy": 32},
            {"t": "step", "n": 3, "at": "2025-10-06", "p": 176.252, "kind": "up", "dx": -26, "dy": -26},
            {"t": "step", "n": 4, "at": "2025-10-17", "p": 174.81, "kind": "warn", "dx": 0, "dy": 58},
            {"t": "step", "n": 5, "at": "2025-11-20", "p": 182.006, "kind": "up", "dx": -34, "dy": 0},
        ],
    },
    {
        "id": "we-flip-usdcad",
        "symbol": "USDCAD", "tf": "1D", "start": "2025-11-03", "end": "2025-12-31", "stamp": "Nov - Dec 2025", "room": 3,
        "ann": [
            {"t": "zone", "from": "2025-11-10", "to": "2025-12-31", "lo": 1.3967, "hi": 1.3981, "kind": "down", "op": 0.22},
            {"t": "label", "at": "2025-12-16", "p": 1.4005, "text": "Old support 1.3967 - 1.3981 = new resistance", "kind": "down"},
            {"t": "step", "n": 1, "at": "2025-11-18", "p": 1.3967, "kind": "brand", "dx": 0, "dy": 34},
            {"t": "step", "n": 2, "at": "2025-12-03", "p": 1.3934, "kind": "down", "dx": 0, "dy": 34},
            {"t": "step", "n": 3, "at": "2025-12-04", "p": 1.39773, "kind": "warn", "dx": 0, "dy": -60},
            {"t": "step", "n": 4, "at": "2025-12-05", "p": 1.3811, "kind": "down", "dx": 30, "dy": 16},
            {"t": "step", "n": 5, "at": "2025-12-26", "p": 1.3638, "kind": "brand", "dx": 0, "dy": 32},
        ],
    },
    {
        "id": "we-choch-usdjpy",
        "symbol": "USDJPY", "tf": "1D", "start": "2026-06-15", "end": "2026-09-25", "stamp": "Jun - Sep 2026", "room": 3,
        "ann": [
            {"t": "hline", "p": 161.276, "from": "2026-07-10", "to": "2026-08-05", "kind": "warn", "dash": True, "label": "Last higher low 161.276", "tag": False},
            {"t": "zone", "from": "2026-08-10", "to": "2026-09-25", "lo": 159.5, "hi": 160.4, "kind": "down", "op": 0.16},
            {"t": "label", "at": "2026-08-24", "p": 161.2, "text": "Old June support caps every rally", "kind": "down"},
            {"t": "step", "n": 1, "at": "2026-07-23", "p": 163.988, "kind": "up", "dx": 0, "dy": -32},
            {"t": "step", "n": 2, "at": "2026-07-30", "p": 157.923, "kind": "down", "dx": 30, "dy": 16},
            {"t": "step", "n": 3, "at": "2026-08-03", "p": 155.215, "kind": "brand", "dx": 0, "dy": 32},
            {"t": "step", "n": 4, "at": "2026-09-02", "p": 160.394, "kind": "down", "dx": 0, "dy": -32},
            {"t": "step", "n": 5, "at": "2026-09-08", "p": 152.881, "kind": "brand", "dx": 0, "dy": 32},
            {"t": "step", "n": 6, "at": "2026-09-24", "p": 159.036, "kind": "warn", "dx": -30, "dy": -26},
        ],
    },
    {
        "id": "we-hammer-gbpjpy",
        "symbol": "GBPJPY", "tf": "1D", "start": "2024-08-19", "end": "2024-09-26", "stamp": "Sep 2024", "room": 3,
        "ann": [
            {"t": "hline", "p": 183.71, "from": "2024-09-11", "to": "2024-09-26", "kind": "up", "dash": True, "label": "Hammer low 183.71", "lpos": "below", "tag": False},
            {"t": "box", "from": "2024-09-17", "to": "2024-09-26", "entry": 186.97, "stop": 183.60, "target": 193.47, "tlabel": "Target 193.47  1.9R"},
            {"t": "step", "n": 1, "at": "2024-09-02", "p": 193.476, "kind": "down", "dx": 0, "dy": -32},
            {"t": "step", "n": 2, "at": "2024-09-11", "p": 183.71, "kind": "warn", "dx": -30, "dy": 22},
            {"t": "step", "n": 3, "at": "2024-09-16", "p": 183.755, "kind": "brand", "dx": 0, "dy": 34},
            {"t": "step", "n": 4, "at": "2024-09-17", "p": 187.455, "kind": "up", "dx": -26, "dy": -30},
            {"t": "step", "n": 5, "at": "2024-09-26", "p": 194.586, "kind": "up", "dx": -34, "dy": -10},
        ],
    },
    {
        "id": "we-sweep-usdcad",
        "symbol": "USDCAD", "tf": "1D", "start": "2024-05-27", "end": "2024-08-06", "stamp": "Jun - Aug 2024", "room": 3,
        "ann": [
            {"t": "hline", "p": 1.3598, "from": "2024-06-03", "to": "2024-07-18", "kind": "warn", "dash": True, "label": "Equal lows 1.3598: stops sit below", "lpos": "below", "tag": False},
            {"t": "box", "from": "2024-07-15", "to": "2024-08-01", "entry": 1.3677, "stop": 1.3575, "target": 1.3881, "tlabel": "Target 1.3881  2R"},
            {"t": "step", "n": 1, "at": "2024-06-03", "p": 1.3598, "kind": "brand", "dx": -8, "dy": 40},
            {"t": "step", "n": 2, "at": "2024-07-05", "p": 1.3598, "kind": "brand", "dx": -6, "dy": 40},
            {"t": "step", "n": 3, "at": "2024-07-11", "p": 1.3584, "kind": "warn", "dx": 10, "dy": 40},
            {"t": "step", "n": 4, "at": "2024-07-15", "p": 1.36889, "kind": "up", "dx": -24, "dy": -36},
            {"t": "step", "n": 5, "at": "2024-08-05", "p": 1.39465, "kind": "brand", "dx": -32, "dy": 0},
        ],
    },
    {
        "id": "we-risk-audjpy",
        "symbol": "AUDJPY", "tf": "1D", "start": "2024-06-24", "end": "2024-08-16", "stamp": "Jul - Aug 2024", "room": 3,
        "ann": [
            {"t": "arrow", "a": ["2024-07-11", 109.9], "b": ["2024-08-05", 90.6], "kind": "down", "dash": True, "label": "-1,925 pips, -17.6%"},
            {"t": "step", "n": 1, "at": "2024-07-11", "p": 109.371, "kind": "brand", "dx": -30, "dy": -14},
            {"t": "step", "n": 2, "at": "2024-07-12", "p": 106.714, "kind": "warn", "dx": 10, "dy": 36},
            {"t": "step", "n": 3, "at": "2024-07-29", "p": 101.232, "kind": "down", "dx": 0, "dy": -34},
            {"t": "step", "n": 4, "at": "2024-08-05", "p": 90.124, "kind": "down", "dx": 30, "dy": 0},
        ],
    },
    {
        "id": "we-london-gbpjpy",
        "symbol": "GBPJPY", "tf": "1H", "start": "2026-09-06 21", "end": "2026-09-07 20", "stamp": "7 Sep 2026 · times UTC", "room": 3,
        "ann": [
            {"t": "vband", "from": "2026-09-07 00", "to": "2026-09-07 05", "kind": "muted", "label": "ASIA", "op": 0.07},
            {"t": "vband", "from": "2026-09-07 07", "to": "2026-09-07 11", "kind": "brand", "label": "LONDON", "op": 0.07},
            {"t": "zone", "from": "2026-09-07 00", "to": "2026-09-07 05", "lo": 210.591, "hi": 211.199, "kind": "warn", "label": "Asian range 61 pips"},
            {"t": "box", "from": "2026-09-07 07", "to": "2026-09-07 11", "entry": 210.49, "stop": 210.90, "target": 209.67, "tlabel": "Target 209.67  2R"},
            {"t": "step", "n": 1, "at": "2026-09-07 04", "p": 211.199, "kind": "warn", "dx": 30, "dy": -24},
            {"t": "step", "n": 2, "at": "2026-09-07 06", "p": 210.356, "kind": "warn", "dx": -10, "dy": 34},
            {"t": "step", "n": 3, "at": "2026-09-07 07", "p": 210.853, "kind": "down", "dx": 0, "dy": -60},
            {"t": "step", "n": 4, "at": "2026-09-07 08", "p": 208.637, "kind": "up", "dx": 0, "dy": 32},
            {"t": "step", "n": 5, "at": "2026-09-07 14", "p": 209.32, "kind": "brand", "dx": 0, "dy": -32},
        ],
    },
    {
        "id": "we-pips-eurjpy",
        "symbol": "EURJPY", "tf": "1H", "start": "2026-07-01 18", "end": "2026-07-02 16", "stamp": "2 Jul 2026 · times UTC", "room": 3,
        "ann": [
            {"t": "hline", "p": 184.824, "from": "2026-07-02 05", "to": "2026-07-02 11", "kind": "ink", "dash": True, "label": "Open 184.824", "tag": True},
            {"t": "hline", "p": 183.731, "from": "2026-07-02 05", "to": "2026-07-02 11", "kind": "down", "dash": True, "label": "Low 183.731", "lpos": "below", "tag": True},
            {"t": "arrow", "a": ["2026-07-02 05", 184.80], "b": ["2026-07-02 05", 183.76], "kind": "down", "label": "109.3 pips = about $673 per lot"},
            {"t": "step", "n": 1, "at": "2026-07-02 02", "p": 185.085, "kind": "muted", "dx": 0, "dy": -32},
            {"t": "step", "n": 2, "at": "2026-07-02 06", "p": 183.731, "kind": "down", "dx": -30, "dy": 16},
            {"t": "step", "n": 3, "at": "2026-07-02 12", "p": 184.421, "kind": "brand", "dx": 0, "dy": -32},
        ],
    },
]

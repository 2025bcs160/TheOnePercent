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
        "symbol": "EURUSD", "tf": "4H", "start": "2025-03-31 13", "end": "2025-04-15 21", "stamp": "Apr 2025",
        "ann": [
            {"t": "zone", "from": "2025-04-03 01", "to": "2025-04-09 01", "lo": 1.08838, "hi": 1.09266, "kind": "up", "label": "Demand: the pause before the second leg up", "lpos": "below"},
            {"t": "ring", "at": "2025-04-08 13", "p": 1.08956, "kind": "warn", "r": 18},
            {"t": "label", "at": "2025-04-08 13", "p": 1.0835, "text": "Retest holds", "kind": "warn"},
            {"t": "arrow", "a": ["2025-04-09 01", 1.0990], "b": ["2025-04-11 05", 1.1390], "kind": "up"},
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
        "symbol": "XAUUSD", "tf": "4H", "start": "2025-11-03 03", "end": "2025-11-19 11", "stamp": "Nov 2025", "dec": 1,
        "ann": [
            {"t": "hline", "p": 4059.9, "from": "2025-11-03 03", "to": "2025-11-10 03", "kind": "up", "label": "BOS", "tag": False},
            {"t": "zone", "from": "2025-11-07 07", "to": "2025-11-18 11", "lo": 3991.0, "hi": 4016.9, "kind": "brand", "label": "Bullish order block", "lpos": "below"},
            {"t": "ring", "at": "2025-11-17 23", "p": 3997.4, "kind": "warn", "r": 18},
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
            {"t": "vband", "from": "2026-08-19 00", "to": "2026-08-19 06", "kind": "muted", "label": "ASIA", "op": 0.07},
            {"t": "vband", "from": "2026-08-19 07", "to": "2026-08-19 12", "kind": "brand", "label": "LONDON", "op": 0.07},
            {"t": "vband", "from": "2026-08-19 13", "to": "2026-08-19 20", "kind": "up", "label": "NEW YORK", "op": 0.06},
            {"t": "zone", "from": "2026-08-19 00", "to": "2026-08-19 06", "lo": 1.15741, "hi": 1.15929, "kind": "warn", "label": "Asian range", "lpos": "below"},
            {"t": "hline", "p": 1.15808, "from": "2026-08-18 22", "kind": "ink", "dash": True, "label": "P", "lat": "start"},
            {"t": "hline", "p": 1.15902, "from": "2026-08-18 22", "kind": "up", "dash": True, "label": "R1", "lat": "start"},
            {"t": "hline", "p": 1.16009, "from": "2026-08-18 22", "kind": "up", "dash": True, "label": "R2", "lat": "start"},
            {"t": "hline", "p": 1.157, "from": "2026-08-18 22", "kind": "down", "dash": True, "label": "S1", "lat": "start", "lpos": "below"},
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
        "symbol": "EURUSD", "tf": "4H", "start": "2025-04-02 13", "end": "2025-04-11 05", "stamp": "Apr 2025", "room": 4,
        "ann": [
            {"t": "zone", "from": "2025-04-03 01", "to": "2025-04-09 01", "lo": 1.08838, "hi": 1.09266, "kind": "up", "op": 0.1},
            {"t": "hline", "p": 1.0905, "from": "2025-04-07 13", "kind": "down", "dash": True, "label": "Tight stop: taken by the wick", "lpos": "below"},
            {"t": "hline", "p": 1.0870, "from": "2025-04-07 13", "kind": "up", "dash": True, "label": "Structure stop: below the zone, survives", "lpos": "below"},
            {"t": "ring", "at": "2025-04-08 13", "p": 1.08956, "kind": "warn", "r": 18},
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
        "symbol": "EURUSD", "tf": "1H", "start": "2026-08-19 04", "end": "2026-08-19 21", "stamp": "19 Aug 2026 · times UTC", "room": 5,
        "ann": [
            {"t": "hline", "p": 1.16063, "from": "2026-08-19 12", "kind": "muted", "dash": True, "label": "1.16063", "lat": "start", "lpos": "below", "tag": False},
            {"t": "hline", "p": 1.16809, "from": "2026-08-19 15", "kind": "muted", "dash": True, "tag": False},
            {"t": "arrow", "a": ["2026-08-19 21", 1.16063], "b": ["2026-08-19 21", 1.16809], "kind": "up", "w": 2.2},
            {"t": "label", "at": "2026-08-19 17", "p": 1.1638, "text": "+74.6 pips = +$746 on 1 standard lot", "kind": "up"},
        ],
    },
]

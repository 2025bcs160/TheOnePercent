const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));
const rawApiBaseUrl = import.meta.env.VITE_API_URL || "https://web-production-31811.up.railway.app";
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "") + "/api";

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('propFirmAuth') ? JSON.parse(localStorage.getItem('propFirmAuth')).token : null;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = json?.error || response.statusText || "API request failed";
    throw new Error(error);
  }

  return json;
};

const mockTrades = [
  { id: "t-1", date: "2026-04-01T10:15:00Z", symbol: "EURUSD", profit: 420, lot: 0.72, rr: 2.4, direction: "Buy", strategy: "Trend" },
  { id: "t-2", date: "2026-04-02T13:10:00Z", symbol: "GBPUSD", profit: -120, lot: 0.45, rr: 0.9, direction: "Sell", strategy: "Breakout" },
  { id: "t-3", date: "2026-04-05T09:30:00Z", symbol: "USDJPY", profit: 260, lot: 1.12, rr: 2.2, direction: "Buy", strategy: "Range" },
  { id: "t-4", date: "2026-04-07T17:20:00Z", symbol: "AUDUSD", profit: -80, lot: 0.38, rr: 0.8, direction: "Sell", strategy: "Reversal" },
  { id: "t-5", date: "2026-04-10T11:40:00Z", symbol: "EURGBP", profit: 310, lot: 0.55, rr: 3.0, direction: "Buy", strategy: "Trend" },
  { id: "t-6", date: "2026-04-12T15:05:00Z", symbol: "BTCUSD", profit: 650, lot: 0.04, rr: 2.8, direction: "Buy", strategy: "News" },
  { id: "t-7", date: "2026-04-18T08:50:00Z", symbol: "ES1!", profit: -210, lot: 0.25, rr: 0.6, direction: "Sell", strategy: "Breakout" },
  { id: "t-8", date: "2026-04-22T12:00:00Z", symbol: "NQ1!", profit: 180, lot: 0.16, rr: 1.9, direction: "Buy", strategy: "Range" },
];

const accountProfiles = {
  "222038520": {
    broker: "Exness",
    server: "Exness-MT5Real30",
    password: "Exness1234",
    accountType: "Real",
    platform: "MT5",
    startingBalance: 10000,
    balance: 10340,
    leverage: "1:2000",
    accountName: "Exness / 222038520",
    accountLabel: "DUBBY",
    trades: [
      { id: "ex-1", date: "2026-04-01T10:15:00Z", symbol: "EURUSD", profit: 120, lot: 0.23, rr: 1.8, direction: "Buy", strategy: "Trend" },
      { id: "ex-2", date: "2026-04-03T13:10:00Z", symbol: "GBPUSD", profit: -60, lot: 0.18, rr: 0.9, direction: "Sell", strategy: "Range" },
      { id: "ex-3", date: "2026-04-05T09:30:00Z", symbol: "USDJPY", profit: 310, lot: 0.45, rr: 2.1, direction: "Buy", strategy: "Trend" },
      { id: "ex-4", date: "2026-04-09T16:05:00Z", symbol: "AUDUSD", profit: -140, lot: 0.3, rr: 0.7, direction: "Sell", strategy: "Breakout" },
      { id: "ex-5", date: "2026-04-12T11:40:00Z", symbol: "EURGBP", profit: 220, lot: 0.5, rr: 2.6, direction: "Buy", strategy: "Pattern" },
      { id: "ex-6", date: "2026-04-16T14:20:00Z", symbol: "BTCUSD", profit: 430, lot: 0.06, rr: 1.9, direction: "Buy", strategy: "News" },
      { id: "ex-7", date: "2026-04-18T08:50:00Z", symbol: "ES1!", profit: -190, lot: 0.25, rr: 0.8, direction: "Sell", strategy: "Breakout" },
      { id: "ex-8", date: "2026-04-20T10:00:00Z", symbol: "NQ1!", profit: 260, lot: 0.12, rr: 1.7, direction: "Buy", strategy: "Momentum" },
    ],
  },
  "915094": {
    broker: "Exness",
    server: "Exness-MT5Real21",
    password: "GoatFunded2026",
    accountType: "Real",
    platform: "MT5",
    startingBalance: 15000,
    balance: 10235.5,
    leverage: "1:1000",
    accountName: "Exness / 915094",
    accountLabel: "GOAT",
    trades: [
      { id: "goat-1", date: "2026-03-30T12:05:00Z", symbol: "XAUUSD", profit: -2360, lot: 2.0, rr: 0.7, direction: "Sell", strategy: "Breakout" },
      { id: "goat-2", date: "2026-03-30T12:12:00Z", symbol: "XAGUSD", profit: -2110, lot: 2.0, rr: 0.6, direction: "Sell", strategy: "Momentum" },
      { id: "goat-3", date: "2026-03-30T12:40:00Z", symbol: "XAGUSD", profit: -1985, lot: 1.0, rr: 0.5, direction: "Buy", strategy: "Range" },
      { id: "goat-4", date: "2026-03-29T16:23:00Z", symbol: "XAUUSD", profit: 2299, lot: 1.0, rr: 1.2, direction: "Sell", strategy: "Reversal" },
      { id: "goat-5", date: "2026-03-29T10:42:00Z", symbol: "XAGUSD", profit: 3195, lot: 2.0, rr: 1.4, direction: "Buy", strategy: "Trend" },
    ],
  },
};

const storageKeys = {
  user: "propFirmUser",
  accounts: "propFirmAccounts",
  activeMode: "propFirmActiveMode",
  accountData: "propFirmAccountData",
  propFirmTrades: "propFirmTrades",
  personalTrades: "personalTrades",
};

function findAccount(credentials = {}) {
  const { broker, login, server, password } = credentials;
  const account = accountProfiles[login];
  if (!account) return null;
  if (account.broker.toLowerCase() !== (broker || "").toLowerCase()) return null;
  if (account.server.toLowerCase() !== (server || "").toLowerCase()) return null;
  if (password != null && account.password !== password) return null;
  return account;
}

async function fetchFromStorage(key, fallback = null) {
  await delay();
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
}

async function saveToStorage(key, value) {
  await delay();
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export async function fetchUser() {
  return fetchFromStorage(storageKeys.user, null);
}

export async function saveUser(user) {
  return saveToStorage(storageKeys.user, user);
}

export async function clearUser() {
  await delay();
  localStorage.removeItem(storageKeys.user);
}

export async function fetchActiveMode() {
  return fetchFromStorage(storageKeys.activeMode, "Personal");
}

export async function saveActiveMode(mode) {
  return saveToStorage(storageKeys.activeMode, mode);
}

export async function fetchAccountData() {
  return fetchFromStorage(storageKeys.accountData, null);
}

export async function saveAccountData(accountData) {
  return saveToStorage(storageKeys.accountData, accountData);
}

export async function fetchTrades(accountMode) {
  const key = accountMode === "Personal" ? storageKeys.personalTrades : storageKeys.propFirmTrades;
  return fetchFromStorage(key, []);
}

export async function saveTrades(accountMode, trades) {
  const key = accountMode === "Personal" ? storageKeys.personalTrades : storageKeys.propFirmTrades;
  return saveToStorage(key, trades);
}

export async function fetchAccounts() {
  return fetchFromStorage(storageKeys.accounts, []);
}

export async function saveAccounts(accounts) {
  return saveToStorage(storageKeys.accounts, accounts);
}

export async function getTrades(accountMode = "Personal") {
  const storedTrades = await fetchFromStorage(
    accountMode === "Personal" ? storageKeys.personalTrades : storageKeys.propFirmTrades,
    []
  );

  return storedTrades && storedTrades.length ? storedTrades : mockTrades;
}

export function analyzeTrades(trades = [], startingBalance = 10000) {
  const orderedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
  const wins = orderedTrades.filter((trade) => Number(trade.profit) > 0);
  const losses = orderedTrades.filter((trade) => Number(trade.profit) < 0);
  const totalProfit = orderedTrades.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
  const winRate = orderedTrades.length ? Number(((wins.length / orderedTrades.length) * 100).toFixed(1)) : 0;
  const averageWin = wins.length ? Number((wins.reduce((sum, trade) => sum + trade.profit, 0) / wins.length).toFixed(2)) : 0;
  const averageLoss = losses.length ? Number((Math.abs(losses.reduce((sum, trade) => sum + trade.profit, 0)) / losses.length).toFixed(2)) : 0;
  const averageRR = orderedTrades.filter((trade) => Number.isFinite(trade.rr)).length
    ? Number(
        (
          orderedTrades.reduce((sum, trade) => sum + Number(trade.rr || 0), 0) /
          orderedTrades.filter((trade) => Number.isFinite(trade.rr)).length
        ).toFixed(2)
      )
    : 0;

  let peak = startingBalance;
  let maxDrawdown = 0;
  let equity = startingBalance;
  const equityCurve = orderedTrades.map((trade) => {
    equity += Number(trade.profit || 0);
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
    return {
      label: new Date(trade.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Number(equity.toFixed(2)),
    };
  });

  const dailyLoss = orderedTrades.reduce((acc, trade) => {
    const dayKey = new Date(trade.date).toISOString().slice(0, 10);
    acc[dayKey] = (acc[dayKey] || 0) + trade.profit;
    return acc;
  }, {});

  const maxDailyLossObserved = Object.values(dailyLoss).length
    ? Object.values(dailyLoss).reduce((min, value) => Math.min(min, value), 0)
    : 0;

  const grossProfit = wins.reduce((sum, trade) => sum + Number(trade.profit || 0), 0);
  const grossLoss = losses.length ? Math.abs(losses.reduce((sum, trade) => sum + Number(trade.profit || 0), 0)) : 0;
  const profitFactor = grossLoss ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit ? Number(grossProfit.toFixed(2)) : 0;

  const monthlyProfit = Object.entries(
    orderedTrades.reduce((map, trade) => {
      const month = new Date(trade.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      map[month] = (map[month] || 0) + Number(trade.profit || 0);
      return map;
    }, {})
  ).map(([month, profit]) => ({ month, profit: Number(profit.toFixed(2)) }));

  const winLossData = [
    { name: "Wins", value: wins.length },
    { name: "Losses", value: losses.length },
  ];

  return {
    totalTrades: orderedTrades.length,
    totalProfit: Number(totalProfit.toFixed(2)),
    winRate,
    averageWin,
    averageLoss,
    averageRR,
    profitFactor,
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDailyLossObserved: Number(maxDailyLossObserved.toFixed(2)),
    equityCurve,
    monthlyProfit,
    monthlyBreakdown: monthlyProfit,
    winLossData,
    wins: wins.length,
    losses: losses.length,
  };
}

export async function getEquityData(accountMode = "Personal", startingBalance = 10000) {
  const trades = await getTrades(accountMode);
  const analytics = analyzeTrades(trades, startingBalance);
  return analytics.equityCurve;
}

export async function connectMT5Account(credentials) {
  const { broker, login, server, password } = credentials || {};

  if (!broker || !login || !server || !password) {
    throw new Error("Broker, login, password, and server are required for MT5 connection.");
  }

  const payload = {
    login: Number(login),
    password,
    server,
  };

  const result = await apiFetch("/connect", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const accountData = result.account || result.data;
  const accountInfo = {
    broker,
    login,
    server,
    platform: accountData?.platform || "MT5",
    accountType: /real/i.test(server) ? "Real" : "Demo",
    startingBalance: accountData?.balance ?? 0,
    balance: accountData?.balance ?? 0,
    leverage: accountData?.leverage ?? "",
    accountName: `MT5 / ${login}`,
    accountLabel: accountData?.login ? `${accountData.login}` : login,
  };

  return {
    success: true,
    message: result.message || "Connected to MetaTrader 5",
    accountInfo,
  };
}

export async function loadMT5Trades(credentials) {
  const result = await apiFetch("/trades?days_back=30", {
    method: "GET",
  });

  const trades = result.data || [];
  return trades.map((trade) => ({
    id: trade.ticket?.toString() || trade.symbol + trade.open_time,
    date: trade.open_time || trade.close_time || trade.time || trade.date,
    symbol: trade.symbol,
    entry: trade.open_price || trade.entry || 0,
    exit: trade.close_price || trade.exit || 0,
    profit: Number(trade.profit ?? 0),
    rr: Number(trade.rr ?? 0),
    direction: trade.type || trade.side || "Buy",
    strategy: trade.strategy || "MT5",
    notes: trade.comment || "",
  }));
}

export async function syncMT5Trades(accountMode) {
  if (!accountMode) {
    throw new Error("Account mode is required to sync trades.");
  }

  await apiFetch("/trades?days_back=30", { method: "GET" });

  return {
    success: true,
    message: `MT5 account synced successfully for ${accountMode} account.`,
  };
}

// Auth functions
export async function getUser() {
  try {
    const data = await apiFetch("/auth/me", { method: "GET" });
    return data.user;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
}

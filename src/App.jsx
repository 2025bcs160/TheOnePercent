import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { fetchAccountData, saveAccountData, getTrades, saveTrades, analyzeTrades } from "./services/api";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Trades from "./components/Trades";
import Calculator from "./components/Risk";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Landing from "./components/Landing";
import PrivateRoute from "./components/PrivateRoute";
import Backtesting from "./components/Backtesting";
import University from "./components/University";
import Signals from "./components/Signals";
import Community from "./components/Community";
import { AuthProvider, useAuth } from "./AuthContext";
import "./App.css";

const defaultAccountData = {
  Personal: {
    balance: 12000,
    riskPercent: 1,
    maxDailyLoss: 500,
  },
};

function AppShell({ initialPage = "Dashboard" }) {
  const [page, setPage] = useState(initialPage);
  const accountMode = "Personal";
  const [personalTrades, setPersonalTrades] = useState([]);
  const [accountData, setAccountData] = useState(defaultAccountData);
  const { user, login, logout, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    async function loadData() {
      const [savedAccountData, savedPersonal] = await Promise.all([
        fetchAccountData(),
        getTrades("Personal"),
      ]);

      if (savedAccountData && savedAccountData.Personal) {
        setAccountData(savedAccountData);
      }

      setPersonalTrades(savedPersonal || []);
    }

    loadData();
  }, []);

  useEffect(() => {
    saveTrades("Personal", personalTrades);
  }, [personalTrades]);

  const activeAccount = accountData[accountMode] || defaultAccountData.Personal;
  const trades = personalTrades;
  const setTrades = setPersonalTrades;
  const accountBalance = activeAccount.balance;
  const riskPercent = activeAccount.riskPercent;
  const maxDailyLoss = activeAccount.maxDailyLoss;

  useEffect(() => {
    saveAccountData(accountData);
  }, [accountData]);

  const analytics = useMemo(() => analyzeTrades(trades, accountBalance), [trades, accountBalance]);

  const handleLogout = () => {
    logout();
  };

  const setActiveAccount = (updates) => {
    setAccountData((current) => ({
      ...current,
      [accountMode]: {
        ...current[accountMode],
        ...updates,
      },
    }));
  };

  const setAccountBalance = (value) => setActiveAccount({ balance: value });
  const setRiskPercent = (value) => setActiveAccount({ riskPercent: value });
  const setMaxDailyLoss = (value) => setActiveAccount({ maxDailyLoss: value });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      <main className="app-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">TheOnePercent</p>
            <h1>{page}</h1>
            <p className="page-subtitle">Trade like the top 1% with premium analytics built for serious traders.</p>
          </div>
          {page !== "Community" && (
            <div className="topbar-pillset">
              <span className="pill">Balance: ${accountBalance.toLocaleString()}</span>
              <span className="pill">Mode: Personal</span>
              <span className="pill">Win Rate: {analytics.winRate}%</span>
            </div>
          )}
        </header>

        <section className="page-panel">
          {page === "Dashboard" && (
            <Dashboard trades={trades} accountBalance={accountBalance} accountMode={accountMode} />
          )}
          {page === "Journal" && <Trades trades={trades} setTrades={setTrades} accountMode={accountMode} />}
          {page === "Analytics" && <Analytics trades={trades} accountBalance={accountBalance} />}
          {page === "Calculator" && (
            <Calculator
              analytics={analytics}
              accountBalance={accountBalance}
              riskPercent={riskPercent}
              setAccountBalance={setAccountBalance}
              setRiskPercent={setRiskPercent}
              maxDailyLoss={maxDailyLoss}
              setMaxDailyLoss={setMaxDailyLoss}
            />
          )}
          {page === "Settings" && <Settings user={user} accountMode={accountMode} />}
          {page === "Backtesting" && <Backtesting />}
          {page === "University" && <University />}
          {page === "Signals" && <Signals />}
          {page === "Community" && <Community />}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AppShell initialPage="Analytics" />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
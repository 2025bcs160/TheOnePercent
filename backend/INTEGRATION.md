"""
Integration API Service for React Frontend
Communicates with the Python backend
"""

// File: src/services/backendApi.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Call failed (${endpoint}):`, error);
    throw error;
  }
}

// Authentication
export async function connectToMT5(login, password, server) {
  return apiCall('/connect', {
    method: 'POST',
    body: JSON.stringify({ login, password, server }),
  });
}

export async function disconnectMT5() {
  return apiCall('/disconnect', {
    method: 'POST',
  });
}

// Account
export async function getAccount() {
  return apiCall('/account', {
    method: 'GET',
  });
}

// Trading
export async function getOpenPositions() {
  return apiCall('/positions', {
    method: 'GET',
  });
}

export async function getTradeHistory(daysBack = 30, symbol = null) {
  let endpoint = `/trades?days_back=${daysBack}`;
  if (symbol) {
    endpoint += `&symbol=${symbol}`;
  }
  
  return apiCall(endpoint, {
    method: 'GET',
  });
}

export async function getTradeDetails(ticket) {
  return apiCall(`/trades/${ticket}`, {
    method: 'GET',
  });
}

// System
export async function healthCheck() {
  return apiCall('/health', {
    method: 'GET',
  });
}

export async function getConnectionStatus() {
  return apiCall('/status', {
    method: 'GET',
  });
}

// ============================================================

// File: src/hooks/useMT5Connection.js
// Custom hook for MT5 connection management

import { useState, useCallback } from 'react';
import * as backendApi from '../services/backendApi';

export function useMT5Connection() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  const connect = useCallback(async (login, password, server) => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendApi.connectToMT5(login, password, server);
      
      if (response.success) {
        setConnected(true);
        setAccount(response.account);
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    
    try {
      await backendApi.disconnectMT5();
      setConnected(false);
      setAccount(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!connected) return;

    try {
      const response = await backendApi.getAccount();
      
      if (response.success) {
        setAccount(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [connected]);

  return {
    connected,
    loading,
    error,
    account,
    connect,
    disconnect,
    refreshAccount,
  };
}

// ============================================================

// File: src/components/MT5Connection.jsx
// React component for connecting to MT5

import { useState } from 'react';
import { useMT5Connection } from '../hooks/useMT5Connection';
import { Power, AlertCircle, CheckCircle } from 'lucide-react';

export default function MT5Connection() {
  const { connected, loading, error, account, connect, disconnect } = useMT5Connection();
  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
    server: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    try {
      await connect(
        parseInt(credentials.login),
        credentials.password,
        credentials.server
      );
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  if (connected && account) {
    return (
      <div className="mt5-panel connected">
        <div className="connection-header">
          <CheckCircle size={24} className="success-icon" />
          <h3>Connected to MetaTrader 5</h3>
        </div>
        
        <div className="account-info">
          <div className="info-row">
            <span>Account:</span>
            <strong>{account.login}</strong>
          </div>
          <div className="info-row">
            <span>Balance:</span>
            <strong className="positive">${account.balance.toFixed(2)}</strong>
          </div>
          <div className="info-row">
            <span>Equity:</span>
            <strong>${account.equity.toFixed(2)}</strong>
          </div>
          <div className="info-row">
            <span>Margin Level:</span>
            <strong>{account.margin_level.toFixed(0)}%</strong>
          </div>
        </div>
        
        <button 
          onClick={handleDisconnect}
          disabled={loading}
          className="btn btn-disconnect"
        >
          <Power size={18} />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="mt5-panel disconnected">
      <h3>Connect to MetaTrader 5</h3>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleConnect}>
        <input
          type="number"
          name="login"
          placeholder="Login ID"
          value={credentials.login}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <input
          type="text"
          name="server"
          placeholder="Server (e.g., Exness-MT5Real)"
          value={credentials.server}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <button 
          type="submit"
          disabled={loading}
          className="btn btn-connect"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}

// ============================================================

// File: src/components/PositionsPanel.jsx
// Component to display open positions from MT5

import { useEffect, useState } from 'react';
import * as backendApi from '../services/backendApi';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function PositionsPanel() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPositions();
    
    // Refresh positions every 30 seconds
    const interval = setInterval(loadPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPositions = async () => {
    setLoading(true);
    
    try {
      const response = await backendApi.getOpenPositions();
      
      if (response.success) {
        setPositions(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && positions.length === 0) {
    return <div className="loading">Loading positions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (positions.length === 0) {
    return <div className="empty-state">No open positions</div>;
  }

  return (
    <div className="positions-panel">
      <h2>Open Positions ({positions.length})</h2>
      
      <table className="positions-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Volume</th>
            <th>Entry Price</th>
            <th>Current Price</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.ticket} className={pos.profit >= 0 ? 'win' : 'loss'}>
              <td className="symbol">{pos.symbol}</td>
              <td className={`type ${pos.type.toLowerCase()}`}>
                {pos.type === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {pos.type}
              </td>
              <td>{pos.volume}</td>
              <td>${pos.open_price.toFixed(5)}</td>
              <td>${pos.current_price.toFixed(5)}</td>
              <td className={pos.profit >= 0 ? 'positive' : 'negative'}>
                ${Math.abs(pos.profit).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

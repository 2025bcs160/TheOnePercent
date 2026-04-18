# Trading Dashboard - Real MT5 Integration Setup Guide

## Overview

Your trading dashboard is now configured for **real MetaTrader 5 integration**. This guide walks you through setting everything up and testing the MT5 login flow.

## Architecture

```
Frontend (React/Vite)          Backend (Flask)           MetaTrader 5
http://localhost:5175   <-->   http://localhost:8000   <-->   Terminal
                                  /api/connect
                                  /api/trades
                                  /api/account
```

## Prerequisites

### For the Backend (MT5 Support)
- **MetaTrader 5 Terminal** must be installed and running on your system
- **Python 3.10+** installed
- **Windows OS** (or WSL2/Windows VM for Linux/Mac users)

### For the Frontend
- **Node.js 18+**
- **npm** or **yarn**

## Quick Start

### 1. Start the Backend

Open a PowerShell terminal in the project root:

```powershell
cd backend
.\.venv\Scripts\python.exe app_flask.py
```

You should see:
```
* Running on http://0.0.0.0:8000
* WARNING: This is a development server. Do not use it in production.
```

**Test the backend is running:**
```powershell
Invoke-WebRequest http://localhost:8000/api/docs | Select-Object -ExpandProperty Content
```

### 2. Start the Frontend (in a new terminal)

```powershell
cd trading-dashboard
npm run dev
```

You should see:
```
VITE v8.0.8  ready in XXX ms
➜  Local:   http://localhost:5175/
```

### 3. Test the MT5 Login

1. **Open your browser** at http://localhost:5175
2. **Navigate to Settings** (bottom left)
3. **Enter your MT5 credentials:**
   - **Login ID:** Your MetaTrader 5 account login number
   - **Password:** Your MetaTrader 5 password
   - **Server:** Your broker's server (e.g., `Exness-MT5Real`, `Exness-MT5Demo`)
4. **Click "Connect"**

The frontend will:
1. Send your credentials to the Flask backend (`POST /api/connect`)
2. Backend initializes and connects to MetaTrader 5
3. Backend retrieves your account info and sends it back
4. Frontend displays your account information and balance

### 4. Load Your Real Trades

Once connected:
1. **Click "Load Trades"** button
2. Frontend requests trade history from backend (`GET /api/trades?days_back=30`)
3. Your real MT5 trades appear in the dashboard

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```env
# Backend Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# Optional: Pre-configured MT5 credentials (NOT recommended for production)
# MT5_LOGIN=
# MT5_PASSWORD=
# MT5_SERVER=
```

### Frontend Configuration

The frontend automatically uses the backend at `http://localhost:8000/api`.

To use a different backend URL, set the environment variable before running:

```powershell
$env:VITE_API_URL = "http://192.168.1.100:8000"
npm run dev
```

## API Endpoints

### Authentication

**Connect to MetaTrader 5**
```http
POST /api/connect
Content-Type: application/json

{
  "login": 12345678,
  "password": "your_password",
  "server": "Exness-MT5Real"
}
```

Response:
```json
{
  "success": true,
  "message": "Connected to MetaTrader 5",
  "account": {
    "login": 12345678,
    "balance": 10000.00,
    "equity": 10500.00,
    "profit": 500.00,
    "margin_used": 2000.00,
    "margin_free": 8000.00,
    "margin_level": 525.0,
    "currency": "USD",
    "server": "Exness-MT5Real",
    "company": "Exness"
  }
}
```

### Trading

**Get Trade History**
```http
GET /api/trades?days_back=30&symbol=EURUSD
```

**Get Account Info**
```http
GET /api/account
```

**Health Check**
```http
GET /api/docs
```

## Troubleshooting

### Error: "Failed to initialize MetaTrader 5"
- **Cause:** MetaTrader 5 terminal is not running
- **Solution:** Open your MetaTrader 5 terminal and keep it running while using the dashboard

### Error: "Login failed"
- **Cause:** Wrong credentials or server name
- **Solution:** 
  - Verify your login ID, password, and server name
  - Check that your MT5 account is active with your broker
  - Try logging in directly to MetaTrader 5 to confirm credentials work

### Error: "Port already in use"
- **Backend:** Use a different port
  ```powershell
  $env:PORT = "8001"
  .\.venv\Scripts\python.exe app_flask.py
  ```
  Then update frontend to use that port in code or environment variable.

- **Frontend:** Vite will automatically try the next available port (5176, 5177, etc.)

### Frontend can't reach backend
- **Check backend is running:** 
  ```powershell
  Invoke-WebRequest http://localhost:8000/health
  ```
- **Check CORS settings:** Verify `CORS_ORIGINS` in backend `.env` includes your frontend URL
- **Check firewall:** Ensure port 8000 is not blocked

### No trades loading after connection
- **Cause:** You may have no closed trades in the specified date range
- **Solution:** Try a larger date range or check that trades exist in your MT5 account

## Project Structure

```
trading-dashboard/
├── src/
│   ├── components/
│   │   ├── Settings.jsx          # MT5 login form
│   │   ├── Analytics.jsx         # Dashboard with trade data
│   │   └── ...
│   ├── services/
│   │   └── api.js                # API communication layer
│   └── ...
├── backend/
│   ├── app_flask.py              # Flask server
│   ├── mt5_client.py             # MT5 connection logic
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example              # Environment config template
│   └── ...
└── ...
```

## Features

✅ **Real MT5 Account Connection** - Connect with live credentials  
✅ **Account Information** - View live balance, equity, margin  
✅ **Trade History** - Load real trades with entry/exit prices and P&L  
✅ **Risk Analytics** - Analyze your trading performance  
✅ **Multi-Account** - Switch between different MT5 accounts  
✅ **Responsive Design** - Works on desktop and tablets  

## Security Notes

⚠️ **Never commit credentials to Git**
- The `.gitignore` file excludes `.env` files
- Use environment variables in production
- Consider using a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)

⚠️ **HTTPS in Production**
- This development setup uses HTTP only
- For production, use HTTPS and secure your backend with authentication

⚠️ **Firewall & Network**
- The backend binds to `0.0.0.0` for development
- In production, restrict to localhost or specific IPs

## Next Steps

### Development
1. Modify dashboard components in `src/components/`
2. Add new analysis features
3. Implement trade alerts
4. Add performance metrics

### Deployment
1. Build frontend: `npm run build`
2. Deploy to web server or cloud platform
3. Set up production Flask server with Gunicorn/uWSGI
4. Configure HTTPS and domain
5. Use environment variables for secrets

## Support

For issues with:
- **Frontend:** Check `src/services/api.js` and browser console
- **Backend:** Check Flask logs and `backend/app_flask.py`
- **MT5:** Consult MetaTrader 5 documentation and broker support

## API Documentation

Interactive API docs available at:
- http://localhost:8000/api/docs (Flask JSON documentation)

See `backend/README.md` for detailed endpoint documentation.

---

**Enjoy your real MT5 trading dashboard! 📊**

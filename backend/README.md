# Trading Dashboard Backend

Python backend for MetaTrader 5 integration using Flask.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** The MetaTrader5 library requires Windows or specific configuration on other OS. On Linux/Mac, you'll need WSL2 or a Windows VM.

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Pre-configured credentials (NOT recommended for production)
# MT5_LOGIN=your_login_id
# MT5_PASSWORD=your_password
# MT5_SERVER=Exness-MT5Real
```

### 3. Run the Backend

```bash
python app_flask.py
```

The API will be available at `http://localhost:8000`

### 4. Access API Documentation

- **JSON Docs:** http://localhost:8000/api/docs

## API Endpoints

### Authentication

#### Connect to MetaTrader 5
```http
POST /api/connect
Content-Type: application/json

{
  "login": 12345678,
  "password": "your_password",
  "server": "Exness-MT5Real"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected to MetaTrader 5",
  "account": {
    "login": 12345678,
    "balance": 10000.00,
    "equity": 10500.00,
    "credit": 0,
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

#### Disconnect
```http
POST /api/disconnect
```

### Account

#### Get Account Information
```http
GET /api/account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "login": 12345678,
    "balance": 10000.00,
    "equity": 10500.00,
    "credit": 0,
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

#### Get Open Positions
```http
GET /api/positions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticket": 123456789,
      "symbol": "EURUSD",
      "type": "BUY",
      "volume": 0.1,
      "open_price": 1.0850,
      "current_price": 1.0865,
      "sl": 1.0800,
      "tp": 1.0900,
      "profit": 15.00,
      "open_time": "2024-01-15T10:30:00",
      "comment": "Morning breakout"
    }
  ]
}
```

#### Get Trade History
```http
GET /api/trades?days_back=30&symbol=EURUSD
```

**Parameters:**
- `days_back` (int, default: 30): Number of days to fetch history for (1-365)
- `symbol` (string, optional): Filter by specific symbol

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticket": 987654321,
      "symbol": "EURUSD",
      "type": "BUY",
      "volume": 0.1,
      "open_price": 1.0800,
      "close_price": 1.0850,
      "sl": 1.0750,
      "tp": 1.0900,
      "profit": 50.00,
      "open_time": "2024-01-14T09:00:00",
      "close_time": "2024-01-14T14:30:00",
      "comment": "Trend following",
      "duration_minutes": 330
    }
  ]
}
```

#### Get Specific Trade
```http
GET /api/trades/123456789
```

### System

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "connected": true
}
```

#### Connection Status
```http
GET /status
```

**Response:**
```json
{
  "connected": true,
  "message": "Connected to MetaTrader 5",
  "account": {
    "login": 12345678,
    "balance": 10000.00,
    "equity": 10500.00
  }
}
```

## Integration with React Frontend

In your React app, create a service to communicate with the backend:

```javascript
// src/services/backendApi.js
const API_URL = 'http://localhost:8000';

export async function connectToMT5(login, password, server) {
  const response = await fetch(`${API_URL}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password, server })
  });
  return response.json();
}

export async function getAccount() {
  const response = await fetch(`${API_URL}/account`);
  return response.json();
}

export async function getPositions() {
  const response = await fetch(`${API_URL}/positions`);
  return response.json();
}

export async function getTrades(daysBack = 30, symbol = null) {
  let url = `${API_URL}/trades?days_back=${daysBack}`;
  if (symbol) url += `&symbol=${symbol}`;
  const response = await fetch(url);
  return response.json();
}
```

## Security Considerations

1. **Credentials Handling:**
   - Never commit real credentials to version control
   - Use environment variables or secure secrets managers
   - Consider using OAuth or token-based authentication
   - Store passwords securely (hashed, encrypted at rest)

2. **API Security:**
   - Add authentication (JWT, API keys)
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all inputs

3. **MetaTrader 5 Security:**
   - Use read-only API keys if available
   - Restrict IP addresses
   - Monitor account activity
   - Use strong, unique passwords

## Production Deployment

### Docker Setup

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

Set these in your deployment platform:

```
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com
LOG_LEVEL=INFO
```

### Running with Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Troubleshooting

### Connection Issues

**Error: "Failed to initialize MetaTrader 5"**
- MetaTrader 5 terminal must be running
- Ensure you have the MT5 client installed
- On Linux/Mac, use WSL2 or Windows VM

**Error: "Login failed"**
- Verify login ID, password, and server name
- Check account status with your broker
- Ensure server name is exact (e.g., "Exness-MT5Real")

### Performance Optimization

- Add caching for account info (reduces API calls)
- Implement pagination for trade history
- Consider WebSocket for real-time updates
- Use connection pooling for multiple clients

## Development

### File Structure

```
backend/
├── main.py                 # FastAPI application
├── mt5_client.py          # MetaTrader 5 client
├── requirements.txt       # Python dependencies
├── .env.example          # Environment config template
└── README.md             # This file
```

### Adding New Endpoints

1. Define request/response models in `main.py`
2. Implement client methods in `mt5_client.py`
3. Create endpoint in `main.py`
4. Add documentation and examples

### Testing

```bash
# Test connection
curl -X POST http://localhost:8000/connect \
  -H "Content-Type: application/json" \
  -d '{"login": 123, "password": "pass", "server": "Server"}'

# Get account info
curl http://localhost:8000/account

# Get positions
curl http://localhost:8000/positions

# Get trade history
curl http://localhost:8000/trades?days_back=7
```

## License

This backend is part of the Trading Dashboard project.

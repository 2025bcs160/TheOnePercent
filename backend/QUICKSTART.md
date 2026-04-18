# Backend Quick Start Guide

## Overview

This backend provides a REST API for connecting to MetaTrader 5 and retrieving trading data. It uses FastAPI (with Flask alternative) and the MetaTrader5 Python library.

## Prerequisites

- **Python 3.8+**
- **MetaTrader 5** terminal installed and running
- **pip** package manager
- Windows OS (for native MT5 support, or WSL2/VM on Linux/Mac)

## Installation

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- FastAPI: Modern Python web framework
- Uvicorn: ASGI server
- MetaTrader5: Official MT5 Python library
- Python-dotenv: Environment configuration
- Flask/CORS: Alternative framework (optional)

### Step 2: Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit with your settings (or leave empty to provide credentials via API)
# nano .env  (on Linux/Mac)
# notepad .env  (on Windows)
```

**Important:** Never commit real credentials to git. Use environment variables in production.

### Step 3: Start the Backend

```bash
# FastAPI (Recommended - automatic docs at /docs)
python main.py

# Or using Uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Flask alternative
python app_flask.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Testing the Backend

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "connected": false
}
```

### 2. Connect to MetaTrader 5

```bash
curl -X POST http://localhost:8000/connect \
  -H "Content-Type: application/json" \
  -d '{
    "login": YOUR_LOGIN_ID,
    "password": "YOUR_PASSWORD",
    "server": "Exness-MT5Real"
  }'
```

Replace `YOUR_LOGIN_ID`, `YOUR_PASSWORD`, and server name with your actual credentials.

### 3. Get Account Information

Once connected:

```bash
curl http://localhost:8000/account
```

### 4. Get Open Positions

```bash
curl http://localhost:8000/positions
```

### 5. Get Trade History

```bash
# Last 30 days
curl http://localhost:8000/trades

# Last 7 days
curl "http://localhost:8000/trades?days_back=7"

# Specific symbol
curl "http://localhost:8000/trades?symbol=EURUSD"
```

### 6. Using the Test Script

```bash
# Edit test_backend.py and set credentials
python test_backend.py
```

## API Documentation

### Interactive Documentation

**FastAPI:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Flask:**
- JSON Docs: http://localhost:8000/api/docs

### Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/connect` | POST | Connect to MT5 |
| `/disconnect` | POST | Disconnect from MT5 |
| `/account` | GET | Get account info |
| `/positions` | GET | Get open trades |
| `/trades` | GET | Get trade history |
| `/trades/{id}` | GET | Get specific trade |
| `/status` | GET | Connection status |

## Common Issues

### "Failed to initialize MetaTrader 5"
- Ensure MetaTrader 5 terminal is running
- MT5 must be installed on your system
- On Linux/Mac, use WSL2 or Windows VM

### "Login failed"
- Verify login ID and password
- Check server name is correct (e.g., "Exness-MT5Real")
- Ensure account is active with your broker

### "Port already in use"
Use a different port:
```bash
uvicorn main:app --port 8001
```

### Connection timeout
- Check if backend is running
- Ensure no firewall blocking port 8000
- Try `curl http://localhost:8000/health`

## Integration with Frontend

See [INTEGRATION.md](./INTEGRATION.md) for React integration examples.

Quick example:
```javascript
// Connect to backend
const response = await fetch('http://localhost:8000/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    login: 12345,
    password: 'password',
    server: 'Server-Name'
  })
});

const data = await response.json();
console.log(data);
```

## Production Deployment

### Docker

```bash
# Build image
docker build -t trading-backend .

# Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e MT5_LOGIN=12345 \
  -e MT5_PASSWORD=password \
  -e MT5_SERVER=Server-Name \
  trading-backend
```

### Docker Compose

```bash
docker-compose up -d
```

### Cloud Deployment (Heroku example)

```bash
# Create Procfile
echo "web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app" > Procfile

# Deploy
git push heroku main
```

## Security Best Practices

1. **Credentials:**
   - Never hardcode in code
   - Use environment variables
   - Rotate passwords regularly
   - Use read-only API keys if available

2. **API Security:**
   - Add authentication (JWT, API keys)
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all inputs
   - Use CORS restrictively

3. **Data Protection:**
   - Encrypt sensitive data at rest
   - Use secure connections only
   - Audit API access
   - Monitor for suspicious activity

## Advanced Configuration

### Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production

# CORS
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Logging
LOG_LEVEL=INFO

# MT5 (optional - for auto-connection)
MT5_LOGIN=123456
MT5_PASSWORD=your_password
MT5_SERVER=Exness-MT5Real
```

### Enabling CORS for Multiple Domains

Edit `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
```

## Performance Optimization

1. **Caching:**
   Add Redis for caching account data
   
2. **Pagination:**
   Implement for large trade history queries
   
3. **WebSocket:**
   Real-time position updates
   
4. **Connection Pooling:**
   Multiple MT5 connections for concurrent requests

## Troubleshooting

### Debug Mode
```bash
export ENVIRONMENT=development
python main.py
```

### Check Logs
```bash
# View verbose output
python main.py --log-level DEBUG
```

### Test Connection
```bash
# Use the test script
python test_backend.py
```

### Verify MetaTrader 5
```python
import MetaTrader5 as mt5
print(mt5.version())
```

## Next Steps

1. ✅ Backend running
2. 📱 [Integrate with React frontend](./INTEGRATION.md)
3. 🔐 Set up proper authentication
4. 🚀 Deploy to production
5. 📊 Add advanced features (WebSocket, caching, etc.)

## Support & Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MetaTrader5 Python Library](https://www.mql5.com/en/docs/integration/python_metatrader5)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)

## License

Part of the Trading Dashboard project.

"""
Flask Backend for Trading Dashboard (Alternative to FastAPI)
Provides API endpoints for MetaTrader 5 integration
"""

import os
import sys
import logging
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Allow local backend modules to import correctly no matter the working directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from mt5_client import *
except Exception as import_error:
    print("MT5 disabled:", import_error)

    class _DummyMT5Client:
        connected = False

        def connect(self, *args, **kwargs):
            return {"success": False, "error": "MT5 not available"}

        def disconnect(self, *args, **kwargs):
            return True

        def get_account(self, *args, **kwargs):
            return {"success": False}

        def get_positions(self, *args, **kwargs):
            return {"success": False}

        def get_trades(self, *args, **kwargs):
            return {"success": False}

        def get_trade_history_by_ticket(self, *args, **kwargs):
            return {"success": False}

    mt5_client = _DummyMT5Client()
    print("MT5 disabled:", e)
except Exception as import_error:
    logger.warning(
        "MT5 client import failed; running without MetaTrader 5 support: %s",
        import_error,
    )

    class _DummyMT5Client:
        connected = False

        def connect(self, *args, **kwargs):
            return {"success": False, "error": "MetaTrader 5 client unavailable"}

        def disconnect(self, *args, **kwargs):
            return True

        def get_account(self, *args, **kwargs):
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        def get_positions(self, *args, **kwargs):
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        def get_trades(self, *args, **kwargs):
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        def get_trade_history_by_ticket(self, *args, **kwargs):
            return {"success": False, "error": "Not connected to MetaTrader 5"}

    mt5_client = _DummyMT5Client()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Configure CORS
cors_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,https://theonepercen.com,https://www.theonepercen.com"
).split(",")
CORS(app, resources={r"/api/*": {"origins": cors_origins}})


# Decorators
def require_connection(f):
    """Decorator to check if connected to MT5"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not mt5_client.connected:
            return jsonify({
                "success": False,
                "error": "Not connected to MetaTrader 5"
            }), 503
        return f(*args, **kwargs)
    return decorated_function


# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"success": False, "error": "Bad request"}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error: {error}")
    return jsonify({"success": False, "error": "Internal server error"}), 500


# Health check
@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "connected": mt5_client.connected,
        "timestamp": datetime.now().isoformat()
    }), 200


# Authentication endpoints
@app.route("/api/connect", methods=["POST"])
def connect():
    """
    Connect to MetaTrader 5
    
    Request body:
    {
        "login": integer,
        "password": string,
        "server": string
    }
    """
    try:
        data = request.get_json()
        
        if not data or "login" not in data or "password" not in data or "server" not in data:
            return jsonify({
                "success": False,
                "error": "Missing required fields: login, password, server"
            }), 400
        
        result = mt5_client.connect(
            login=int(data["login"]),
            password=data["password"],
            server=data["server"]
        )
        
        if not result["success"]:
            return jsonify(result), 401
        
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": f"Invalid input: {str(e)}"
        }), 400
    except Exception as e:
        logger.error(f"Connection error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Connection failed: {str(e)}"
        }), 500


@app.route("/api/disconnect", methods=["POST"])
def disconnect():
    """Disconnect from MetaTrader 5"""
    try:
        if mt5_client.disconnect():
            return jsonify({
                "success": True,
                "message": "Disconnected from MetaTrader 5"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Failed to disconnect"
            }), 500
    except Exception as e:
        logger.error(f"Disconnect error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Account endpoints
@app.route("/api/account", methods=["GET"])
@require_connection
def get_account():
    """Get current account information"""
    try:
        result = mt5_client.get_account()
        
        if not result["success"]:
            return jsonify(result), 500
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching account: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Trading endpoints
@app.route("/api/positions", methods=["GET"])
@require_connection
def get_positions():
    """Get all open positions/trades"""
    try:
        result = mt5_client.get_positions()
        
        if not result["success"]:
            return jsonify(result), 500
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching positions: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/trades", methods=["GET"])
@require_connection
def get_trades():
    """
    Get trade history
    
    Query parameters:
    - days_back: int (default: 30, range: 1-365)
    - symbol: str (optional, e.g., 'EURUSD')
    """
    try:
        days_back = request.args.get("days_back", default=30, type=int)
        symbol = request.args.get("symbol", default=None, type=str)
        
        if days_back < 1 or days_back > 365:
            return jsonify({
                "success": False,
                "error": "days_back must be between 1 and 365"
            }), 400
        
        result = mt5_client.get_trades(days_back=days_back, symbol=symbol)
        
        if not result["success"]:
            return jsonify(result), 500
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching trades: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/trades/<int:ticket>", methods=["GET"])
@require_connection
def get_trade_details(ticket):
    """Get specific trade details by ticket number"""
    try:
        result = mt5_client.get_trade_history_by_ticket(ticket)
        
        if not result["success"]:
            return jsonify(result), 404
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching trade: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# System endpoints
@app.route("/api/status", methods=["GET"])
def connection_status():
    """Get current connection status"""
    try:
        if not mt5_client.connected:
            return jsonify({
                "connected": False,
                "message": "Not connected to MetaTrader 5"
            }), 200
        
        account_result = mt5_client.get_account()
        if account_result["success"]:
            return jsonify({
                "connected": True,
                "message": "Connected to MetaTrader 5",
                "account": account_result.get("data")
            }), 200
        else:
            return jsonify({
                "connected": False,
                "message": "Connection lost"
            }), 200
    except Exception as e:
        logger.error(f"Error checking status: {str(e)}")
        return jsonify({
            "connected": False,
            "error": str(e)
        }), 200


# API documentation
@app.route("/api/docs", methods=["GET"])
def docs():
    """API documentation"""
    return jsonify({
        "title": "Trading Dashboard API",
        "version": "1.0.0",
        "description": "Backend API for MetaTrader 5 integration",
        "endpoints": {
            "Authentication": {
                "POST /api/connect": "Connect to MetaTrader 5",
                "POST /api/disconnect": "Disconnect from MetaTrader 5"
            },
            "Account": {
                "GET /api/account": "Get account balance and equity"
            },
            "Trading": {
                "GET /api/positions": "Get open positions",
                "GET /api/trades": "Get trade history",
                "GET /api/trades/<ticket>": "Get specific trade"
            },
            "System": {
                "GET /health": "Health check",
                "GET /api/status": "Connection status",
                "GET /api/docs": "This documentation"
            }
        }
    }), 200


# Root endpoint
@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    environment = os.getenv("ENVIRONMENT", "production")
    debug = environment == "development" and os.getenv("FLASK_DEBUG", "0") == "1"
    
    logger.info(f"Starting Flask server on {host}:{port} (environment={environment})")
    app.run(host=host, port=port, debug=debug)

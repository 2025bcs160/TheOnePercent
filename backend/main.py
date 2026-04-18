"""
FastAPI Backend for Trading Dashboard
Provides API endpoints for MetaTrader 5 integration
"""

import os
import logging
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from dotenv import load_dotenv

from mt5_client import mt5_client

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Request/Response Models
class LoginRequest(BaseModel):
    """Login credentials for MetaTrader 5"""
    login: int = Field(..., description="Account login ID")
    password: str = Field(..., description="Account password")
    server: str = Field(..., description="Server name (e.g., 'Exness-MT5Real')")

    class Config:
        example = {
            "login": 12345,
            "password": "your_password",
            "server": "Exness-MT5Real"
        }


class AccountResponse(BaseModel):
    """Account information response"""
    login: int
    balance: float
    equity: float
    credit: float
    profit: float
    margin_used: float
    margin_free: float
    margin_level: float
    currency: str
    server: str
    company: str


class TradeResponse(BaseModel):
    """Open trade/position response"""
    ticket: int
    symbol: str
    type: str
    volume: float
    open_price: float
    current_price: float
    sl: float
    tp: float
    profit: float
    open_time: str
    comment: str


class HistoryTradeResponse(BaseModel):
    """Historical trade response"""
    ticket: int
    symbol: str
    type: str
    volume: float
    open_price: float
    close_price: float
    sl: float
    tp: float
    profit: float
    open_time: str
    close_time: str
    comment: str
    duration_minutes: int


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: str


class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str


# Lifespan context manager for app startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Trading Dashboard Backend starting...")
    yield
    logger.info("Shutting down...")
    mt5_client.disconnect()


# Create FastAPI app
app = FastAPI(
    title="Trading Dashboard API",
    description="Backend API for MetaTrader 5 integration",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "connected": mt5_client.connected,
    }


# Authentication endpoints
@app.post("/connect", response_model=dict, tags=["Authentication"])
async def connect(credentials: LoginRequest):
    """
    Connect to MetaTrader 5 with provided credentials
    
    Returns:
        Connection status and account information
    """
    result = mt5_client.connect(
        login=credentials.login,
        password=credentials.password,
        server=credentials.server
    )
    
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Connection failed"))
    
    return result


@app.post("/disconnect", response_model=SuccessResponse, tags=["Authentication"])
async def disconnect():
    """Disconnect from MetaTrader 5"""
    if mt5_client.disconnect():
        return {"success": True, "message": "Disconnected from MetaTrader 5"}
    else:
        raise HTTPException(status_code=500, detail="Failed to disconnect")


# Account endpoints
@app.get("/account", response_model=dict, tags=["Account"])
async def get_account():
    """
    Get current account information
    
    Returns:
        Account balance, equity, margin information
    """
    if not mt5_client.connected:
        raise HTTPException(status_code=503, detail="Not connected to MetaTrader 5")
    
    result = mt5_client.get_account()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


# Trading endpoints
@app.get("/positions", response_model=dict, tags=["Trading"])
async def get_open_positions():
    """
    Get all open positions/trades
    
    Returns:
        List of open positions with ticket, symbol, profit, etc.
    """
    if not mt5_client.connected:
        raise HTTPException(status_code=503, detail="Not connected to MetaTrader 5")
    
    result = mt5_client.get_positions()
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


@app.get("/trades", response_model=dict, tags=["Trading"])
async def get_trade_history(days_back: int = 30, symbol: Optional[str] = None):
    """
    Get trade history
    
    Parameters:
        days_back: Number of days to fetch history for (default: 30)
        symbol: Optional symbol filter (e.g., 'EURUSD')
    
    Returns:
        List of closed trades with entry/exit prices and profit/loss
    """
    if not mt5_client.connected:
        raise HTTPException(status_code=503, detail="Not connected to MetaTrader 5")
    
    if days_back < 1 or days_back > 365:
        raise HTTPException(status_code=400, detail="days_back must be between 1 and 365")
    
    result = mt5_client.get_trades(days_back=days_back, symbol=symbol)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error"))
    
    return result


@app.get("/trades/{ticket}", response_model=dict, tags=["Trading"])
async def get_trade_details(ticket: int):
    """
    Get specific trade details by ticket number
    
    Parameters:
        ticket: Trade ticket number
    
    Returns:
        Detailed trade information
    """
    if not mt5_client.connected:
        raise HTTPException(status_code=503, detail="Not connected to MetaTrader 5")
    
    result = mt5_client.get_trade_history_by_ticket(ticket)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


@app.get("/status", tags=["System"])
async def connection_status():
    """Get current connection status"""
    if not mt5_client.connected:
        return {
            "connected": False,
            "message": "Not connected to MetaTrader 5"
        }
    
    account_result = mt5_client.get_account()
    if account_result["success"]:
        return {
            "connected": True,
            "message": "Connected to MetaTrader 5",
            "account": account_result.get("data")
        }
    else:
        return {
            "connected": False,
            "message": "Connection lost"
        }


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "success": False,
        "error": exc.detail,
        "status_code": exc.status_code
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT", "development") == "development",
    )

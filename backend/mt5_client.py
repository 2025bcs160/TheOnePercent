"""
MetaTrader 5 Client Module
Handles connection, authentication, and data fetching from MT5
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
try:
    import MetaTrader5 as mt5
except ImportError:
    mt5 = None

logger = logging.getLogger(__name__)


@dataclass
class AccountInfo:
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


@dataclass
class TradeInfo:
    """Individual trade/position information"""
    ticket: int
    symbol: str
    type: str  # BUY or SELL
    volume: float
    open_price: float
    current_price: float
    sl: float
    tp: float
    profit: float
    open_time: str
    comment: str


@dataclass
class HistoryTrade:
    """Historical trade information"""
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


class MT5Client:
    """Client for interacting with MetaTrader 5"""

    def __init__(self):
        self.connected = False
        self.account_info = None

    def connect(self, login: int, password: str, server: str) -> Dict[str, Any]:
        """
        Connect to MetaTrader 5
        
        Args:
            login: Account login ID
            password: Account password
            server: Server name (e.g., 'Exness-MT5Real')
            
        Returns:
            Dict with success status and connection info or error
        """
        try:
            if not mt5.initialize():
                error = mt5.last_error()
                logger.error(f"MT5 initialization failed: {error}")
                return {
                    "success": False,
                    "error": f"Failed to initialize MetaTrader 5: {error}",
                }

            # Attempt login
            if not mt5.login(login, password, server):
                error = mt5.last_error()
                logger.error(f"MT5 login failed: {error}")
                mt5.shutdown()
                return {
                    "success": False,
                    "error": f"Login failed: {error}. Check credentials and server name.",
                }

            self.connected = True
            self.account_info = self._get_account_info()
            logger.info(f"Successfully connected to MT5 - Login: {login}")
            
            return {
                "success": True,
                "message": "Connected to MetaTrader 5",
                "account": asdict(self.account_info),
            }

        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            return {
                "success": False,
                "error": f"Connection failed: {str(e)}",
            }

    def disconnect(self) -> bool:
        """Disconnect from MetaTrader 5"""
        if self.connected:
            try:
                mt5.shutdown()
                self.connected = False
                logger.info("Disconnected from MetaTrader 5")
                return True
            except Exception as e:
                logger.error(f"Disconnect error: {str(e)}")
                return False
        return True

    def _get_account_info(self) -> AccountInfo:
        """Get account information from MT5"""
        info = mt5.account_info()
        
        return AccountInfo(
            login=info.login,
            balance=float(info.balance),
            equity=float(info.equity),
            credit=float(info.credit),
            profit=float(info.profit),
            margin_used=float(info.margin),
            margin_free=float(info.margin_free),
            margin_level=float(info.margin_level) if info.margin_level > 0 else 0,
            currency=info.currency,
            server=info.server,
            company=info.company,
        )

    def get_account(self) -> Dict[str, Any]:
        """
        Get current account balance and equity
        
        Returns:
            Dict with account information or error
        """
        if not self.connected:
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        try:
            account_info = self._get_account_info()
            self.account_info = account_info
            return {
                "success": True,
                "data": asdict(account_info),
            }
        except Exception as e:
            logger.error(f"Error fetching account info: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_positions(self) -> Dict[str, Any]:
        """
        Get all open positions/trades
        
        Returns:
            Dict with list of open positions or error
        """
        if not self.connected:
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        try:
            positions = mt5.positions_get()
            
            if not positions:
                return {"success": True, "data": []}

            trades_list = []
            for pos in positions:
                trade = TradeInfo(
                    ticket=pos.ticket,
                    symbol=pos.symbol,
                    type="BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL",
                    volume=float(pos.volume),
                    open_price=float(pos.price_open),
                    current_price=float(pos.price_current),
                    sl=float(pos.sl),
                    tp=float(pos.tp),
                    profit=float(pos.profit),
                    open_time=datetime.fromtimestamp(pos.time).isoformat(),
                    comment=pos.comment,
                )
                trades_list.append(asdict(trade))

            logger.info(f"Fetched {len(trades_list)} open positions")
            return {"success": True, "data": trades_list}

        except Exception as e:
            logger.error(f"Error fetching positions: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_trades(
        self, days_back: int = 30, symbol: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get trade history
        
        Args:
            days_back: Number of days to fetch history for
            symbol: Optional symbol filter
            
        Returns:
            Dict with list of historical trades or error
        """
        if not self.connected:
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        try:
            from datetime import datetime, timedelta

            # Set date range
            end_time = datetime.now()
            start_time = end_time - timedelta(days=days_back)

            # Fetch deals (closed trades)
            if symbol:
                deals = mt5.history_deals_get(start_time, end_time, symbol=symbol)
            else:
                deals = mt5.history_deals_get(start_time, end_time)

            if not deals:
                return {"success": True, "data": []}

            trades_list = []
            for deal in deals:
                # Filter out non-trade deals (deposits, withdrawals, etc.)
                if deal.type not in [mt5.DEAL_TYPE_BUY, mt5.DEAL_TYPE_SELL]:
                    continue

                trade = HistoryTrade(
                    ticket=deal.ticket,
                    symbol=deal.symbol,
                    type="BUY" if deal.type == mt5.DEAL_TYPE_BUY else "SELL",
                    volume=float(deal.volume),
                    open_price=float(deal.price),
                    close_price=float(deal.price),  # For history, open and close are the same
                    sl=0,  # Historical deals don't have SL/TP
                    tp=0,
                    profit=float(deal.profit),
                    open_time=datetime.fromtimestamp(deal.time).isoformat(),
                    close_time=datetime.fromtimestamp(deal.time).isoformat(),
                    comment=deal.comment,
                    duration_minutes=0,
                )
                trades_list.append(asdict(trade))

            logger.info(f"Fetched {len(trades_list)} historical trades")
            return {"success": True, "data": trades_list}

        except Exception as e:
            logger.error(f"Error fetching trade history: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_trade_history_by_ticket(self, ticket: int) -> Dict[str, Any]:
        """
        Get specific trade details by ticket number
        
        Args:
            ticket: Trade ticket number
            
        Returns:
            Trade details or error
        """
        if not self.connected:
            return {"success": False, "error": "Not connected to MetaTrader 5"}

        try:
            deal = mt5.history_deals_get(ticket=ticket)
            
            if not deal:
                return {"success": False, "error": "Trade not found"}

            deal_info = deal[0]
            trade = HistoryTrade(
                ticket=deal_info.ticket,
                symbol=deal_info.symbol,
                type="BUY" if deal_info.type == mt5.DEAL_TYPE_BUY else "SELL",
                volume=float(deal_info.volume),
                open_price=float(deal_info.price),
                close_price=float(deal_info.price),
                sl=0,
                tp=0,
                profit=float(deal_info.profit),
                open_time=datetime.fromtimestamp(deal_info.time).isoformat(),
                close_time=datetime.fromtimestamp(deal_info.time).isoformat(),
                comment=deal_info.comment,
                duration_minutes=0,
            )
            
            return {"success": True, "data": asdict(trade)}

        except Exception as e:
            logger.error(f"Error fetching trade: {str(e)}")
            return {"success": False, "error": str(e)}


# Global client instance
mt5_client = MT5Client()

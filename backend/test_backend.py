#!/usr/bin/env python
"""
Backend Testing Script
Test MetaTrader 5 integration and API endpoints
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
API_URL = "http://localhost:8000"
TEST_LOGIN = None
TEST_PASSWORD = None
TEST_SERVER = None

# Colors for console output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def print_section(title):
    """Print a section header"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{Colors.END}\n")


def print_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")


def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}❌ {message}{Colors.END}")


def print_warning(message):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")


def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")


def make_request(method: str, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Make HTTP request to backend"""
    url = f"{API_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        return response.json()
    
    except requests.exceptions.ConnectionError:
        print_error(f"Connection failed. Is the backend running at {API_URL}?")
        return None
    except requests.exceptions.Timeout:
        print_error("Request timeout")
        return None
    except Exception as e:
        print_error(f"Request error: {str(e)}")
        return None


def test_health_check():
    """Test health check endpoint"""
    print_section("1. Health Check")
    
    result = make_request("GET", "/health")
    
    if result:
        print_success("Health check endpoint works")
        print_info(f"Status: {result.get('status')}")
        print_info(f"Connected: {result.get('connected')}")
        return True
    else:
        print_error("Health check failed")
        return False


def test_connection(login: int, password: str, server: str):
    """Test MT5 connection"""
    print_section("2. MT5 Connection")
    
    print_info(f"Attempting to connect with:")
    print_info(f"  Login: {login}")
    print_info(f"  Server: {server}")
    print_info(f"  Password: {'*' * len(password)}")
    
    result = make_request("POST", "/connect", {
        "login": login,
        "password": password,
        "server": server
    })
    
    if result and result.get("success"):
        print_success("Connected to MetaTrader 5")
        account = result.get("account", {})
        print_info(f"Account: {account.get('login')}")
        print_info(f"Balance: ${account.get('balance', 0):.2f}")
        print_info(f"Equity: ${account.get('equity', 0):.2f}")
        return True
    else:
        error = result.get("error") if result else "Unknown error"
        print_error(f"Connection failed: {error}")
        return False


def test_account():
    """Test account endpoint"""
    print_section("3. Account Information")
    
    result = make_request("GET", "/account")
    
    if result and result.get("success"):
        print_success("Account data retrieved")
        account = result.get("data", {})
        print_info(f"Login: {account.get('login')}")
        print_info(f"Balance: ${account.get('balance', 0):.2f}")
        print_info(f"Equity: ${account.get('equity', 0):.2f}")
        print_info(f"Free Margin: ${account.get('margin_free', 0):.2f}")
        print_info(f"Used Margin: ${account.get('margin_used', 0):.2f}")
        print_info(f"Margin Level: {account.get('margin_level', 0):.2f}%")
        return True
    else:
        error = result.get("error") if result else "Unknown error"
        print_error(f"Failed to get account info: {error}")
        return False


def test_positions():
    """Test positions endpoint"""
    print_section("4. Open Positions")
    
    result = make_request("GET", "/positions")
    
    if result and result.get("success"):
        positions = result.get("data", [])
        
        if positions:
            print_success(f"Retrieved {len(positions)} open position(s)")
            for i, pos in enumerate(positions, 1):
                print(f"\n   Position {i}:")
                print(f"   Ticket: {pos.get('ticket')}")
                print(f"   Symbol: {pos.get('symbol')}")
                print(f"   Type: {pos.get('type')}")
                print(f"   Volume: {pos.get('volume')}")
                print(f"   Entry: ${pos.get('open_price'):.5f}")
                print(f"   Current: ${pos.get('current_price'):.5f}")
                profit = pos.get('profit', 0)
                status = Colors.GREEN if profit >= 0 else Colors.RED
                print(f"   P/L: {status}${profit:.2f}{Colors.END}")
        else:
            print_warning("No open positions")
        
        return True
    else:
        error = result.get("error") if result else "Unknown error"
        print_error(f"Failed to get positions: {error}")
        return False


def test_trades(days: int = 7):
    """Test trades endpoint"""
    print_section(f"5. Trade History (Last {days} Days)")
    
    result = make_request("GET", f"/trades?days_back={days}")
    
    if result and result.get("success"):
        trades = result.get("data", [])
        
        if trades:
            print_success(f"Retrieved {len(trades)} trade(s)")
            
            # Summary stats
            total_profit = sum(t.get("profit", 0) for t in trades)
            wins = sum(1 for t in trades if t.get("profit", 0) > 0)
            losses = sum(1 for t in trades if t.get("profit", 0) < 0)
            
            print(f"\n   Summary:")
            print(f"   Total P/L: ${total_profit:.2f}")
            print(f"   Wins: {wins}")
            print(f"   Losses: {losses}")
            if wins + losses > 0:
                win_rate = (wins / (wins + losses)) * 100
                print(f"   Win Rate: {win_rate:.1f}%")
            
            # Show recent trades
            print(f"\n   Recent Trades (showing first 3):")
            for i, trade in enumerate(trades[:3], 1):
                print(f"\n   Trade {i}:")
                print(f"   Symbol: {trade.get('symbol')}")
                print(f"   Type: {trade.get('type')}")
                print(f"   Entry: ${trade.get('open_price'):.5f}")
                print(f"   Exit: ${trade.get('close_price'):.5f}")
                profit = trade.get('profit', 0)
                status = Colors.GREEN if profit >= 0 else Colors.RED
                print(f"   P/L: {status}${profit:.2f}{Colors.END}")
        else:
            print_warning(f"No trades found in the last {days} days")
        
        return True
    else:
        error = result.get("error") if result else "Unknown error"
        print_error(f"Failed to get trade history: {error}")
        return False


def test_status():
    """Test status endpoint"""
    print_section("6. Connection Status")
    
    result = make_request("GET", "/status")
    
    if result:
        connected = result.get("connected", False)
        status = Colors.GREEN + "Connected" if connected else Colors.RED + "Disconnected"
        print_info(f"Status: {status}{Colors.END}")
        
        account = result.get("account")
        if account:
            print_info(f"Account: {account.get('login')}")
            print_info(f"Balance: ${account.get('balance', 0):.2f}")
        
        return True
    else:
        print_error("Failed to get status")
        return False


def test_disconnect():
    """Test disconnect endpoint"""
    print_section("7. Disconnect")
    
    result = make_request("POST", "/disconnect")
    
    if result and result.get("success"):
        print_success("Disconnected from MetaTrader 5")
        return True
    else:
        error = result.get("error") if result else "Unknown error"
        print_error(f"Failed to disconnect: {error}")
        return False


def main():
    """Run all tests"""
    print(f"\n{'='*60}")
    print("Trading Dashboard Backend Testing")
    print(f"{'='*60}")
    print(f"API URL: {API_URL}")
    
    # Check if backend is running
    print("\nChecking backend connection...")
    try:
        requests.get(f"{API_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to backend at {API_URL}")
        print("Please start the backend with: python main.py")
        return
    
    print_success("Backend is running")
    
    # Run tests
    tests_passed = 0
    tests_total = 0
    
    # Health check
    tests_total += 1
    if test_health_check():
        tests_passed += 1
    
    # Connection test (requires credentials)
    print_section("Testing With MetaTrader 5")
    
    if TEST_LOGIN and TEST_PASSWORD and TEST_SERVER:
        tests_total += 1
        if test_connection(TEST_LOGIN, TEST_PASSWORD, TEST_SERVER):
            tests_passed += 1
            
            # Only run these if connection succeeds
            tests_total += 1
            if test_account():
                tests_passed += 1
            
            tests_total += 1
            if test_positions():
                tests_passed += 1
            
            tests_total += 1
            if test_trades():
                tests_passed += 1
            
            tests_total += 1
            if test_status():
                tests_passed += 1
            
            # Cleanup
            tests_total += 1
            if test_disconnect():
                tests_passed += 1
        else:
            print_warning("Skipping remaining tests - connection failed")
            print_info("Configure TEST_LOGIN, TEST_PASSWORD, and TEST_SERVER in this script to test MT5 integration")
    else:
        print_warning("MT5 credentials not configured")
        print_info("To test MT5 integration, edit this script and set:")
        print_info("  TEST_LOGIN = your_login_id")
        print_info("  TEST_PASSWORD = 'your_password'")
        print_info("  TEST_SERVER = 'Server-Name'")
    
    # Results
    print_section("Test Results")
    print_info(f"Passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print_success("All tests passed!")
    else:
        print_warning(f"{tests_total - tests_passed} test(s) failed")
    
    print()


if __name__ == "__main__":
    main()

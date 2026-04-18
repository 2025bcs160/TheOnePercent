#!/usr/bin/env python
"""
Quick setup script for the backend
Installs dependencies and initializes the backend
"""

import os
import sys
import subprocess

def run_command(cmd, description):
    """Run a shell command"""
    print(f"\n📦 {description}...")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"❌ Failed to {description.lower()}")
        return False
    print(f"✅ {description} completed")
    return True


def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║   Trading Dashboard Backend Setup                        ║
║   MetaTrader 5 Integration                               ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Install dependencies
    if not run_command(
        "pip install -r requirements.txt",
        "Installing dependencies"
    ):
        return False
    
    # Create .env file if it doesn't exist
    if not os.path.exists(".env"):
        print("\n📝 Creating .env file from template...")
        if os.path.exists(".env.example"):
            with open(".env.example", "r") as src:
                with open(".env", "w") as dst:
                    dst.write(src.read())
            print("✅ .env file created")
            print("   Please edit .env with your MetaTrader 5 credentials")
        else:
            print("⚠️  .env.example not found")
    else:
        print("✅ .env file already exists")
    
    print("""
╔══════════════════════════════════════════════════════════╗
║   Setup Complete!                                        ║
╚══════════════════════════════════════════════════════════╝

Next steps:

1. Configure your MetaTrader 5 credentials in .env:
   nano .env   (or use your editor of choice)

2. Start the backend:
   
   FastAPI (recommended):
   python main.py
   
   Flask (alternative):
   python app_flask.py

3. Access the API:
   FastAPI Docs: http://localhost:8000/docs
   Flask Docs: http://localhost:8000/api/docs

4. Test the connection:
   curl -X POST http://localhost:8000/connect \\
     -H "Content-Type: application/json" \\
     -d '{"login": 12345, "password": "pass", "server": "Server"}'

For more information, see README.md
    """)
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

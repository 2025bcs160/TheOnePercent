"""
Minimal Flask app for Railway deployment
"""
import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({"status": "ok"}), 200

@app.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting app on port {port}")
    app.run(host="0.0.0.0", port=port)
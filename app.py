"""
Minimal Flask app for Railway deployment
"""
import os
from flask import Flask, jsonify

application = Flask(__name__)

@application.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({"status": "ok"}), 200

@application.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
"""
Configuration module for the backend
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration"""
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # MetaTrader 5
    MT5_LOGIN = os.getenv("MT5_LOGIN")
    MT5_PASSWORD = os.getenv("MT5_PASSWORD")
    MT5_SERVER = os.getenv("MT5_SERVER")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True


def get_config():
    """Get configuration based on environment"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        return ProductionConfig()
    elif environment == "testing":
        return TestingConfig()
    else:
        return DevelopmentConfig()

"""
BharatBit OTC Desk API - Production Server
==========================================

A premium Over-the-Counter crypto trading desk for high-net-worth Indian clients.
"""

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging
import os

from core.database import close_db
from routers import (
    auth_router,
    users_router,
    admin_router,
    orders_router,
    wallets_router,
    wallet_alias_router,
    kyc_router,
    rates_router,
    crypto_router,
    notifications_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(
    title="BharatBit OTC Desk API",
    description="Premium OTC crypto trading desk for high-net-worth Indian clients",
    version="2.0.0"
)

# CORS - Add FIRST before any routes
# Allow all origins for production (or specify exact domains)
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins != "*":
    origins_list = [origin.strip() for origin in cors_origins.split(",")]
else:
    origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Create main API router with /api prefix
api_router = APIRouter(prefix="/api")

# Include all modular routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
api_router.include_router(orders_router)
api_router.include_router(wallets_router)
api_router.include_router(wallet_alias_router)
api_router.include_router(kyc_router)
api_router.include_router(rates_router)
api_router.include_router(crypto_router)
api_router.include_router(notifications_router)

# Payment routes
@api_router.get("/payment/bank-details")
async def get_bank_details():
    return {
        "account_name": "G.F.T. INVESTMENTS PRIVATE LIMITED",
        "account_number": "3458 0500 0533",
        "ifsc_code": "ICIC0003458",
        "bank_name": "ICICI Bank",
        "branch": "BALEWADI PUNE 411045"
    }

@api_router.get("/payment/upi-details")
async def get_upi_details():
    return {
        "upi_id": None,
        "merchant_name": None,
        "message": "UPI payments temporarily unavailable"
    }

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

# Include the main router
app.include_router(api_router)

# Root route
@app.get("/")
async def root():
    return {
        "name": "BharatBit OTC Desk API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()

@app.on_event("startup")
async def startup():
    logger.info("BharatBit OTC Desk API v2.0.0 - Server started")
    logger.info("CORS Origins: " + str(origins_list))

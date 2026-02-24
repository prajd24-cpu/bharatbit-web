"""
BharatBit OTC Desk API - Refactored Modular Server
===================================================

A premium Over-the-Counter crypto trading desk for high-net-worth Indian clients.

Architecture:
- /core: Configuration, database, dependencies
- /models: Pydantic schemas and data models  
- /routers: API route handlers (auth, admin, orders, wallets, kyc, rates, crypto)
- /services: External integrations (email, sms, push, crypto prices)
"""

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging

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

# Payment routes (for backwards compatibility)
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

# Root route - returns API info
@app.get("/")
async def root():
    return {
        "name": "BharatBit OTC Desk API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()

# Startup message
@app.on_event("startup")
async def startup():
    logger.info("BharatBit OTC Desk API v2.0.0 - Server started")
    logger.info("Modular architecture enabled with separate routers")

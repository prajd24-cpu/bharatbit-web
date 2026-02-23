from fastapi import APIRouter, Depends, Query
from typing import List, Optional
import logging

from core.dependencies import get_current_user
from services.crypto_price_service import (
    get_crypto_prices, 
    get_price_history,
    get_market_overview,
    CRYPTO_IDS
)

router = APIRouter(prefix="/crypto", tags=["Crypto Prices"])
logger = logging.getLogger(__name__)

@router.get("/prices")
async def get_live_prices(
    symbols: Optional[str] = Query(None, description="Comma-separated symbols like BTC,ETH,USDT"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get live crypto prices from CoinGecko
    
    Returns prices in USD and INR with 24h change percentage
    """
    symbol_list = symbols.split(",") if symbols else None
    prices = await get_crypto_prices(symbol_list)
    
    return {
        "success": True,
        "prices": prices,
        "supported_symbols": list(CRYPTO_IDS.keys())
    }

@router.get("/prices/{symbol}/history")
async def get_symbol_history(
    symbol: str,
    days: int = Query(7, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """
    Get historical price data for charts
    
    - symbol: Crypto symbol (BTC, ETH, etc.)
    - days: Number of days of history (1-365)
    """
    if symbol.upper() not in CRYPTO_IDS:
        return {
            "success": False,
            "error": f"Symbol {symbol} not supported",
            "supported_symbols": list(CRYPTO_IDS.keys())
        }
    
    history = await get_price_history(symbol.upper(), days)
    
    return {
        "success": True,
        "symbol": symbol.upper(),
        "days": days,
        "data": history,
        "chart_config": {
            "x_axis": "date" if days > 1 else "time",
            "y_axis": "price",
            "currency": "INR"
        }
    }

@router.get("/market")
async def get_market_stats(current_user: dict = Depends(get_current_user)):
    """
    Get overall crypto market statistics
    """
    overview = await get_market_overview()
    
    return {
        "success": True,
        "market": overview
    }

@router.get("/supported")
async def get_supported_cryptos():
    """
    Get list of supported cryptocurrencies
    """
    return {
        "success": True,
        "symbols": list(CRYPTO_IDS.keys()),
        "details": [
            {"symbol": symbol, "name": crypto_id.replace("-", " ").title()}
            for symbol, crypto_id in CRYPTO_IDS.items()
        ]
    }

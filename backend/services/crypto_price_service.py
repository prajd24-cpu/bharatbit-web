import httpx
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

# CoinGecko API (free tier, no key needed)
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Cache for price data
_price_cache: Dict[str, Dict] = {}
_cache_ttl = timedelta(minutes=1)
_last_update: Optional[datetime] = None

# Crypto ID mapping for CoinGecko
CRYPTO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "USDT": "tether",
    "USDC": "usd-coin",
    "BNB": "binancecoin",
    "XRP": "ripple",
    "SOL": "solana",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "MATIC": "matic-network"
}

async def get_crypto_prices(symbols: List[str] = None) -> Dict[str, Dict]:
    """
    Fetch live crypto prices from CoinGecko
    
    Returns dict with price data for each symbol:
    {
        "BTC": {
            "usd": 45000,
            "inr": 3750000,
            "usd_24h_change": 2.5,
            "inr_24h_change": 2.3,
            "last_updated": "2024-01-01T00:00:00Z"
        }
    }
    """
    global _price_cache, _last_update
    
    # Check cache
    if _last_update and datetime.utcnow() - _last_update < _cache_ttl:
        if symbols:
            return {s: _price_cache.get(s, {}) for s in symbols if s in _price_cache}
        return _price_cache
    
    # Determine which cryptos to fetch
    if symbols:
        ids = [CRYPTO_IDS[s] for s in symbols if s in CRYPTO_IDS]
    else:
        ids = list(CRYPTO_IDS.values())
    
    if not ids:
        return {}
    
    try:
        ids_str = ",".join(ids)
        url = f"{COINGECKO_API}/simple/price"
        params = {
            "ids": ids_str,
            "vs_currencies": "usd,inr",
            "include_24hr_change": "true",
            "include_last_updated_at": "true"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
        if response.status_code == 200:
            data = response.json()
            
            # Transform response to our format
            result = {}
            id_to_symbol = {v: k for k, v in CRYPTO_IDS.items()}
            
            for crypto_id, prices in data.items():
                symbol = id_to_symbol.get(crypto_id)
                if symbol:
                    result[symbol] = {
                        "usd": prices.get("usd", 0),
                        "inr": prices.get("inr", 0),
                        "usd_24h_change": prices.get("usd_24h_change", 0),
                        "inr_24h_change": prices.get("inr_24h_change", 0),
                        "last_updated": datetime.utcnow().isoformat()
                    }
            
            # Update cache
            _price_cache = result
            _last_update = datetime.utcnow()
            
            logger.info(f"Fetched prices for {len(result)} cryptos")
            return result
        else:
            logger.error(f"CoinGecko API error: {response.status_code}")
            return _price_cache  # Return cached data on error
            
    except Exception as e:
        logger.error(f"Error fetching crypto prices: {str(e)}")
        return _price_cache  # Return cached data on error


async def get_price_history(symbol: str, days: int = 7) -> List[Dict]:
    """
    Fetch historical price data for charts
    
    Returns list of price points:
    [
        {"timestamp": 1234567890, "price": 45000, "date": "2024-01-01"},
        ...
    ]
    """
    crypto_id = CRYPTO_IDS.get(symbol)
    if not crypto_id:
        return []
    
    try:
        url = f"{COINGECKO_API}/coins/{crypto_id}/market_chart"
        params = {
            "vs_currency": "inr",
            "days": str(days),
            "interval": "daily" if days > 1 else "hourly"
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            prices = data.get("prices", [])
            
            result = []
            for timestamp, price in prices:
                dt = datetime.fromtimestamp(timestamp / 1000)
                result.append({
                    "timestamp": timestamp,
                    "price": price,
                    "date": dt.strftime("%Y-%m-%d"),
                    "time": dt.strftime("%H:%M")
                })
            
            return result
        else:
            logger.error(f"CoinGecko history API error: {response.status_code}")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching price history: {str(e)}")
        return []


async def get_market_overview() -> Dict:
    """
    Get overall market statistics
    """
    try:
        url = f"{COINGECKO_API}/global"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
        
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "total_market_cap": data.get("total_market_cap", {}).get("inr", 0),
                "total_volume_24h": data.get("total_volume", {}).get("inr", 0),
                "market_cap_percentage": data.get("market_cap_percentage", {}),
                "market_cap_change_24h": data.get("market_cap_change_percentage_24h_usd", 0),
                "active_cryptocurrencies": data.get("active_cryptocurrencies", 0)
            }
        return {}
        
    except Exception as e:
        logger.error(f"Error fetching market overview: {str(e)}")
        return {}

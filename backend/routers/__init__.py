from .auth import router as auth_router
from .admin import router as admin_router
from .orders import router as orders_router
from .wallets import router as wallets_router, wallet_alias_router
from .kyc import router as kyc_router
from .rates import router as rates_router
from .crypto import router as crypto_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "admin_router", 
    "orders_router",
    "wallets_router",
    "wallet_alias_router",
    "kyc_router",
    "rates_router",
    "crypto_router",
    "notifications_router"
]

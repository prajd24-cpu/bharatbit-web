from fastapi import APIRouter, Depends
import logging

from core.database import db
from core.dependencies import get_current_user

router = APIRouter(prefix="/rates", tags=["Rates"])
logger = logging.getLogger(__name__)

@router.get("")
async def get_rates(current_user: dict = Depends(get_current_user)):
    """Get asset rates, prioritizing user-specific rates"""
    rates = await db.asset_rates.find({
        "$or": [
            {"user_specific": current_user["id"]},
            {"user_specific": None}
        ]
    }).to_list(100)
    
    rate_map = {}
    for rate in rates:
        rate.pop("_id", None)
        asset = rate["asset"]
        if rate.get("user_specific") == current_user["id"]:
            rate_map[asset] = rate
        elif asset not in rate_map:
            rate_map[asset] = rate
    
    return list(rate_map.values())

@router.get("/payment/bank-details")
async def get_bank_details():
    """Get bank details for payments"""
    return {
        "account_name": "BharatBit Technologies Pvt Ltd",
        "account_number": "XXXXXXXXXXXX",
        "ifsc_code": "HDFC0001234",
        "bank_name": "HDFC Bank",
        "branch": "Mumbai Main Branch"
    }

@router.get("/payment/upi-details")
async def get_upi_details():
    """Get UPI details for payments"""
    return {
        "upi_id": "bharatbit@hdfc",
        "merchant_name": "BharatBit OTC"
    }

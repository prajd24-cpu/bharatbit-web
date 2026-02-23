from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import logging

from core.database import db
from core.dependencies import get_current_user
from models import (
    SavedWallet, SaveWalletRequest, WalletVerificationStatus
)

router = APIRouter(prefix="/wallets", tags=["Wallets"])
logger = logging.getLogger(__name__)

@router.post("/save")
async def save_wallet(data: SaveWalletRequest, current_user: dict = Depends(get_current_user)):
    existing = await db.saved_wallets.find_one({
        "user_id": current_user["id"],
        "wallet_address": data.wallet_address
    })
    if existing:
        raise HTTPException(status_code=400, detail="Wallet address already saved")
    
    wallet = SavedWallet(
        user_id=current_user["id"],
        asset=data.asset,
        network=data.network,
        wallet_address=data.wallet_address,
        label=data.label,
        proof_image=data.proof_image
    )
    await db.saved_wallets.insert_one(wallet.dict())
    
    return {
        "success": True,
        "wallet": {
            "id": wallet.id,
            "asset": wallet.asset,
            "network": wallet.network,
            "wallet_address": wallet.wallet_address,
            "label": wallet.label,
            "verification_status": wallet.verification_status.value
        }
    }

@router.get("/my-wallets")
async def get_my_wallets(current_user: dict = Depends(get_current_user)):
    wallets = await db.saved_wallets.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    for wallet in wallets:
        wallet.pop("_id", None)
    return wallets

@router.get("/verified")
async def get_verified_wallets(current_user: dict = Depends(get_current_user)):
    wallets = await db.saved_wallets.find({
        "user_id": current_user["id"],
        "verification_status": "verified"
    }).to_list(100)
    for wallet in wallets:
        wallet.pop("_id", None)
    return wallets

@router.get("/{wallet_id}")
async def get_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    wallet.pop("_id", None)
    return wallet

@router.put("/{wallet_id}/set-primary")
async def set_primary_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet.get("verification_status") != "verified":
        raise HTTPException(status_code=400, detail="Only verified wallets can be set as primary")
    
    await db.saved_wallets.update_many(
        {"user_id": current_user["id"], "asset": wallet["asset"]},
        {"$set": {"is_primary": False}}
    )
    
    await db.saved_wallets.update_one(
        {"id": wallet_id},
        {"$set": {"is_primary": True}}
    )
    
    return {"success": True, "message": "Primary wallet updated"}

@router.delete("/{wallet_id}")
async def delete_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    await db.saved_wallets.delete_one({"id": wallet_id})
    return {"success": True, "message": "Wallet deleted"}

# Ledger routes
@router.get("/balance")
async def get_wallet_balance(current_user: dict = Depends(get_current_user)):
    ledger_entries = await db.wallet_ledger.find({"user_id": current_user["id"]}).to_list(1000)
    
    balances = {}
    for entry in ledger_entries:
        asset = entry["asset"]
        if asset not in balances:
            balances[asset] = 0
        
        if entry["transaction_type"] == "credit":
            balances[asset] += entry["amount"]
        else:
            balances[asset] -= entry["amount"]
    
    return [{"asset": k, "balance": v} for k, v in balances.items()]

@router.get("/ledger")
async def get_wallet_ledger(current_user: dict = Depends(get_current_user)):
    entries = await db.wallet_ledger.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    for entry in entries:
        entry.pop("_id", None)
    return entries

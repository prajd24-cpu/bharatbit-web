from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import logging

from core.database import db
from core.dependencies import get_admin_user
from models import (
    KYCStatus, OrderStatus, UserRole, TransactionType,
    AdminKYCActionRequest, AdminOrderUpdateRequest, AdminRateUpdateRequest,
    ManualLedgerEntryRequest, AssignRMRequest, AdminWalletActionRequest,
    AssetRate, WalletLedger, User
)
from services.push_service import notify_kyc_approved, notify_kyc_rejected, notify_order_status_update

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

@router.get("/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({"role": "user"}, {"password_hash": 0}).to_list(100)
    for user in users:
        user.pop("_id", None)
    return users

@router.get("/kyc-pending")
async def admin_get_pending_kyc(admin: dict = Depends(get_admin_user)):
    kyc_docs = await db.kyc_documents.find({"status": {"$in": ["pending", "under_review"]}}).to_list(100)
    
    user_ids = list(set(doc["user_id"] for doc in kyc_docs if doc.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    for doc in kyc_docs:
        doc.pop("_id", None)
        user = user_map.get(doc.get("user_id"))
        if user:
            doc["user_email"] = user["email"]
            doc["user_mobile"] = user["mobile"]
    
    return kyc_docs

@router.get("/kyc/{kyc_id}")
async def admin_get_kyc_detail(kyc_id: str, admin: dict = Depends(get_admin_user)):
    kyc_doc = await db.kyc_documents.find_one({"id": kyc_id})
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    user = await db.users.find_one({"id": kyc_doc["user_id"]})
    kyc_doc.pop("_id", None)
    if user:
        user.pop("_id", None)
        user.pop("password_hash", None)
    kyc_doc["user"] = user
    
    return kyc_doc

@router.post("/kyc/action")
async def admin_kyc_action(data: AdminKYCActionRequest, admin: dict = Depends(get_admin_user)):
    kyc_doc = await db.kyc_documents.find_one({"id": data.kyc_id})
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    new_status = KYCStatus.APPROVED if data.action == "approve" else KYCStatus.REJECTED
    
    await db.kyc_documents.update_one(
        {"id": data.kyc_id},
        {"$set": {
            "status": new_status,
            "reviewed_at": datetime.utcnow(),
            "reviewed_by": admin["id"],
            "rejection_reason": data.rejection_reason
        }}
    )
    
    await db.users.update_one(
        {"id": kyc_doc["user_id"]},
        {"$set": {"kyc_status": new_status}}
    )
    
    # Send push notification
    user = await db.users.find_one({"id": kyc_doc["user_id"]})
    if user and user.get("push_token"):
        push_tokens = [user["push_token"]]
        if data.action == "approve":
            await notify_kyc_approved(push_tokens, user.get("email", "User"))
        else:
            await notify_kyc_rejected(push_tokens, data.rejection_reason or "")
    
    return {"success": True, "message": f"KYC {data.action}d successfully"}

@router.get("/wallets/pending")
async def admin_get_pending_wallets(admin: dict = Depends(get_admin_user)):
    wallets = await db.saved_wallets.find({"verification_status": "pending"}).sort("created_at", -1).to_list(100)
    
    user_ids = list(set(w["user_id"] for w in wallets if w.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    for wallet in wallets:
        wallet.pop("_id", None)
        user = user_map.get(wallet.get("user_id"))
        if user:
            wallet["user_email"] = user["email"]
            wallet["user_mobile"] = user["mobile"]
    
    return wallets

@router.get("/wallets/all")
async def admin_get_all_wallets(admin: dict = Depends(get_admin_user)):
    wallets = await db.saved_wallets.find().sort("created_at", -1).to_list(100)
    
    user_ids = list(set(w["user_id"] for w in wallets if w.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    for wallet in wallets:
        wallet.pop("_id", None)
        user = user_map.get(wallet.get("user_id"))
        if user:
            wallet["user_email"] = user["email"]
            wallet["user_mobile"] = user["mobile"]
    
    return wallets

@router.get("/wallets/{wallet_id}")
async def admin_get_wallet_detail(wallet_id: str, admin: dict = Depends(get_admin_user)):
    wallet = await db.saved_wallets.find_one({"id": wallet_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    wallet.pop("_id", None)
    user = await db.users.find_one({"id": wallet["user_id"]})
    if user:
        user.pop("_id", None)
        user.pop("password_hash", None)
    wallet["user"] = user
    
    return wallet

@router.post("/wallets/action")
async def admin_wallet_action(data: AdminWalletActionRequest, admin: dict = Depends(get_admin_user)):
    wallet = await db.saved_wallets.find_one({"id": data.wallet_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    new_status = "verified" if data.action == "approve" else "rejected"
    
    await db.saved_wallets.update_one(
        {"id": data.wallet_id},
        {"$set": {
            "verification_status": new_status,
            "admin_notes": data.notes,
            "verified_by": admin["id"],
            "verified_at": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": f"Wallet {data.action}d successfully"}

@router.get("/orders")
async def admin_get_orders(admin: dict = Depends(get_admin_user)):
    orders = await db.orders.find().sort("created_at", -1).to_list(100)
    
    user_ids = list(set(o["user_id"] for o in orders if o.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    for order in orders:
        order.pop("_id", None)
        user = user_map.get(order.get("user_id"))
        if user:
            order["user_email"] = user["email"]
            order["user_mobile"] = user["mobile"]
    
    return orders

@router.put("/orders/update")
async def admin_update_order(data: AdminOrderUpdateRequest, admin: dict = Depends(get_admin_user)):
    order = await db.orders.find_one({"id": data.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {
        "status": data.status,
        "updated_at": datetime.utcnow()
    }
    if data.notes:
        update_data["notes"] = data.notes
    
    await db.orders.update_one({"id": data.order_id}, {"$set": update_data})
    
    # Send push notification for order update
    user = await db.users.find_one({"id": order["user_id"]})
    if user and user.get("push_token"):
        await notify_order_status_update(
            [user["push_token"]],
            data.order_id[:8],
            data.status.value,
            order.get("asset", ""),
            order.get("quantity", 0)
        )
    
    # Handle ledger entries for completed orders
    if data.status == OrderStatus.COMPLETED:
        existing_ledger = await db.wallet_ledger.find_one({"order_id": data.order_id})
        if not existing_ledger:
            ledger = WalletLedger(
                user_id=order["user_id"],
                asset=order["asset"],
                transaction_type=TransactionType.CREDIT if order["order_type"] == "buy" else TransactionType.DEBIT,
                amount=order["quantity"],
                description=f"Order {data.order_id[:8]} completed",
                order_id=data.order_id
            )
            await db.wallet_ledger.insert_one(ledger.dict())
    
    return {"success": True, "message": "Order updated successfully"}

@router.post("/rates/update")
async def admin_update_rate(data: AdminRateUpdateRequest, admin: dict = Depends(get_admin_user)):
    rate = AssetRate(
        asset=data.asset,
        buy_rate=data.buy_rate,
        sell_rate=data.sell_rate,
        updated_by=admin["id"],
        user_specific=data.user_specific
    )
    
    filter_query = {"asset": data.asset}
    if data.user_specific:
        filter_query["user_specific"] = data.user_specific
    else:
        filter_query["user_specific"] = None
    
    await db.asset_rates.update_one(filter_query, {"$set": rate.dict()}, upsert=True)
    
    return {"success": True, "message": "Rate updated successfully"}

@router.get("/rates")
async def admin_get_rates(admin: dict = Depends(get_admin_user)):
    rates = await db.asset_rates.find().to_list(100)
    for rate in rates:
        rate.pop("_id", None)
    return rates

@router.post("/ledger/manual-entry")
async def admin_manual_ledger_entry(data: ManualLedgerEntryRequest, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    ledger = WalletLedger(
        user_id=data.user_id,
        asset=data.asset,
        transaction_type=data.transaction_type,
        amount=data.amount,
        description=f"[Admin] {data.description}"
    )
    await db.wallet_ledger.insert_one(ledger.dict())
    
    return {"success": True, "message": "Ledger entry created"}

@router.put("/users/{user_id}/freeze")
async def admin_freeze_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"is_frozen": True}})
    return {"success": True, "message": "User frozen"}

@router.put("/users/{user_id}/assign-rm")
async def admin_assign_rm(user_id: str, data: AssignRMRequest, admin: dict = Depends(get_admin_user)):
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "relationship_manager": data.rm_name,
            "rm_phone": data.rm_phone,
            "rm_whatsapp": data.rm_whatsapp
        }}
    )
    return {"success": True, "message": "RM assigned successfully"}

@router.get("/analytics")
async def admin_get_analytics(admin: dict = Depends(get_admin_user)):
    """Enhanced analytics with charts data"""
    
    # Basic counts
    total_users = await db.users.count_documents({"role": "user"})
    verified_users = await db.users.count_documents({"role": "user", "kyc_status": "approved"})
    pending_kyc = await db.kyc_documents.count_documents({"status": {"$in": ["pending", "under_review"]}})
    total_orders = await db.orders.count_documents({})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    pending_orders = await db.orders.count_documents({"status": {"$in": ["awaiting_payment", "processing"]}})
    pending_wallets = await db.saved_wallets.count_documents({"verification_status": "pending"})
    
    # Volume calculations
    orders = await db.orders.find({"status": "completed"}).to_list(1000)
    total_buy_volume = sum(o.get("total_inr", 0) for o in orders if o.get("order_type") == "buy")
    total_sell_volume = sum(o.get("total_inr", 0) for o in orders if o.get("order_type") == "sell")
    
    # Orders by asset
    asset_breakdown = {}
    for order in orders:
        asset = order.get("asset", "Unknown")
        if asset not in asset_breakdown:
            asset_breakdown[asset] = {"count": 0, "volume": 0}
        asset_breakdown[asset]["count"] += 1
        asset_breakdown[asset]["volume"] += order.get("total_inr", 0)
    
    # Daily orders (last 7 days)
    daily_orders = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        
        count = await db.orders.count_documents({
            "created_at": {"$gte": start, "$lt": end}
        })
        volume = 0
        day_orders = await db.orders.find({
            "created_at": {"$gte": start, "$lt": end},
            "status": "completed"
        }).to_list(1000)
        volume = sum(o.get("total_inr", 0) for o in day_orders)
        
        daily_orders.append({
            "date": start.strftime("%Y-%m-%d"),
            "day": start.strftime("%a"),
            "count": count,
            "volume": volume
        })
    
    daily_orders.reverse()
    
    # KYC status breakdown
    kyc_approved = await db.users.count_documents({"kyc_status": "approved"})
    kyc_pending = await db.users.count_documents({"kyc_status": "pending"})
    kyc_rejected = await db.users.count_documents({"kyc_status": "rejected"})
    kyc_under_review = await db.users.count_documents({"kyc_status": "under_review"})
    
    # Recent registrations (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_this_week = await db.users.count_documents({
        "role": "user",
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "overview": {
            "total_users": total_users,
            "verified_users": verified_users,
            "pending_kyc": pending_kyc,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders,
            "pending_wallets": pending_wallets,
            "new_users_this_week": new_users_this_week
        },
        "volume": {
            "total_buy_volume": total_buy_volume,
            "total_sell_volume": total_sell_volume,
            "total_volume": total_buy_volume + total_sell_volume
        },
        "charts": {
            "asset_breakdown": [
                {"asset": k, "count": v["count"], "volume": v["volume"]} 
                for k, v in asset_breakdown.items()
            ],
            "daily_orders": daily_orders,
            "kyc_status": {
                "approved": kyc_approved,
                "pending": kyc_pending,
                "rejected": kyc_rejected,
                "under_review": kyc_under_review
            }
        }
    }

@router.post("/init-default-data")
async def init_default_data(admin: dict = Depends(get_admin_user)):
    """Initialize default admin and rates"""
    
    existing_admin = await db.users.find_one({"role": "admin"})
    if not existing_admin:
        from core.dependencies import hash_password
        admin_user = User(
            mobile="+919999999999",
            email="admin@bharatbit.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_mobile_verified=True,
            is_email_verified=True,
            kyc_status=KYCStatus.APPROVED
        )
        await db.users.insert_one(admin_user.dict())
    
    default_rates = [
        {"asset": "USDT", "buy_rate": 84.50, "sell_rate": 83.50},
        {"asset": "BTC", "buy_rate": 6850000, "sell_rate": 6800000},
        {"asset": "ETH", "buy_rate": 285000, "sell_rate": 282000}
    ]
    
    for rate_data in default_rates:
        exists = await db.asset_rates.find_one({"asset": rate_data["asset"], "user_specific": None})
        if not exists:
            rate = AssetRate(
                asset=rate_data["asset"],
                buy_rate=rate_data["buy_rate"],
                sell_rate=rate_data["sell_rate"],
                updated_by="system",
                user_specific=None
            )
            await db.asset_rates.insert_one(rate.dict())
    
    return {"success": True, "message": "Default data initialized"}

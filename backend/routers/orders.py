from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import logging

from core.database import db
from core.dependencies import get_current_user
from models import (
    Order, CreateOrderRequest, UpdateOrderRequest, OrderStatus
)

router = APIRouter(prefix="/orders", tags=["Orders"])
logger = logging.getLogger(__name__)

@router.post("/create")
async def create_order(data: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("kyc_status") != "approved":
        raise HTTPException(status_code=403, detail="KYC not approved")
    
    rate = await db.asset_rates.find_one({
        "$or": [
            {"asset": data.asset, "user_specific": current_user["id"]},
            {"asset": data.asset, "user_specific": None}
        ]
    })
    
    if not rate:
        raise HTTPException(status_code=400, detail="Asset rate not found")
    
    price = rate["buy_rate"] if data.order_type == "buy" else rate["sell_rate"]
    total = data.quantity * price
    
    order = Order(
        user_id=current_user["id"],
        asset=data.asset,
        order_type=data.order_type,
        quantity=data.quantity,
        rate=price,
        total_inr=total,
        wallet_address=data.wallet_address
    )
    await db.orders.insert_one(order.dict())
    
    return {
        "success": True,
        "order": {
            "id": order.id,
            "asset": order.asset,
            "order_type": order.order_type.value,
            "quantity": order.quantity,
            "rate": order.rate,
            "total_inr": order.total_inr,
            "status": order.status.value
        }
    }

@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    for order in orders:
        order.pop("_id", None)
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.pop("_id", None)
    return order

@router.put("/{order_id}/update")
async def update_order(order_id: str, data: UpdateOrderRequest, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {"updated_at": datetime.utcnow()}
    if data.payment_proof:
        update_data["payment_proof"] = data.payment_proof
    if data.tx_hash:
        update_data["tx_hash"] = data.tx_hash
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    return {"success": True, "message": "Order updated"}

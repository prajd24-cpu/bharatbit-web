from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import logging

from core.database import db
from core.dependencies import get_current_user
from models import KYCDocument, KYCSubmitRequest, KYCStatus

router = APIRouter(prefix="/kyc", tags=["KYC"])
logger = logging.getLogger(__name__)

@router.post("/submit")
async def submit_kyc(data: KYCSubmitRequest, current_user: dict = Depends(get_current_user)):
    existing = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if existing and existing.get("status") == "approved":
        raise HTTPException(status_code=400, detail="KYC already approved")
    
    kyc_doc = KYCDocument(
        user_id=current_user["id"],
        **data.dict()
    )
    
    if existing:
        await db.kyc_documents.update_one(
            {"user_id": current_user["id"]},
            {"$set": {**kyc_doc.dict(), "submitted_at": datetime.utcnow()}}
        )
    else:
        await db.kyc_documents.insert_one(kyc_doc.dict())
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"kyc_status": KYCStatus.UNDER_REVIEW}}
    )
    
    return {"success": True, "message": "KYC submitted for review"}

@router.get("/status")
async def get_kyc_status(current_user: dict = Depends(get_current_user)):
    kyc_doc = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if not kyc_doc:
        return {"status": "not_submitted", "kyc_status": current_user.get("kyc_status", "pending")}
    
    kyc_doc.pop("_id", None)
    return {
        "status": kyc_doc.get("status", "pending"),
        "kyc_status": current_user.get("kyc_status", "pending"),
        "submitted_at": kyc_doc.get("submitted_at"),
        "rejection_reason": kyc_doc.get("rejection_reason")
    }

@router.get("/document")
async def get_kyc_document(current_user: dict = Depends(get_current_user)):
    kyc_doc = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    kyc_doc.pop("_id", None)
    return kyc_doc

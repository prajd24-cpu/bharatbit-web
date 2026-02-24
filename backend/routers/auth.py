from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
import logging

from core.database import db
from core.dependencies import (
    hash_password, verify_password, create_access_token, 
    generate_otp, get_current_user
)
from models import (
    User, OTPStore, PasswordResetToken,
    RegisterRequest, LoginRequest, VerifyOTPRequest, Verify2FARequest,
    ForgotPasswordRequest, ResetPasswordRequest, KYCStatus, UserRole,
    RegisterPushTokenRequest, AccountType
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

@router.post("/register")
async def register(data: RegisterRequest):
    # Get mobile number (support both mobile and mobile_number fields)
    mobile_number = data.mobile or data.mobile_number or ""
    if data.country_code and mobile_number and not mobile_number.startswith('+'):
        full_mobile = f"{data.country_code}{mobile_number}"
    else:
        full_mobile = mobile_number
    
    existing = await db.users.find_one({"$or": [{"mobile": full_mobile}, {"email": data.email}]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Validate corporate accounts have company name
    if data.account_type == AccountType.CORPORATE and not data.company_name:
        raise HTTPException(status_code=400, detail="Company name is required for corporate accounts")
    
    otp = generate_otp()
    otp_data = OTPStore(
        mobile=data.email,
        otp=otp,
        purpose="registration"
    )
    await db.otp_store.insert_one(otp_data.dict())
    
    user = User(
        mobile=full_mobile,
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        account_type=data.account_type,
        company_name=data.company_name,
        referral_code=data.referral_code,
        invite_code=data.invite_code
    )
    await db.users.insert_one(user.dict())
    
    # Send email OTP
    from services.email_service import send_otp_email, notify_admin_new_registration
    email_result = await send_otp_email(data.email, otp)
    
    # Send SMS OTP
    from services.sms_service import send_sms_otp
    sms_result = await send_sms_otp(full_mobile, otp)
    
    # Notify admin
    try:
        await notify_admin_new_registration({
            "email": data.email,
            "mobile": full_mobile,
            "id": user.id,
            "client_uid": user.client_uid,
            "account_type": data.account_type,
            "company_name": data.company_name,
            "referral_code": data.referral_code,
            "invite_code": data.invite_code,
            "created_at": str(user.created_at)
        })
    except Exception as e:
        logger.warning(f"Failed to notify admin: {e}")
    
    return {
        "success": True,
        "message": "OTP sent to email and mobile",
        "user_id": user.id,
        "client_uid": user.client_uid,
        "email": data.email,
        "account_type": data.account_type,
        "email_sent": email_result.get("success", False),
        "sms_sent": sms_result.get("success", False)
    }

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    otp_record = await db.otp_store.find_one({
        "mobile": data.mobile,
        "otp": data.otp,
        "purpose": data.purpose,
        "is_used": False
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    if datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    await db.otp_store.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"is_used": True}}
    )
    
    user = await db.users.find_one({"$or": [{"email": data.mobile}, {"mobile": data.mobile}]})
    if user:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"is_email_verified": True, "is_mobile_verified": True}}
        )
        token = create_access_token({"sub": user["id"]})
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "client_uid": user.get("client_uid", "N/A"),
                "mobile": user["mobile"],
                "email": user["email"],
                "role": user["role"],
                "kyc_status": user["kyc_status"],
                "account_type": user.get("account_type", "individual"),
                "company_name": user.get("company_name")
            }
        }
    
    return {"success": True, "message": "OTP verified"}

@router.post("/login")
async def login(data: LoginRequest):
    # Support both identifier and email fields
    search_value = data.identifier or data.email
    if not search_value:
        raise HTTPException(status_code=400, detail="Email or identifier required")
    
    # Search by email or mobile
    user = await db.users.find_one({
        "$or": [
            {"email": search_value},
            {"mobile": search_value},
            {"mobile": f"+91{search_value}"}  # Support without country code
        ]
    })
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get("is_frozen"):
        raise HTTPException(status_code=403, detail="Account is frozen")
    
    # Generate 2FA OTP
    otp = generate_otp()
    otp_data = OTPStore(
        mobile=user["mobile"],
        otp=otp,
        purpose="2fa"
    )
    await db.otp_store.insert_one(otp_data.dict())
    
    # Send OTPs
    from services.email_service import send_2fa_otp_email
    from services.sms_service import send_sms_otp
    
    email_result = await send_2fa_otp_email(user["email"], otp)
    sms_result = await send_sms_otp(user["mobile"], otp)
    
    return {
        "success": True,
        "message": "2FA OTP sent to email and mobile",
        "requires_2fa": True,
        "mobile": user["mobile"],
        "email_sent": email_result.get("success", False),
        "sms_sent": sms_result.get("success", False)
    }

@router.post("/verify-2fa")
async def verify_2fa(data: Verify2FARequest):
    otp_record = await db.otp_store.find_one({
        "mobile": data.mobile,
        "otp": data.otp,
        "purpose": "2fa",
        "is_used": False
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    await db.otp_store.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"is_used": True}}
    )
    
    user = await db.users.find_one({"mobile": data.mobile})
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_access_token({"sub": user["id"]})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "client_uid": user.get("client_uid", "N/A"),
            "mobile": user["mobile"],
            "email": user["email"],
            "role": user["role"],
            "kyc_status": user["kyc_status"],
            "account_type": user.get("account_type", "individual"),
            "company_name": user.get("company_name"),
            "is_frozen": user.get("is_frozen", False)
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {
        "id": current_user["id"],
        "client_uid": current_user.get("client_uid", "N/A"),
        "mobile": current_user["mobile"],
        "email": current_user["email"],
        "role": current_user["role"],
        "kyc_status": current_user["kyc_status"],
        "account_type": current_user.get("account_type", "individual"),
        "company_name": current_user.get("company_name"),
        "is_frozen": current_user.get("is_frozen", False),
        "relationship_manager": current_user.get("relationship_manager"),
        "rm_phone": current_user.get("rm_phone"),
        "rm_whatsapp": current_user.get("rm_whatsapp")
    }
    return user_data


# Create users router for profile endpoint
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's full profile with client_id field for frontend compatibility"""
    return {
        "id": current_user["id"],
        "client_id": current_user.get("client_uid", str(current_user["id"])[:7]),  # client_id for frontend
        "client_uid": current_user.get("client_uid", "N/A"),
        "email": current_user["email"],
        "mobile_number": current_user["mobile"],
        "name": current_user.get("name", ""),
        "profile_pic": current_user.get("profile_pic"),
        "kyc_status": current_user["kyc_status"],
        "account_type": current_user.get("account_type", "individual"),
        "company_name": current_user.get("company_name"),
        "is_frozen": current_user.get("is_frozen", False),
        "bank_verified": current_user.get("bank_verified", False),
        "wallet_verified": current_user.get("wallet_verified", False),
        "relationship_manager": current_user.get("relationship_manager"),
        "rm_phone": current_user.get("rm_phone"),
        "rm_whatsapp": current_user.get("rm_whatsapp")
    }

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({"email": data.email})
    if not user:
        return {"success": True, "message": "If email exists, reset link sent"}
    
    token = str(uuid.uuid4())
    reset_token = PasswordResetToken(
        user_id=user["id"],
        token=token
    )
    await db.password_reset_tokens.insert_one(reset_token.dict())
    
    from services.email_service import send_password_reset_email
    await send_password_reset_email(data.email, token)
    
    return {"success": True, "message": "Password reset link sent", "token": token}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    token_record = await db.password_reset_tokens.find_one({
        "token": data.token,
        "is_used": False
    })
    
    if not token_record:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    if datetime.utcnow() > token_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Token expired")
    
    await db.password_reset_tokens.update_one(
        {"_id": token_record["_id"]},
        {"$set": {"is_used": True}}
    )
    
    await db.users.update_one(
        {"id": token_record["user_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )
    
    return {"success": True, "message": "Password reset successfully"}

@router.post("/register-push-token")
async def register_push_token(data: RegisterPushTokenRequest, current_user: dict = Depends(get_current_user)):
    """Register push notification token for current user"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"push_token": data.push_token}}
    )
    return {"success": True, "message": "Push token registered"}

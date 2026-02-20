from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from enum import Enum
import random
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'bharatbit-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Create the main app
app = FastAPI(title="BharatBit OTC Desk API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== ENUMS ====================
class KYCStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class OrderType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    AWAITING_PAYMENT = "awaiting_payment"
    PAYMENT_CONFIRMED = "payment_confirmed"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class TransactionType(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"

# ==================== MODELS ====================
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mobile: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.USER
    is_mobile_verified: bool = False
    is_email_verified: bool = False
    is_2fa_enabled: bool = False
    kyc_status: KYCStatus = KYCStatus.PENDING
    referral_code: Optional[str] = None
    invite_code: Optional[str] = None
    is_frozen: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    relationship_manager: Optional[str] = None
    rm_phone: Optional[str] = None
    rm_whatsapp: Optional[str] = None

class KYCDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pan_number: str
    pan_image: str  # base64
    aadhaar_number: str
    aadhaar_front: str  # base64
    aadhaar_back: str  # base64
    selfie_image: str  # base64
    address_proof: str  # base64
    bank_account_number: str
    bank_ifsc: str
    bank_name: str
    bank_branch: str
    account_holder_name: str
    nominee_name: str
    nominee_relationship: str
    nominee_dob: str
    fatca_declaration: bool
    terms_accepted: bool
    status: KYCStatus = KYCStatus.PENDING
    rejection_reason: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str = Field(default_factory=lambda: f"OTC{datetime.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}")
    user_id: str
    order_type: OrderType
    asset: str  # USDT, BTC, ETH
    quantity: float
    rate: float
    total_inr: float
    wallet_address: Optional[str] = None
    payment_proof: Optional[str] = None  # base64
    utr_number: Optional[str] = None
    status: OrderStatus = OrderStatus.AWAITING_PAYMENT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

class WalletLedger(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    transaction_type: TransactionType
    amount: float
    asset: str
    balance_after: float
    reference_id: str  # order_id or manual entry id
    reference_type: str  # order, manual, settlement
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # admin id for manual entries

class AssetRate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset: str
    buy_rate: float
    sell_rate: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    user_specific: Optional[str] = None  # user_id for custom rates

class OTPStore(BaseModel):
    mobile: str
    otp: str
    purpose: str  # registration, login, 2fa
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=10))
    is_used: bool = False

class WalletType(str, Enum):
    EXCHANGE = "exchange"  # Custodial wallet on exchange (Binance, WazirX, etc.)
    SELF_CUSTODY = "self_custody"  # Personal wallet (MetaMask, Trust Wallet, Ledger, etc.)

class WalletVerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SavedWallet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    label: str  # User-friendly name like "My Binance USDT", "Personal ETH Wallet"
    wallet_address: str
    asset: str  # USDT, BTC, ETH
    network: str  # TRC20, ERC20, BEP20, Bitcoin, etc.
    wallet_type: WalletType
    exchange_name: Optional[str] = None  # Required if wallet_type is EXCHANGE
    proof_image: str  # base64 - Screenshot from exchange or signed message proof
    proof_description: Optional[str] = None  # Additional notes about the proof
    verification_status: WalletVerificationStatus = WalletVerificationStatus.PENDING
    rejection_reason: Optional[str] = None
    is_primary: bool = False  # Primary wallet for this asset
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None

# ==================== REQUEST/RESPONSE MODELS ====================
class RegisterRequest(BaseModel):
    mobile: str
    email: EmailStr
    password: str
    referral_code: Optional[str] = None
    invite_code: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str
    purpose: str

class LoginRequest(BaseModel):
    identifier: str  # mobile or email
    password: str

class Verify2FARequest(BaseModel):
    mobile: str
    otp: str

class KYCSubmissionRequest(BaseModel):
    pan_number: str
    pan_image: str
    aadhaar_number: str
    aadhaar_front: str
    aadhaar_back: str
    selfie_image: str
    address_proof: str
    bank_account_number: str
    bank_ifsc: str
    bank_name: str
    bank_branch: str
    account_holder_name: str
    nominee_name: str
    nominee_relationship: str
    nominee_dob: str
    fatca_declaration: bool
    terms_accepted: bool

class OrderCreateRequest(BaseModel):
    order_type: OrderType
    asset: str
    quantity: float
    wallet_address: Optional[str] = None

class OrderUpdateRequest(BaseModel):
    payment_proof: Optional[str] = None
    utr_number: Optional[str] = None

class AdminKYCActionRequest(BaseModel):
    kyc_id: str
    action: str  # approve, reject
    rejection_reason: Optional[str] = None

class AdminOrderUpdateRequest(BaseModel):
    order_id: str
    status: OrderStatus
    notes: Optional[str] = None

class AdminRateUpdateRequest(BaseModel):
    asset: str
    buy_rate: float
    sell_rate: float
    user_id: Optional[str] = None

class AdminLedgerEntryRequest(BaseModel):
    user_id: str
    transaction_type: TransactionType
    amount: float
    asset: str
    description: str

class SaveWalletRequest(BaseModel):
    label: str
    wallet_address: str
    asset: str  # USDT, BTC, ETH
    network: str  # TRC20, ERC20, BEP20, Bitcoin, etc.
    wallet_type: str  # exchange, self_custody
    exchange_name: Optional[str] = None
    proof_image: str  # base64 screenshot
    proof_description: Optional[str] = None
    is_primary: bool = False

class AdminWalletActionRequest(BaseModel):
    wallet_id: str
    action: str  # verify, reject
    rejection_reason: Optional[str] = None

# ==================== UTILITY FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    # Check if user exists
    existing = await db.users.find_one({"$or": [{"mobile": data.mobile}, {"email": data.email}]})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Generate OTP for email verification (6-digit)
    otp = generate_otp()
    otp_data = OTPStore(
        mobile=data.email,  # Using email as identifier
        otp=otp,
        purpose="registration"
    )
    await db.otp_store.insert_one(otp_data.dict())
    
    # Create user
    user = User(
        mobile=data.mobile,
        email=data.email,
        password_hash=hash_password(data.password),
        referral_code=data.referral_code,
        invite_code=data.invite_code
    )
    await db.users.insert_one(user.dict())
    
    # Send email OTP (using email service)
    from services.email_service import send_otp_email
    email_result = await send_otp_email(data.email, otp)
    
    # Mock OTP sending (in production, send via email service)
    return {
        "success": True,
        "message": "OTP sent to email",
        "user_id": user.id,
        "mock_otp": otp,  # Remove in production
        "email_sent": email_result.get("success", False)
    }

@api_router.post("/auth/verify-otp")
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
    
    # Mark OTP as used
    await db.otp_store.update_one(
        {"_id": otp_record["_id"]},
        {"$set": {"is_used": True}}
    )
    
    # Update user verification status
    await db.users.update_one(
        {"mobile": data.mobile},
        {"$set": {"is_mobile_verified": True}}
    )
    
    user = await db.users.find_one({"mobile": data.mobile})
    token = create_access_token({"sub": user["id"]})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "mobile": user["mobile"],
            "email": user["email"],
            "role": user["role"],
            "kyc_status": user["kyc_status"]
        }
    }

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({
        "$or": [{"mobile": data.identifier}, {"email": data.identifier}]
    })
    
    if not user or not verify_password(data.password, user["password_hash"]):
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
    
    return {
        "success": True,
        "message": "2FA OTP sent",
        "requires_2fa": True,
        "mobile": user["mobile"],
        "mock_otp": otp  # Remove in production
    }

@api_router.post("/auth/verify-2fa")
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
            "mobile": user["mobile"],
            "email": user["email"],
            "role": user["role"],
            "kyc_status": user["kyc_status"],
            "is_frozen": user.get("is_frozen", False)
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {
        "id": current_user["id"],
        "mobile": current_user["mobile"],
        "email": current_user["email"],
        "role": current_user["role"],
        "kyc_status": current_user["kyc_status"],
        "is_mobile_verified": current_user.get("is_mobile_verified", False),
        "is_email_verified": current_user.get("is_email_verified", False),
        "relationship_manager": current_user.get("relationship_manager"),
        "rm_phone": current_user.get("rm_phone"),
        "rm_whatsapp": current_user.get("rm_whatsapp"),
        "created_at": current_user.get("created_at")
    }
    return user_data

# ==================== KYC ROUTES ====================
@api_router.post("/kyc/submit")
async def submit_kyc(data: KYCSubmissionRequest, current_user: dict = Depends(get_current_user)):
    # Check if KYC already exists
    existing = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if existing and existing["status"] != "rejected":
        raise HTTPException(status_code=400, detail="KYC already submitted")
    
    kyc_doc = KYCDocument(
        user_id=current_user["id"],
        **data.dict()
    )
    await db.kyc_documents.insert_one(kyc_doc.dict())
    
    # Update user KYC status
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"kyc_status": KYCStatus.UNDER_REVIEW}}
    )
    
    return {"success": True, "message": "KYC submitted successfully", "kyc_id": kyc_doc.id}

@api_router.get("/kyc/status")
async def get_kyc_status(current_user: dict = Depends(get_current_user)):
    kyc_doc = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if not kyc_doc:
        return {"status": "not_submitted"}
    
    return {
        "status": kyc_doc["status"],
        "submitted_at": kyc_doc.get("submitted_at"),
        "reviewed_at": kyc_doc.get("reviewed_at"),
        "rejection_reason": kyc_doc.get("rejection_reason")
    }

@api_router.get("/kyc/document")
async def get_kyc_document(current_user: dict = Depends(get_current_user)):
    kyc_doc = await db.kyc_documents.find_one({"user_id": current_user["id"]})
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    return kyc_doc

# ==================== ORDER ROUTES ====================
@api_router.post("/orders/create")
async def create_order(data: OrderCreateRequest, current_user: dict = Depends(get_current_user)):
    # Check KYC status
    if current_user["kyc_status"] != "approved":
        raise HTTPException(status_code=403, detail="KYC must be approved to place orders")
    
    # Get current rate
    rate_doc = await db.asset_rates.find_one({"asset": data.asset, "user_specific": None})
    if not rate_doc:
        raise HTTPException(status_code=404, detail="Asset rate not found")
    
    rate = rate_doc["buy_rate"] if data.order_type == OrderType.BUY else rate_doc["sell_rate"]
    total_inr = data.quantity * rate
    
    order = Order(
        user_id=current_user["id"],
        order_type=data.order_type,
        asset=data.asset,
        quantity=data.quantity,
        rate=rate,
        total_inr=total_inr,
        wallet_address=data.wallet_address
    )
    await db.orders.insert_one(order.dict())
    
    return {
        "success": True,
        "order": order.dict()
    }

@api_router.get("/orders/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/orders/{order_id}/update")
async def update_order(order_id: str, data: OrderUpdateRequest, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {
        "updated_at": datetime.utcnow()
    }
    if data.payment_proof:
        update_data["payment_proof"] = data.payment_proof
        update_data["status"] = OrderStatus.PAYMENT_CONFIRMED
    if data.utr_number:
        update_data["utr_number"] = data.utr_number
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    return {"success": True, "message": "Order updated"}

# ==================== WALLET ROUTES ====================
@api_router.get("/wallet/balance")
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
    
    return balances

@api_router.get("/wallet/ledger")
async def get_wallet_ledger(current_user: dict = Depends(get_current_user)):
    ledger = await db.wallet_ledger.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(100)
    return ledger

# ==================== SAVED WALLET ADDRESSES ROUTES ====================
@api_router.post("/wallets/save")
async def save_wallet_address(data: SaveWalletRequest, current_user: dict = Depends(get_current_user)):
    """Save a new wallet address with ownership proof"""
    
    # Check if wallet address already exists for this user and asset
    existing = await db.saved_wallets.find_one({
        "user_id": current_user["id"],
        "wallet_address": data.wallet_address,
        "asset": data.asset
    })
    if existing:
        raise HTTPException(status_code=400, detail="This wallet address is already saved for this asset")
    
    # Validate wallet type
    wallet_type = WalletType.EXCHANGE if data.wallet_type == "exchange" else WalletType.SELF_CUSTODY
    
    # If exchange wallet, exchange name is required
    if wallet_type == WalletType.EXCHANGE and not data.exchange_name:
        raise HTTPException(status_code=400, detail="Exchange name is required for exchange wallets")
    
    # If setting as primary, unset other primary wallets for this asset
    if data.is_primary:
        await db.saved_wallets.update_many(
            {"user_id": current_user["id"], "asset": data.asset},
            {"$set": {"is_primary": False}}
        )
    
    wallet = SavedWallet(
        user_id=current_user["id"],
        label=data.label,
        wallet_address=data.wallet_address,
        asset=data.asset,
        network=data.network,
        wallet_type=wallet_type,
        exchange_name=data.exchange_name,
        proof_image=data.proof_image,
        proof_description=data.proof_description,
        is_primary=data.is_primary
    )
    await db.saved_wallets.insert_one(wallet.dict())
    
    # Notify admin about new wallet submission
    from services.email_service import email_service
    try:
        support_email = email_service.support_email
        await email_service.send_email(
            support_email,
            f"New Wallet Address Submitted - {current_user['email']}",
            f"""
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>New Wallet Address Pending Verification</h2>
                <p><strong>User:</strong> {current_user['email']}</p>
                <p><strong>Label:</strong> {data.label}</p>
                <p><strong>Asset:</strong> {data.asset} ({data.network})</p>
                <p><strong>Address:</strong> {data.wallet_address}</p>
                <p><strong>Type:</strong> {data.wallet_type}{' - ' + data.exchange_name if data.exchange_name else ''}</p>
                <p style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-radius: 6px;">
                    <strong>Action Required:</strong> Please verify this wallet in the admin panel.
                </p>
            </div>
            """
        )
    except Exception as e:
        logger.warning(f"Failed to send wallet notification email: {e}")
    
    return {
        "success": True,
        "message": "Wallet saved successfully. Pending verification.",
        "wallet_id": wallet.id
    }

@api_router.get("/wallets/my-wallets")
async def get_my_wallets(current_user: dict = Depends(get_current_user)):
    """Get all saved wallets for the current user"""
    wallets = await db.saved_wallets.find({"user_id": current_user["id"]}).sort("created_at", -1).to_list(50)
    
    # Clean MongoDB ObjectIds
    for wallet in wallets:
        wallet.pop("_id", None)
    
    return wallets

@api_router.get("/wallets/verified")
async def get_verified_wallets(current_user: dict = Depends(get_current_user)):
    """Get only verified wallets for order placement"""
    wallets = await db.saved_wallets.find({
        "user_id": current_user["id"],
        "verification_status": "verified"
    }).to_list(50)
    
    # Clean MongoDB ObjectIds
    for wallet in wallets:
        wallet.pop("_id", None)
    
    return wallets

@api_router.get("/wallets/{wallet_id}")
async def get_wallet_detail(wallet_id: str, current_user: dict = Depends(get_current_user)):
    """Get wallet details"""
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    wallet.pop("_id", None)
    return wallet

@api_router.put("/wallets/{wallet_id}/set-primary")
async def set_primary_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    """Set a wallet as primary for its asset type"""
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet["verification_status"] != "verified":
        raise HTTPException(status_code=400, detail="Only verified wallets can be set as primary")
    
    # Unset other primary wallets for this asset
    await db.saved_wallets.update_many(
        {"user_id": current_user["id"], "asset": wallet["asset"]},
        {"$set": {"is_primary": False}}
    )
    
    # Set this wallet as primary
    await db.saved_wallets.update_one(
        {"id": wallet_id},
        {"$set": {"is_primary": True}}
    )
    
    return {"success": True, "message": "Wallet set as primary"}

@api_router.delete("/wallets/{wallet_id}")
async def delete_wallet(wallet_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a saved wallet"""
    wallet = await db.saved_wallets.find_one({"id": wallet_id, "user_id": current_user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    await db.saved_wallets.delete_one({"id": wallet_id})
    
    return {"success": True, "message": "Wallet deleted"}

# ==================== RATES ROUTES ====================
@api_router.get("/rates")
async def get_rates(current_user: dict = Depends(get_current_user)):
    # Get user-specific rates or default rates
    rates = await db.asset_rates.find({"$or": [{"user_specific": None}, {"user_specific": current_user["id"]}]}).to_list(100)
    
    # Organize by asset and clean MongoDB ObjectId
    rate_map = {}
    for rate in rates:
        # Remove MongoDB ObjectId
        rate.pop("_id", None)
        asset = rate["asset"]
        if rate.get("user_specific") == current_user["id"]:
            rate_map[asset] = rate  # User-specific takes priority
        elif asset not in rate_map:
            rate_map[asset] = rate
    
    return list(rate_map.values())

# ==================== ADMIN ROUTES ====================
@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({"role": "user"}, {"password_hash": 0}).to_list(100)
    # Clean MongoDB ObjectIds
    for user in users:
        user.pop("_id", None)
    return users

@api_router.get("/admin/kyc-pending")
async def admin_get_pending_kyc(admin: dict = Depends(get_admin_user)):
    kyc_docs = await db.kyc_documents.find({"status": {"$in": ["pending", "under_review"]}}).to_list(100)
    
    # Batch fetch all users to avoid N+1 queries
    user_ids = list(set(doc["user_id"] for doc in kyc_docs if doc.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    # Enrich with user data and clean ObjectIds
    for doc in kyc_docs:
        doc.pop("_id", None)
        user = user_map.get(doc.get("user_id"))
        if user:
            doc["user_email"] = user["email"]
            doc["user_mobile"] = user["mobile"]
    
    return kyc_docs

@api_router.get("/admin/kyc/{kyc_id}")
async def admin_get_kyc_detail(kyc_id: str, admin: dict = Depends(get_admin_user)):
    kyc_doc = await db.kyc_documents.find_one({"id": kyc_id})
    if not kyc_doc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    user = await db.users.find_one({"id": kyc_doc["user_id"]})
    kyc_doc["user"] = user
    
    return kyc_doc

@api_router.post("/admin/kyc/action")
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
    
    return {"success": True, "message": f"KYC {data.action}d successfully"}

# ==================== ADMIN WALLET VERIFICATION ROUTES ====================
@api_router.get("/admin/wallets/pending")
async def admin_get_pending_wallets(admin: dict = Depends(get_admin_user)):
    """Get all wallets pending verification"""
    wallets = await db.saved_wallets.find({"verification_status": "pending"}).sort("created_at", -1).to_list(100)
    
    # Batch fetch all users to avoid N+1 queries
    user_ids = list(set(w["user_id"] for w in wallets if w.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    # Enrich with user data
    for wallet in wallets:
        wallet.pop("_id", None)
        user = user_map.get(wallet.get("user_id"))
        if user:
            wallet["user_email"] = user["email"]
            wallet["user_mobile"] = user["mobile"]
    
    return wallets

@api_router.get("/admin/wallets/all")
async def admin_get_all_wallets(admin: dict = Depends(get_admin_user)):
    """Get all wallets across all users"""
    wallets = await db.saved_wallets.find().sort("created_at", -1).to_list(100)
    
    # Batch fetch all users to avoid N+1 queries
    user_ids = list(set(w["user_id"] for w in wallets if w.get("user_id")))
    users = await db.users.find({"id": {"$in": user_ids}}).to_list(len(user_ids))
    user_map = {u["id"]: u for u in users}
    
    # Enrich with user data
    for wallet in wallets:
        wallet.pop("_id", None)
        user = user_map.get(wallet.get("user_id"))
        if user:
            wallet["user_email"] = user["email"]
            wallet["user_mobile"] = user["mobile"]
    
    return wallets

@api_router.get("/admin/wallets/{wallet_id}")
async def admin_get_wallet_detail(wallet_id: str, admin: dict = Depends(get_admin_user)):
    """Get wallet details with proof image for verification"""
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

@api_router.post("/admin/wallets/action")
async def admin_wallet_action(data: AdminWalletActionRequest, admin: dict = Depends(get_admin_user)):
    """Verify or reject a wallet"""
    wallet = await db.saved_wallets.find_one({"id": data.wallet_id})
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    new_status = WalletVerificationStatus.VERIFIED if data.action == "verify" else WalletVerificationStatus.REJECTED
    
    update_data = {
        "verification_status": new_status,
        "verified_at": datetime.utcnow(),
        "verified_by": admin["id"]
    }
    
    if data.action == "reject" and data.rejection_reason:
        update_data["rejection_reason"] = data.rejection_reason
    
    await db.saved_wallets.update_one({"id": data.wallet_id}, {"$set": update_data})
    
    # Get user for notifications
    user = await db.users.find_one({"id": wallet["user_id"]})
    
    # Send email notification to user
    from services.email_service import email_service
    if user:
        if data.action == "verify":
            await email_service.send_email(
                user["email"],
                f"Wallet Verified - {wallet['label']}",
                f"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #10B981;">Wallet Verified!</h2>
                    <p>Your wallet <strong>{wallet['label']}</strong> has been verified.</p>
                    <p><strong>Address:</strong> {wallet['wallet_address']}</p>
                    <p><strong>Asset:</strong> {wallet['asset']} ({wallet['network']})</p>
                    <p>You can now use this wallet for receiving crypto from your orders.</p>
                </div>
                """
            )
        else:
            await email_service.send_email(
                user["email"],
                f"Wallet Verification Failed - {wallet['label']}",
                f"""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #EF4444;">Wallet Verification Failed</h2>
                    <p>Your wallet <strong>{wallet['label']}</strong> could not be verified.</p>
                    <p><strong>Reason:</strong> {data.rejection_reason or 'Invalid proof of ownership'}</p>
                    <p>Please submit a new wallet with valid proof of ownership.</p>
                </div>
                """
            )
    
    # Send push notification
    if user and user.get("push_token"):
        from services.push_service import push_service
        if data.action == "verify":
            await push_service.send_push_notification(
                [user["push_token"]],
                "Wallet Verified ✓",
                f"Your wallet {wallet['label']} has been verified.",
                {"type": "wallet_verified", "wallet_id": wallet["id"]}
            )
        else:
            await push_service.send_push_notification(
                [user["push_token"]],
                "Wallet Verification Failed",
                f"Please check your wallet submission.",
                {"type": "wallet_rejected", "wallet_id": wallet["id"]}
            )
    
    return {"success": True, "message": f"Wallet {data.action}d successfully"}

@api_router.get("/admin/orders")
async def admin_get_orders(admin: dict = Depends(get_admin_user)):
    orders = await db.orders.find().sort("created_at", -1).to_list(500)
    
    # Enrich with user data
    for order in orders:
        user = await db.users.find_one({"id": order["user_id"]})
        if user:
            order["user_email"] = user["email"]
            order["user_mobile"] = user["mobile"]
    
    return orders

@api_router.put("/admin/orders/update")
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
    if data.status == OrderStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
        
        # Create wallet ledger entry
        ledger_entry = WalletLedger(
            user_id=order["user_id"],
            transaction_type=TransactionType.CREDIT if order["order_type"] == "buy" else TransactionType.DEBIT,
            amount=order["quantity"],
            asset=order["asset"],
            balance_after=0,  # Calculate properly in production
            reference_id=order["order_id"],
            reference_type="order",
            description=f"{order['order_type'].upper()} {order['quantity']} {order['asset']}",
            created_by=admin["id"]
        )
        await db.wallet_ledger.insert_one(ledger_entry.dict())
    
    await db.orders.update_one({"id": data.order_id}, {"$set": update_data})
    
    return {"success": True, "message": "Order updated"}

@api_router.post("/admin/rates/update")
async def admin_update_rates(data: AdminRateUpdateRequest, admin: dict = Depends(get_admin_user)):
    rate_doc = AssetRate(
        asset=data.asset,
        buy_rate=data.buy_rate,
        sell_rate=data.sell_rate,
        updated_by=admin["id"],
        user_specific=data.user_id
    )
    
    # Update or insert
    await db.asset_rates.delete_many({"asset": data.asset, "user_specific": data.user_id})
    await db.asset_rates.insert_one(rate_doc.dict())
    
    return {"success": True, "message": "Rates updated"}

@api_router.get("/admin/rates")
async def admin_get_rates(admin: dict = Depends(get_admin_user)):
    rates = await db.asset_rates.find().to_list(100)
    return rates

@api_router.post("/admin/ledger/manual-entry")
async def admin_manual_ledger_entry(data: AdminLedgerEntryRequest, admin: dict = Depends(get_admin_user)):
    # Get current balance
    current_balance = 0
    last_entry = await db.wallet_ledger.find_one(
        {"user_id": data.user_id, "asset": data.asset},
        sort=[("created_at", -1)]
    )
    if last_entry:
        current_balance = last_entry["balance_after"]
    
    new_balance = current_balance + data.amount if data.transaction_type == TransactionType.CREDIT else current_balance - data.amount
    
    ledger_entry = WalletLedger(
        user_id=data.user_id,
        transaction_type=data.transaction_type,
        amount=data.amount,
        asset=data.asset,
        balance_after=new_balance,
        reference_id=str(uuid.uuid4()),
        reference_type="manual",
        description=data.description,
        created_by=admin["id"]
    )
    await db.wallet_ledger.insert_one(ledger_entry.dict())
    
    return {"success": True, "message": "Ledger entry created"}

@api_router.put("/admin/users/{user_id}/freeze")
async def admin_freeze_user(user_id: str, freeze: bool, admin: dict = Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"is_frozen": freeze}})
    return {"success": True, "message": f"User {'frozen' if freeze else 'unfrozen'}"}

@api_router.put("/admin/users/{user_id}/assign-rm")
async def admin_assign_rm(user_id: str, rm_name: str, rm_phone: str, rm_whatsapp: str, admin: dict = Depends(get_admin_user)):
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "relationship_manager": rm_name,
            "rm_phone": rm_phone,
            "rm_whatsapp": rm_whatsapp
        }}
    )
    return {"success": True, "message": "RM assigned"}

@api_router.get("/admin/analytics")
async def admin_get_analytics(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": "user"})
    pending_kyc = await db.kyc_documents.count_documents({"status": {"$in": ["pending", "under_review"]}})
    approved_kyc = await db.kyc_documents.count_documents({"status": "approved"})
    
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": {"$in": ["awaiting_payment", "payment_confirmed", "processing"]}})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    
    # Calculate total volume
    completed_orders_list = await db.orders.find({"status": "completed"}).to_list(10000)
    total_volume = sum(order["total_inr"] for order in completed_orders_list)
    
    return {
        "total_users": total_users,
        "pending_kyc": pending_kyc,
        "approved_kyc": approved_kyc,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_volume_inr": total_volume
    }

# ==================== PAYMENT INFO ROUTES ====================
@api_router.get("/payment/bank-details")
async def get_bank_details():
    # G.F.T. Investments Private Limited - ICICI Bank Account
    return {
        "bank_name": "ICICI Bank",
        "account_holder": "G.F.T. Investments Private Limited",
        "account_number": "345805000533",
        "ifsc": "ICIC0003458",
        "branch": "Balewadi Pune 411045",
        "account_type": "Current Account"
    }

@api_router.get("/payment/upi-details")
async def get_upi_details():
    # Update UPI ID when available
    return {
        "upi_id": "gftinvestments@icici",  # Update with your actual UPI ID
        "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="  # Will be generated by Razorpay when integrated
    }

# ==================== INIT DEFAULT DATA ====================
@api_router.post("/admin/init-default-data")
async def init_default_data():
    # Create default admin user
    admin_exists = await db.users.find_one({"email": "admin@bharatbit.com"})
    if not admin_exists:
        admin_user = User(
            mobile="9999999999",
            email="admin@bharatbit.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_mobile_verified=True,
            is_email_verified=True,
            kyc_status=KYCStatus.APPROVED
        )
        await db.users.insert_one(admin_user.dict())
    
    # Create default rates
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

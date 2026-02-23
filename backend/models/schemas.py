from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

# ==================== ENUMS ====================
class AccountType(str, Enum):
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"

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

class WalletVerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# ==================== DATABASE MODELS ====================
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mobile: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.USER
    account_type: AccountType = AccountType.INDIVIDUAL
    company_name: Optional[str] = None  # For corporate accounts
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
    push_token: Optional[str] = None  # For push notifications

class KYCDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
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
    status: KYCStatus = KYCStatus.PENDING
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset: str
    order_type: OrderType
    quantity: float
    rate: float
    total_inr: float
    status: OrderStatus = OrderStatus.AWAITING_PAYMENT
    payment_proof: Optional[str] = None
    tx_hash: Optional[str] = None
    wallet_address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class WalletLedger(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset: str
    transaction_type: TransactionType
    amount: float
    description: str
    order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssetRate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset: str
    buy_rate: float
    sell_rate: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    user_specific: Optional[str] = None

class OTPStore(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mobile: str  # Can be email or mobile
    otp: str
    purpose: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + __import__('datetime').timedelta(minutes=10))
    is_used: bool = False

class PasswordResetToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + __import__('datetime').timedelta(hours=1))
    is_used: bool = False

class SavedWallet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    asset: str
    network: str
    wallet_address: str
    label: str
    proof_image: Optional[str] = None
    verification_status: WalletVerificationStatus = WalletVerificationStatus.PENDING
    is_primary: bool = False
    admin_notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== REQUEST MODELS ====================
class RegisterRequest(BaseModel):
    mobile: str
    email: EmailStr
    password: str
    account_type: AccountType = AccountType.INDIVIDUAL
    company_name: Optional[str] = None  # Required for corporate accounts
    referral_code: Optional[str] = None
    invite_code: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: Optional[str] = None  # Can be email or mobile
    email: Optional[EmailStr] = None  # For backwards compatibility
    password: str

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str
    purpose: str

class Verify2FARequest(BaseModel):
    mobile: str
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class KYCSubmitRequest(BaseModel):
    # Individual KYC fields
    pan_number: Optional[str] = None
    pan_image: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_front: Optional[str] = None
    aadhaar_back: Optional[str] = None
    selfie_image: Optional[str] = None
    address_proof: Optional[str] = None
    passport_number: Optional[str] = None
    passport_image: Optional[str] = None
    # Corporate KYC fields
    company_registration_cert: Optional[str] = None
    gst_certificate: Optional[str] = None
    board_resolution: Optional[str] = None
    authorized_signatory_id: Optional[str] = None
    authorized_signatory_name: Optional[str] = None
    # Common fields
    bank_account_number: str
    bank_ifsc: str
    bank_name: str
    bank_branch: str
    account_holder_name: str
    nominee_name: str
    nominee_relationship: str
    nominee_dob: str

class CreateOrderRequest(BaseModel):
    asset: str
    order_type: OrderType
    quantity: float
    wallet_address: Optional[str] = None

class UpdateOrderRequest(BaseModel):
    payment_proof: Optional[str] = None
    tx_hash: Optional[str] = None

class SaveWalletRequest(BaseModel):
    asset: str
    network: str
    wallet_address: str
    label: str
    proof_image: Optional[str] = None

class AdminKYCActionRequest(BaseModel):
    kyc_id: str
    action: str  # "approve" or "reject"
    rejection_reason: Optional[str] = None

class AdminOrderUpdateRequest(BaseModel):
    order_id: str
    status: OrderStatus
    notes: Optional[str] = None

class AdminRateUpdateRequest(BaseModel):
    asset: str
    buy_rate: float
    sell_rate: float
    user_specific: Optional[str] = None

class ManualLedgerEntryRequest(BaseModel):
    user_id: str
    asset: str
    transaction_type: TransactionType
    amount: float
    description: str

class AssignRMRequest(BaseModel):
    rm_name: str
    rm_phone: str
    rm_whatsapp: Optional[str] = None

class AdminWalletActionRequest(BaseModel):
    wallet_id: str
    action: str  # "approve" or "reject"
    notes: Optional[str] = None

class RegisterPushTokenRequest(BaseModel):
    push_token: str

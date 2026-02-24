from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

from services.email_service import email_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])
logger = logging.getLogger(__name__)

# ==================== REQUEST MODELS ====================

class KYCNotificationRequest(BaseModel):
    client_id: str
    email: str
    mobile: Optional[str] = None
    kyc_data: Dict[str, Any]
    to_email: str = "support@bharatbit.world"

class WalletNotificationRequest(BaseModel):
    client_id: str
    email: str
    wallet_data: Dict[str, Any]
    to_email: str = "otc@bharatbit.world"

class BankNotificationRequest(BaseModel):
    client_id: str
    email: str
    bank_data: Dict[str, Any]
    to_email: str = "otc@bharatbit.world"

# ==================== NOTIFICATION ENDPOINTS ====================

@router.post("/send-kyc")
async def send_kyc_notification(data: KYCNotificationRequest):
    """Send KYC submission notification to admin"""
    try:
        kyc = data.kyc_data
        subject = f"KYC Submission - Client {data.client_id}"
        
        html = f"""
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">BharatBit OTC Desk</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">New KYC Submission</p>
            </div>
            
            <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <div style="background: #FEF3C7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="color: #92400E;">⏳ Pending Review</strong>
                </div>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px;">Client Information</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">Client ID:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #E95721; font-weight: 600;">{data.client_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Email:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{data.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Mobile:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{data.mobile or 'N/A'}</td>
                    </tr>
                </table>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px; margin-top: 24px;">KYC Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">PAN Number:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{kyc.get('pan_number', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Aadhaar Number:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{kyc.get('aadhaar_number', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Passport Number:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{kyc.get('passport_number', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Client Type:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{'NRI / Non-Resident' if kyc.get('is_nri') else 'Indian Resident'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: 600; color: #666;">Address:</td>
                        <td style="padding: 10px;">{kyc.get('address', 'N/A')}</td>
                    </tr>
                </table>
                
                <div style="background: #DBEAFE; padding: 14px; border-radius: 8px; margin-top: 20px;">
                    <strong style="color: #1E40AF;">📋 Action Required:</strong>
                    <p style="margin: 8px 0 0 0; color: #1E40AF;">Please review the submitted KYC documents in the admin panel and approve/reject accordingly.</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; color: #666; font-size: 12px;">BharatBit OTC Desk - Premium Crypto Trading</p>
            </div>
        </div>
        """
        
        result = await email_service.send_email(data.to_email, subject, html)
        return {"success": True, "message": "KYC notification sent", **result}
        
    except Exception as e:
        logger.error(f"Failed to send KYC notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-wallet")
async def send_wallet_notification(data: WalletNotificationRequest):
    """Send wallet submission notification to OTC team"""
    try:
        wallet = data.wallet_data
        subject = f"Wallet Verification Request - Client {data.client_id}"
        
        wallet_type_display = {
            'exchange': 'Exchange Wallet',
            'custodial': 'Custodial Wallet',
            'self_custody': 'Self-Custody Wallet'
        }
        
        html = f"""
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">BharatBit OTC Desk</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Wallet Verification Request</p>
            </div>
            
            <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <div style="background: #DBEAFE; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="color: #1E40AF;">💰 New Wallet Submitted</strong>
                </div>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px;">Client Information</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">Client ID:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #E95721; font-weight: 600;">{data.client_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Email:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{data.email}</td>
                    </tr>
                </table>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px; margin-top: 24px;">Wallet Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">Wallet Type:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{wallet_type_display.get(wallet.get('wallet_type'), wallet.get('wallet_type', 'N/A'))}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Exchange/Provider:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{wallet.get('exchange_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Asset:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{wallet.get('asset', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Wallet Address:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; word-break: break-all; font-family: monospace; font-size: 12px;">{wallet.get('wallet_address', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: 600; color: #666;">Notes:</td>
                        <td style="padding: 10px;">{wallet.get('notes', 'None')}</td>
                    </tr>
                </table>
                
                <div style="background: #FEF3C7; padding: 14px; border-radius: 8px; margin-top: 20px;">
                    <strong style="color: #92400E;">📋 Ownership proof document attached by client.</strong>
                    <p style="margin: 8px 0 0 0; color: #92400E;">Please verify the wallet ownership before approving.</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; color: #666; font-size: 12px;">BharatBit OTC Desk - Premium Crypto Trading</p>
            </div>
        </div>
        """
        
        result = await email_service.send_email(data.to_email, subject, html)
        return {"success": True, "message": "Wallet notification sent", **result}
        
    except Exception as e:
        logger.error(f"Failed to send wallet notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-bank")
async def send_bank_notification(data: BankNotificationRequest):
    """Send bank account submission notification to OTC team"""
    try:
        bank = data.bank_data
        subject = f"Bank Account Verification - Client {data.client_id}"
        
        # Mask account number for security
        account_num = bank.get('account_number', '')
        masked_account = f"XXXX{account_num[-4:]}" if len(account_num) >= 4 else account_num
        
        html = f"""
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">BharatBit OTC Desk</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Bank Account Verification Request</p>
            </div>
            
            <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none;">
                <div style="background: #DCFCE7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="color: #166534;">🏦 New Bank Account Submitted</strong>
                </div>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px;">Client Information</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">Client ID:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #E95721; font-weight: 600;">{data.client_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Email:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{data.email}</td>
                    </tr>
                </table>
                
                <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #E95721; padding-bottom: 8px; margin-top: 24px;">Bank Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; width: 35%; color: #666;">Account Holder:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600;">{bank.get('account_holder', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Account Number:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-family: monospace;">{masked_account}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">IFSC Code:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-family: monospace;">{bank.get('ifsc_code', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Bank Name:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{bank.get('bank_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #666;">Branch:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">{bank.get('branch', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: 600; color: #666;">Account Type:</td>
                        <td style="padding: 10px;">{bank.get('account_type', 'savings').title()}</td>
                    </tr>
                </table>
                
                <div style="background: #DBEAFE; padding: 14px; border-radius: 8px; margin-top: 20px;">
                    <strong style="color: #1E40AF;">📋 Action Required:</strong>
                    <p style="margin: 8px 0 0 0; color: #1E40AF;">Please verify bank details by sending a small test amount (₹1) and update verification status once confirmed.</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 16px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; color: #666; font-size: 12px;">BharatBit OTC Desk - Premium Crypto Trading</p>
            </div>
        </div>
        """
        
        result = await email_service.send_email(data.to_email, subject, html)
        return {"success": True, "message": "Bank notification sent", **result}
        
    except Exception as e:
        logger.error(f"Failed to send bank notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

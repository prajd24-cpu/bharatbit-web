import os
import asyncio
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Try to import resend, fallback to mock mode if not available
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    logger.warning("Resend library not installed. Using mock mode.")

class EmailService:
    def __init__(self):
        self.provider = os.getenv('EMAIL_PROVIDER', 'mock')
        self.from_email = os.getenv('FROM_EMAIL', 'onboarding@resend.dev')
        self.from_name = os.getenv('FROM_NAME', 'BharatBit OTC Desk')
        self.support_email = os.getenv('SUPPORT_EMAIL', 'support@bharatbit.world')
        self.otc_email = os.getenv('OTC_EMAIL', 'otc@bharatbit.world')
        
        if self.provider == 'resend' and RESEND_AVAILABLE:
            api_key = os.getenv('RESEND_API_KEY')
            if api_key and api_key != 'your_resend_api_key_here':
                resend.api_key = api_key
                self.is_configured = True
            else:
                self.is_configured = False
                logger.warning("Resend API key not configured. Using mock mode.")
        else:
            self.is_configured = False
    
    async def send_email(self, to_email: str, subject: str, html_content: str) -> dict:
        """Send email via configured provider"""
        
        # Mock mode or not configured
        if self.provider == 'mock' or not self.is_configured:
            logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
            return {"success": True, "provider": "mock", "message": "Email would be sent (mock mode)"}
        
        # Resend
        if self.provider == 'resend' and RESEND_AVAILABLE:
            try:
                params = {
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content
                }
                # Run sync SDK in thread to keep FastAPI non-blocking
                email = await asyncio.to_thread(resend.Emails.send, params)
                logger.info(f"Email sent to {to_email}: {email.get('id')}")
                return {"success": True, "provider": "resend", "email_id": email.get('id')}
            except Exception as e:
                logger.error(f"Resend Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No email provider configured"}

# Global instance
email_service = EmailService()

# ==================== OTP & USER EMAILS ====================

async def send_otp_email(to_email: str, otp: str) -> dict:
    """Send OTP via email for registration/verification"""
    subject = "Your BharatBit OTP Code"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #273A52; margin-bottom: 10px;">BharatBit OTC Desk</h1>
            <p style="color: #5A6C7D; font-size: 14px;">Verification Code</p>
        </div>
        
        <div style="background: #F8F9FA; border-left: 4px solid #E54444; padding: 20px; margin: 20px 0;">
            <p style="color: #273A52; margin: 0 0 10px 0;">Your verification code is:</p>
            <h2 style="color: #E54444; font-size: 36px; letter-spacing: 8px; margin: 10px 0; text-align: center;">{otp}</h2>
        </div>
        
        <p style="color: #5A6C7D; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. Do not share this code with anyone.
        </p>
        
        <p style="color: #8B95A0; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            If you didn't request this code, please ignore this email or contact support.
        </p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_2fa_otp_email(to_email: str, otp: str) -> dict:
    """Send 2FA OTP via email for login"""
    subject = "Your BharatBit Login OTP"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #273A52; margin-bottom: 10px;">BharatBit OTC Desk</h1>
            <p style="color: #5A6C7D; font-size: 14px;">Login Verification</p>
        </div>
        
        <div style="background: #F8F9FA; border-left: 4px solid #E54444; padding: 20px; margin: 20px 0;">
            <p style="color: #273A52; margin: 0 0 10px 0;">Your login verification code is:</p>
            <h2 style="color: #E54444; font-size: 36px; letter-spacing: 8px; margin: 10px 0; text-align: center;">{otp}</h2>
        </div>
        
        <p style="color: #5A6C7D; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. If you did not attempt to log in, please change your password immediately.
        </p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_welcome_email(to_email: str, name: str) -> dict:
    subject = "Welcome to BharatBit OTC Desk"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52;">Welcome to BharatBit OTC Desk</h1>
        <p>Dear {name},</p>
        <p>Thank you for registering with BharatBit OTC Desk - India's premium crypto trading platform for HNI clients.</p>
        <p><strong>Next steps:</strong></p>
        <ol>
            <li>Complete your KYC verification</li>
            <li>Wait for admin approval</li>
            <li>Start trading with confidence</li>
        </ol>
        <p>If you have any questions, please contact your relationship manager.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_kyc_approval_email(to_email: str, name: str) -> dict:
    subject = "KYC Approved - Start Trading Now"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #10B981;">KYC Approved!</h1>
        <p>Dear {name},</p>
        <p>Great news! Your KYC has been approved.</p>
        <p>You can now start placing orders on BharatBit OTC Desk.</p>
        <p style="margin-top: 30px;">
            <a href="https://app.bharatbit.com" style="background: #E54444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Trading</a>
        </p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_kyc_rejection_email(to_email: str, name: str, reason: str) -> dict:
    subject = "KYC Verification - Additional Information Required"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #EF4444;">KYC Requires Attention</h1>
        <p>Dear {name},</p>
        <p>We need additional information to complete your KYC verification.</p>
        <p><strong>Reason:</strong> {reason}</p>
        <p>Please resubmit your KYC with the correct information.</p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_password_reset_email(to_email: str, token: str) -> dict:
    """Send password reset email with token"""
    subject = "Password Reset - BharatBit OTC Desk"
    reset_link = f"https://app.bharatbit.world/reset-password?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #273A52; margin-bottom: 10px;">BharatBit OTC Desk</h1>
            <p style="color: #5A6C7D; font-size: 14px;">Password Reset Request</p>
        </div>
        
        <div style="background: #F8F9FA; border-left: 4px solid #E95721; padding: 20px; margin: 20px 0;">
            <p style="color: #273A52; margin: 0 0 10px 0;">You requested to reset your password.</p>
            <p style="color: #273A52; margin: 0 0 10px 0;">Click the button below to reset your password:</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background: #E95721; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #5A6C7D; font-size: 14px;">
            Or copy this link: <br/>
            <span style="color: #E95721;">{reset_link}</span>
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

# ==================== ADMIN NOTIFICATION EMAILS ====================

async def notify_admin_new_registration(user_data: dict) -> dict:
    """Notify support@bharatbit.world about new user registration"""
    support_email = email_service.support_email
    subject = f"New User Registration - {user_data.get('email', 'Unknown')}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52; border-bottom: 2px solid #E54444; padding-bottom: 10px;">New User Registration</h1>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('email', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('mobile', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">User ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('id', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Referral Code:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('referral_code', 'None')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Invite Code:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('invite_code', 'None')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Registered At:</td>
                <td style="padding: 10px;">{user_data.get('created_at', 'N/A')}</td>
            </tr>
        </table>
        
        <p style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-radius: 6px;">
            <strong>Action Required:</strong> Please review the user once they submit KYC.
        </p>
    </div>
    """
    return await email_service.send_email(support_email, subject, html)

async def notify_admin_kyc_submission(user_data: dict, kyc_data: dict) -> dict:
    """Notify support@bharatbit.world about new KYC submission"""
    support_email = email_service.support_email
    subject = f"New KYC Submission - {user_data.get('email', 'Unknown')}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52; border-bottom: 2px solid #E54444; padding-bottom: 10px;">New KYC Submission</h1>
        
        <h3 style="color: #5A6C7D;">User Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('email', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('mobile', 'N/A')}</td>
            </tr>
        </table>
        
        <h3 style="color: #5A6C7D; margin-top: 20px;">KYC Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">PAN Number:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{kyc_data.get('pan_number', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Aadhaar Number:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{kyc_data.get('aadhaar_number', 'N/A')[-4:].rjust(len(kyc_data.get('aadhaar_number', '')), '*')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Bank Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{kyc_data.get('bank_name', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Account Holder:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{kyc_data.get('account_holder_name', 'N/A')}</td>
            </tr>
        </table>
        
        <p style="margin-top: 20px; padding: 15px; background: #DBEAFE; border-radius: 6px;">
            <strong>Action Required:</strong> Please review and approve/reject this KYC in the admin panel.
        </p>
    </div>
    """
    return await email_service.send_email(support_email, subject, html)

async def notify_otc_new_order(user_data: dict, order_data: dict) -> dict:
    """Notify otc@bharatbit.world about new order placed"""
    otc_email = email_service.otc_email
    order_type = order_data.get('order_type', 'N/A').upper()
    subject = f"New {order_type} Order - {order_data.get('order_id', 'Unknown')}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52; border-bottom: 2px solid #E54444; padding-bottom: 10px;">New Order Placed</h1>
        
        <div style="background: {'#DCFCE7' if order_type == 'BUY' else '#FEE2E2'}; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h2 style="margin: 0; color: {'#166534' if order_type == 'BUY' else '#991B1B'};">{order_type} ORDER</h2>
        </div>
        
        <h3 style="color: #5A6C7D;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Order ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #E54444;">{order_data.get('order_id', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Asset:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{order_data.get('asset', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Quantity:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{order_data.get('quantity', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Rate:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">₹{order_data.get('rate', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total INR:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 18px;">₹{order_data.get('total_inr', 'N/A'):,.2f}</td>
            </tr>
        </table>
        
        <h3 style="color: #5A6C7D; margin-top: 20px;">Client Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('email', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('mobile', 'N/A')}</td>
            </tr>
        </table>
        
        <p style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-radius: 6px;">
            <strong>Status:</strong> Awaiting Payment
        </p>
    </div>
    """
    return await email_service.send_email(otc_email, subject, html)

async def notify_otc_payment_uploaded(user_data: dict, order_data: dict) -> dict:
    """Notify otc@bharatbit.world when payment proof is uploaded"""
    otc_email = email_service.otc_email
    subject = f"Payment Proof Uploaded - {order_data.get('order_id', 'Unknown')}"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Payment Proof Uploaded</h1>
        
        <div style="background: #DCFCE7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h2 style="margin: 0; color: #166534;">Payment Confirmation Required</h2>
        </div>
        
        <h3 style="color: #5A6C7D;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Order ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #E54444;">{order_data.get('order_id', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">UTR Number:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">{order_data.get('utr_number', 'Not provided')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total INR:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 18px;">₹{order_data.get('total_inr', 'N/A'):,.2f}</td>
            </tr>
        </table>
        
        <h3 style="color: #5A6C7D; margin-top: 20px;">Client Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('email', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">{user_data.get('mobile', 'N/A')}</td>
            </tr>
        </table>
        
        <p style="margin-top: 20px; padding: 15px; background: #DBEAFE; border-radius: 6px;">
            <strong>Action Required:</strong> Verify payment in bank account and update order status.
        </p>
    </div>
    """
    return await email_service.send_email(otc_email, subject, html)

async def notify_otc_order_status_change(user_data: dict, order_data: dict, new_status: str) -> dict:
    """Notify otc@bharatbit.world about order status changes"""
    otc_email = email_service.otc_email
    subject = f"Order Status Update - {order_data.get('order_id', 'Unknown')} - {new_status.upper()}"
    
    status_colors = {
        'processing': ('#FEF3C7', '#92400E'),
        'completed': ('#DCFCE7', '#166534'),
        'cancelled': ('#FEE2E2', '#991B1B'),
    }
    bg_color, text_color = status_colors.get(new_status.lower(), ('#F3F4F6', '#374151'))
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52; border-bottom: 2px solid #E54444; padding-bottom: 10px;">Order Status Updated</h1>
        
        <div style="background: {bg_color}; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h2 style="margin: 0; color: {text_color};">Status: {new_status.upper()}</h2>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Order ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{order_data.get('order_id', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Client:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{user_data.get('email', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Asset:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{order_data.get('asset', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Total:</td>
                <td style="padding: 10px;">₹{order_data.get('total_inr', 0):,.2f}</td>
            </tr>
        </table>
    </div>
    """
    return await email_service.send_email(otc_email, subject, html)

# ==================== USER ORDER NOTIFICATION EMAILS ====================

async def send_order_confirmation_email(to_email: str, order_id: str, details: dict) -> dict:
    subject = f"Order Confirmation #{order_id}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52;">Order Confirmation</h1>
        <p>Your order has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Order ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">#{order_id}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{details.get('type', 'N/A').upper()}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Asset:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{details.get('asset', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Quantity:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{details.get('quantity', 'N/A')}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Total:</td>
                <td style="padding: 10px; font-weight: bold; font-size: 18px;">₹{details.get('total', 0):,.2f}</td>
            </tr>
        </table>
        <p style="margin-top: 20px;">We'll notify you once the order is processed.</p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_order_status_email(to_email: str, order_id: str, status: str, details: dict) -> dict:
    """Send order status update to user"""
    status_messages = {
        'processing': 'Your order is now being processed.',
        'completed': 'Great news! Your order has been completed.',
        'cancelled': 'Your order has been cancelled.'
    }
    
    subject = f"Order Update - #{order_id}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <h1 style="color: #273A52;">Order Update</h1>
        <p>{status_messages.get(status, 'Your order status has been updated.')}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Order ID:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">#{order_id}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Status:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; text-transform: uppercase;">{status}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Asset:</td>
                <td style="padding: 10px;">{details.get('quantity', 'N/A')} {details.get('asset', 'N/A')}</td>
            </tr>
        </table>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

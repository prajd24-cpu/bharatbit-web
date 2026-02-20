import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import resend
from typing import Optional

class EmailService:
    def __init__(self):
        self.provider = os.getenv('EMAIL_PROVIDER', 'mock')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@bharatbit.com')
        self.from_name = os.getenv('FROM_NAME', 'BharatBit OTC Desk')
        
        if self.provider == 'sendgrid':
            api_key = os.getenv('SENDGRID_API_KEY')
            if api_key:
                self.sg = SendGridAPIClient(api_key)
        
        elif self.provider == 'resend':
            api_key = os.getenv('RESEND_API_KEY')
            if api_key:
                resend.api_key = api_key
    
    async def send_email(self, to_email: str, subject: str, html_content: str) -> dict:
        """Send email via configured provider"""
        
        # Mock mode
        if self.provider == 'mock':
            print(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
            return {"success": True, "provider": "mock"}
        
        # SendGrid
        if self.provider == 'sendgrid':
            try:
                message = Mail(
                    from_email=(self.from_email, self.from_name),
                    to_emails=to_email,
                    subject=subject,
                    html_content=html_content
                )
                response = self.sg.send(message)
                return {"success": True, "provider": "sendgrid", "status_code": response.status_code}
            except Exception as e:
                print(f"SendGrid Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        # Resend
        elif self.provider == 'resend':
            try:
                params = {
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content
                }
                email = resend.Emails.send(params)
                return {"success": True, "provider": "resend", "email_id": email['id']}
            except Exception as e:
                print(f"Resend Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No email provider configured"}

# Global instance
email_service = EmailService()

# Email Templates
async def send_welcome_email(to_email: str, name: str) -> dict:
    subject = "Welcome to BharatBit OTC Desk"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Welcome to BharatBit OTC Desk</h1>
        <p>Dear {name},</p>
        <p>Thank you for registering with BharatBit OTC Desk - India's premium crypto trading platform.</p>
        <p>Next steps:</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">KYC Approved!</h1>
        <p>Dear {name},</p>
        <p>Great news! Your KYC has been approved.</p>
        <p>You can now start placing orders on BharatBit OTC Desk.</p>
        <p style="margin-top: 30px;">
            <a href="https://app.bharatbit.com" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Trading</a>
        </p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_kyc_rejection_email(to_email: str, name: str, reason: str) -> dict:
    subject = "KYC Verification - Additional Information Required"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">KYC Requires Attention</h1>
        <p>Dear {name},</p>
        <p>We need additional information to complete your KYC verification.</p>
        <p><strong>Reason:</strong> {reason}</p>
        <p>Please resubmit your KYC with the correct information.</p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_order_confirmation_email(to_email: str, order_id: str, details: dict) -> dict:
    subject = f"Order Confirmation #{order_id}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #E54444;">Order Confirmation</h1>
        <p>Your order has been placed successfully.</p>
        <p><strong>Order ID:</strong> #{order_id}</p>
        <p><strong>Type:</strong> {details['type'].upper()}</p>
        <p><strong>Asset:</strong> {details['asset']}</p>
        <p><strong>Quantity:</strong> {details['quantity']}</p>
        <p><strong>Total:</strong> ₹{details['total']}</p>
        <p style="margin-top: 20px;">We'll notify you once the order is processed.</p>
    </div>
    """
    return await email_service.send_email(to_email, subject, html)

async def send_otp_email(to_email: str, otp: str) -> dict:
    """Send OTP via email for registration/verification"""
    subject = "Your BharatBit OTP Code"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #273A52; margin-bottom: 10px;">BharatBit OTC Desk</h1>
            <p style="color: #5A6C7D; font-size: 14px;">Verification Code</p>
        </div>
        
        <div style="background: #F8F9FA; border-left: 4px solid #E54444; padding: 20px; margin: 20px 0;">
            <p style="color: #273A52; margin: 0 0 10px 0;">Your verification code is:</p>
            <h2 style="color: #E54444; font-size: 36px; letter-spacing: 8px; margin: 10px 0;">{otp}</h2>
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

import os
import httpx
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class MSG91Service:
    """MSG91 SMS OTP Service for sending OTP to mobile numbers"""
    
    def __init__(self):
        self.auth_key = os.getenv('MSG91_AUTH_KEY')
        self.sender_id = os.getenv('MSG91_SENDER_ID', 'BBITOT')
        self.route = os.getenv('MSG91_ROUTE', '4')
        self.base_url = "https://control.msg91.com/api/v5"
        self.timeout = 30.0
        
        if self.auth_key and self.auth_key != 'your_msg91_auth_key_here':
            self.is_configured = True
        else:
            self.is_configured = False
            logger.warning("MSG91 not configured. SMS will be in mock mode.")
    
    async def send_otp(self, phone_number: str, otp: str) -> Dict[str, Any]:
        """
        Send OTP via SMS using MSG91
        
        Args:
            phone_number: Phone number with country code (e.g., +919876543210)
            otp: The OTP code to send
            
        Returns:
            Dictionary with success status and details
        """
        if not self.is_configured:
            logger.info(f"[MOCK SMS] OTP {otp} would be sent to {phone_number}")
            return {"success": True, "provider": "mock", "message": "SMS would be sent (mock mode)"}
        
        try:
            # Clean phone number - remove + if present
            clean_number = phone_number.lstrip('+')
            
            # MSG91 OTP API endpoint
            url = f"{self.base_url}/otp"
            
            params = {
                "authkey": self.auth_key,
                "mobile": clean_number,
                "otp": otp,
                "sender": self.sender_id,
                "otp_expiry": 10,  # 10 minutes expiry
                "otp_length": 6
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, params=params)
                
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get("type") == "success":
                logger.info(f"OTP sent successfully to {phone_number}")
                return {
                    "success": True,
                    "provider": "msg91",
                    "request_id": response_data.get("request_id"),
                    "message": "OTP sent successfully"
                }
            else:
                error_msg = response_data.get("message", "Unknown error")
                logger.error(f"MSG91 Error: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "provider": "msg91"
                }
                
        except httpx.TimeoutException:
            logger.error(f"Timeout sending OTP to {phone_number}")
            return {"success": False, "error": "Request timeout", "provider": "msg91"}
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            return {"success": False, "error": str(e), "provider": "msg91"}
    
    async def verify_otp(self, phone_number: str, otp: str) -> Dict[str, Any]:
        """
        Verify OTP using MSG91's verification API
        
        Note: We're using our own OTP verification in the backend,
        but this can be used for MSG91's built-in verification if needed.
        """
        if not self.is_configured:
            return {"success": True, "provider": "mock"}
        
        try:
            clean_number = phone_number.lstrip('+')
            url = f"{self.base_url}/otp/verify"
            
            params = {
                "authkey": self.auth_key,
                "mobile": clean_number,
                "otp": otp
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                
            response_data = response.json()
            
            if response_data.get("type") == "success":
                return {"success": True, "provider": "msg91"}
            else:
                return {
                    "success": False,
                    "error": response_data.get("message", "Invalid OTP"),
                    "provider": "msg91"
                }
                
        except Exception as e:
            logger.error(f"Error verifying OTP: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def resend_otp(self, phone_number: str) -> Dict[str, Any]:
        """Resend OTP to phone number"""
        if not self.is_configured:
            return {"success": True, "provider": "mock"}
        
        try:
            clean_number = phone_number.lstrip('+')
            url = f"{self.base_url}/otp/retry"
            
            params = {
                "authkey": self.auth_key,
                "mobile": clean_number,
                "retrytype": "text"  # or "voice" for voice call
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, params=params)
                
            response_data = response.json()
            
            if response_data.get("type") == "success":
                return {"success": True, "provider": "msg91"}
            else:
                return {"success": False, "error": response_data.get("message")}
                
        except Exception as e:
            logger.error(f"Error resending OTP: {str(e)}")
            return {"success": False, "error": str(e)}

# Global instance
sms_service = MSG91Service()

# Helper functions
async def send_sms_otp(phone_number: str, otp: str) -> Dict[str, Any]:
    """Send OTP via SMS"""
    return await sms_service.send_otp(phone_number, otp)

async def verify_sms_otp(phone_number: str, otp: str) -> Dict[str, Any]:
    """Verify SMS OTP"""
    return await sms_service.verify_otp(phone_number, otp)

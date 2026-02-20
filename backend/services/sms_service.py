import os
from twilio.rest import Client
import requests
from typing import Optional

class SMSService:
    def __init__(self):
        self.provider = os.getenv('SMS_PROVIDER', 'mock')
        
        if self.provider == 'twilio':
            self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
            if self.account_sid and self.auth_token:
                self.client = Client(self.account_sid, self.auth_token)
        
        elif self.provider == 'msg91':
            self.auth_key = os.getenv('MSG91_AUTH_KEY')
            self.sender_id = os.getenv('MSG91_SENDER_ID', 'BHRTBT')
            self.route = os.getenv('MSG91_ROUTE', '4')
    
    async def send_sms(self, mobile: str, message: str) -> dict:
        """Send SMS via configured provider"""
        
        # Mock mode - for development
        if self.provider == 'mock':
            print(f"[MOCK SMS] To: {mobile}, Message: {message}")
            return {"success": True, "provider": "mock", "message_id": "mock-123"}
        
        # Twilio
        if self.provider == 'twilio':
            try:
                message = self.client.messages.create(
                    body=message,
                    from_=self.phone_number,
                    to=f"+91{mobile}"  # India country code
                )
                return {"success": True, "provider": "twilio", "message_id": message.sid}
            except Exception as e:
                print(f"Twilio SMS Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        # MSG91
        elif self.provider == 'msg91':
            try:
                url = f"https://api.msg91.com/api/v5/flow/"
                headers = {
                    "authkey": self.auth_key,
                    "content-type": "application/json"
                }
                payload = {
                    "sender": self.sender_id,
                    "route": self.route,
                    "country": "91",
                    "sms": [
                        {
                            "message": message,
                            "to": [mobile]
                        }
                    ]
                }
                response = requests.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    return {"success": True, "provider": "msg91", "response": response.json()}
                else:
                    return {"success": False, "error": response.text}
            except Exception as e:
                print(f"MSG91 SMS Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No SMS provider configured"}

# Global instance
sms_service = SMSService()

async def send_otp_sms(mobile: str, otp: str) -> dict:
    """Send OTP SMS"""
    message = f"Your BharatBit OTP is: {otp}. Valid for 10 minutes. Do not share with anyone."
    return await sms_service.send_sms(mobile, message)

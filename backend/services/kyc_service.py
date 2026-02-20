import os
import requests
from typing import Optional, Dict

class KYCService:
    def __init__(self):
        self.provider = os.getenv('KYC_PROVIDER', 'mock')
        
        if self.provider == 'signzy':
            self.api_key = os.getenv('SIGNZY_API_KEY')
            self.base_url = os.getenv('SIGNZY_BASE_URL', 'https://api.signzy.tech')
            self.headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
    
    async def verify_pan(self, pan_number: str) -> Dict:
        """Verify PAN card"""
        
        # Mock verification
        if self.provider == 'mock':
            print(f"[MOCK KYC] Verifying PAN: {pan_number}")
            return {
                "success": True,
                "provider": "mock",
                "pan_number": pan_number,
                "name": "Test User",
                "status": "valid"
            }
        
        # Signzy PAN verification
        if self.provider == 'signzy':
            try:
                url = f"{self.base_url}/api/v3/patrons/pan"
                payload = {"panNumber": pan_number}
                response = requests.post(url, json=payload, headers=self.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "provider": "signzy",
                        "data": data
                    }
                else:
                    return {"success": False, "error": response.text}
            except Exception as e:
                print(f"Signzy PAN Verification Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No KYC provider configured"}
    
    async def verify_aadhaar(self, aadhaar_number: str, consent: bool = True) -> Dict:
        """Verify Aadhaar (requires user consent)"""
        
        if not consent:
            return {"success": False, "error": "User consent required for Aadhaar verification"}
        
        # Mock verification
        if self.provider == 'mock':
            print(f"[MOCK KYC] Verifying Aadhaar: {aadhaar_number}")
            return {
                "success": True,
                "provider": "mock",
                "aadhaar_number": aadhaar_number,
                "status": "valid"
            }
        
        # Signzy Aadhaar verification
        if self.provider == 'signzy':
            try:
                url = f"{self.base_url}/api/v3/patrons/aadhaar"
                payload = {
                    "aadhaarNumber": aadhaar_number,
                    "consent": "Y"
                }
                response = requests.post(url, json=payload, headers=self.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "provider": "signzy",
                        "data": data
                    }
                else:
                    return {"success": False, "error": response.text}
            except Exception as e:
                print(f"Signzy Aadhaar Verification Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No KYC provider configured"}
    
    async def verify_bank_account(self, account_number: str, ifsc: str, name: str) -> Dict:
        """Verify bank account via penny drop"""
        
        # Mock verification
        if self.provider == 'mock':
            print(f"[MOCK KYC] Verifying Bank: {account_number}")
            return {
                "success": True,
                "provider": "mock",
                "account_number": account_number,
                "account_holder_name": name,
                "status": "valid"
            }
        
        # Signzy Bank Account verification
        if self.provider == 'signzy':
            try:
                url = f"{self.base_url}/api/v3/patrons/bankaccount"
                payload = {
                    "accountNumber": account_number,
                    "ifsc": ifsc,
                    "nameAsPerBank": name
                }
                response = requests.post(url, json=payload, headers=self.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "provider": "signzy",
                        "data": data
                    }
                else:
                    return {"success": False, "error": response.text}
            except Exception as e:
                print(f"Signzy Bank Verification Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No KYC provider configured"}

# Global instance
kyc_service = KYCService()

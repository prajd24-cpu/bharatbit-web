import os
import razorpay
import hmac
import hashlib
from typing import Dict, Optional

class PaymentService:
    def __init__(self):
        self.provider = os.getenv('PAYMENT_PROVIDER', 'mock')
        
        if self.provider == 'razorpay':
            key_id = os.getenv('RAZORPAY_KEY_ID')
            key_secret = os.getenv('RAZORPAY_KEY_SECRET')
            if key_id and key_secret:
                self.client = razorpay.Client(auth=(key_id, key_secret))
                self.webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET')
    
    async def generate_upi_qr(self, order_id: str, amount: float, description: str) -> Dict:
        """Generate dynamic UPI QR code for order"""
        
        # Mock QR generation
        if self.provider == 'mock':
            upi_id = os.getenv('UPI_ID', 'bharatbit@hdfc')
            # UPI string format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>
            upi_string = f"upi://pay?pa={upi_id}&pn=BharatBit OTC&am={amount}&tn=Order {order_id}"
            return {
                "success": True,
                "provider": "mock",
                "upi_string": upi_string,
                "upi_id": upi_id
            }
        
        # Razorpay QR code
        if self.provider == 'razorpay':
            try:
                qr_data = {
                    "type": "upi_qr",
                    "name": "BharatBit OTC Desk",
                    "usage": "single_use",
                    "fixed_amount": True,
                    "payment_amount": int(amount * 100),  # Convert to paise
                    "description": description,
                    "customer_id": order_id,
                    "close_by": int((datetime.now() + timedelta(hours=24)).timestamp())
                }
                
                qr_code = self.client.qr_code.create(data=qr_data)
                return {
                    "success": True,
                    "provider": "razorpay",
                    "qr_code_id": qr_code['id'],
                    "image_url": qr_code['image_url'],
                    "payment_amount": qr_code['payment_amount']
                }
            except Exception as e:
                print(f"Razorpay QR Error: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "No payment provider configured"}
    
    async def verify_webhook_signature(self, payload: dict, signature: str) -> bool:
        """Verify Razorpay webhook signature"""
        
        if self.provider != 'razorpay':
            return True  # Skip verification for mock
        
        try:
            # Razorpay webhook signature verification
            body = str(payload)
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                body.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            print(f"Webhook verification error: {str(e)}")
            return False
    
    async def handle_payment_webhook(self, event_type: str, payload: dict) -> Dict:
        """Handle payment webhook events"""
        
        # Payment successful
        if event_type == 'payment.captured':
            payment_id = payload.get('id')
            order_id = payload.get('notes', {}).get('order_id')
            amount = payload.get('amount') / 100  # Convert from paise
            
            return {
                "success": True,
                "event": "payment_captured",
                "payment_id": payment_id,
                "order_id": order_id,
                "amount": amount
            }
        
        # Payment failed
        elif event_type == 'payment.failed':
            payment_id = payload.get('id')
            error_reason = payload.get('error_description')
            
            return {
                "success": False,
                "event": "payment_failed",
                "payment_id": payment_id,
                "error": error_reason
            }
        
        return {"success": False, "error": "Unknown event type"}

# Global instance
payment_service = PaymentService()

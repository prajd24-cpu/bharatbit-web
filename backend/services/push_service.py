import os
import logging
import httpx
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Expo Push Notification endpoint
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

class PushNotificationService:
    """
    Expo Push Notification Service
    
    To use this service:
    1. Users must have expo-notifications installed in the app
    2. Users must register their push token with the backend
    3. Store push tokens in the database for each user
    """
    
    def __init__(self):
        self.enabled = os.getenv('PUSH_NOTIFICATIONS_ENABLED', 'true').lower() == 'true'
    
    async def send_push_notification(
        self,
        push_tokens: List[str],
        title: str,
        body: str,
        data: Optional[dict] = None
    ) -> dict:
        """
        Send push notification to multiple devices
        
        Args:
            push_tokens: List of Expo push tokens (format: ExponentPushToken[xxx])
            title: Notification title
            body: Notification body text
            data: Optional data payload
        """
        if not self.enabled:
            logger.info(f"[MOCK PUSH] Title: {title}, Body: {body}")
            return {"success": True, "provider": "mock"}
        
        if not push_tokens:
            return {"success": False, "error": "No push tokens provided"}
        
        # Filter valid Expo push tokens
        valid_tokens = [t for t in push_tokens if t and t.startswith("ExponentPushToken")]
        
        if not valid_tokens:
            logger.warning("No valid Expo push tokens found")
            return {"success": False, "error": "No valid push tokens"}
        
        messages = []
        for token in valid_tokens:
            message = {
                "to": token,
                "sound": "default",
                "title": title,
                "body": body,
                "priority": "high"
            }
            if data:
                message["data"] = data
            messages.append(message)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    EXPO_PUSH_URL,
                    json=messages,
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Push notification sent: {result}")
                    return {"success": True, "result": result}
                else:
                    logger.error(f"Push notification failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Push notification error: {str(e)}")
            return {"success": False, "error": str(e)}

# Global instance
push_service = PushNotificationService()

# ==================== NOTIFICATION HELPERS ====================

async def notify_kyc_approved(push_tokens: List[str], user_name: str = "User") -> dict:
    """Send push notification when KYC is approved"""
    return await push_service.send_push_notification(
        push_tokens=push_tokens,
        title="KYC Approved! 🎉",
        body=f"Congratulations {user_name}! Your KYC has been approved. You can now start trading.",
        data={"type": "kyc_approved", "screen": "dashboard"}
    )

async def notify_kyc_rejected(push_tokens: List[str], reason: str = "") -> dict:
    """Send push notification when KYC is rejected"""
    return await push_service.send_push_notification(
        push_tokens=push_tokens,
        title="KYC Requires Attention",
        body=f"Your KYC needs additional information. Please check the app for details.",
        data={"type": "kyc_rejected", "screen": "kyc", "reason": reason}
    )

async def notify_order_status_update(
    push_tokens: List[str],
    order_id: str,
    status: str,
    asset: str = "",
    quantity: float = 0
) -> dict:
    """Send push notification for order status updates"""
    
    status_messages = {
        "payment_confirmed": f"Payment received for order #{order_id}. Processing your order.",
        "processing": f"Order #{order_id} is being processed.",
        "completed": f"Order #{order_id} completed! {quantity} {asset} has been credited.",
        "cancelled": f"Order #{order_id} has been cancelled."
    }
    
    body = status_messages.get(status, f"Order #{order_id} status updated to {status}")
    
    return await push_service.send_push_notification(
        push_tokens=push_tokens,
        title=f"Order Update",
        body=body,
        data={"type": "order_update", "order_id": order_id, "status": status, "screen": "orders"}
    )

async def notify_new_rate_available(push_tokens: List[str], asset: str, rate: float) -> dict:
    """Send push notification for rate updates (optional feature)"""
    return await push_service.send_push_notification(
        push_tokens=push_tokens,
        title=f"{asset} Rate Updated",
        body=f"New {asset} rate available: ₹{rate:,.2f}",
        data={"type": "rate_update", "asset": asset, "screen": "dashboard"}
    )

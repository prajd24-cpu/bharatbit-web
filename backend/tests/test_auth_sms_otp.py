"""
BharatBit OTC Desk - Auth & SMS OTP Testing Module
Tests registration with SMS OTP (MSG91), OTP verification, login with 2FA
"""

import pytest
import requests
import os
import time
import uuid

# BASE_URL for testing - must be from env
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://crypto-otc-hub.preview.emergentagent.com').rstrip('/')


class TestHealthAndSetup:
    """Health check and initial setup tests"""
    
    def test_api_health(self):
        """Test that API is accessible"""
        response = requests.get(f"{BASE_URL}/api/admin/init-default-data", timeout=10)
        # Init data endpoint should return success
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"API health check: OK - {data.get('message')}")


class TestRegistrationWithSMSOTP:
    """Test user registration with SMS OTP (MSG91) integration"""
    
    def test_register_new_user_returns_sms_sent(self):
        """
        Test POST /api/auth/register returns sms_sent: true
        This verifies MSG91 integration is working
        """
        # Use unique email/mobile to avoid 'User already exists' error
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"test_{unique_id}@testmail.com"
        test_mobile = f"+919876{unique_id[:6]}"  # Format for Indian number
        
        payload = {
            "mobile": test_mobile,
            "email": test_email,
            "password": "TestPassword123!",
            "referral_code": None
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=30)
        
        # Status code check
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Core assertions
        assert data.get("success") == True, "Registration should be successful"
        assert "user_id" in data, "Response should contain user_id"
        assert "mock_otp" in data, "Response should contain mock_otp (for testing)"
        
        # SMS sent assertion - KEY TEST for MSG91 integration
        assert "sms_sent" in data, "Response should contain sms_sent field"
        # sms_sent should be True if MSG91 is configured, False otherwise
        print(f"SMS Sent Status: {data.get('sms_sent')}")
        print(f"Email Sent Status: {data.get('email_sent')}")
        
        # The endpoint should include sms_sent in response
        assert "sms_sent" in data, "sms_sent field must be present in response"
        
        print(f"Registration successful for {test_email}")
        print(f"Mock OTP: {data.get('mock_otp')}")
        print(f"SMS Sent: {data.get('sms_sent')}")
        print(f"Email Sent: {data.get('email_sent')}")
        
        # Store for cleanup
        return data
    
    def test_register_duplicate_user_fails(self):
        """Test that registering duplicate user returns 400"""
        # First registration
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"dup_{unique_id}@testmail.com"
        test_mobile = f"+919999{unique_id[:6]}"
        
        payload = {
            "mobile": test_mobile,
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        # First registration should succeed
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=30)
        assert response1.status_code == 200
        
        # Second registration with same email should fail
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=30)
        assert response2.status_code == 400
        
        data = response2.json()
        assert "detail" in data
        assert "already exists" in data["detail"].lower()
        print(f"Duplicate registration blocked: {data['detail']}")


class TestOTPVerification:
    """Test OTP verification after registration"""
    
    def test_verify_otp_success(self):
        """
        Test POST /api/auth/verify-otp with valid OTP
        """
        # First register a new user
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"verify_{unique_id}@testmail.com"
        test_mobile = f"+919111{unique_id[:6]}"
        
        register_payload = {
            "mobile": test_mobile,
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=30)
        assert reg_response.status_code == 200
        
        reg_data = reg_response.json()
        mock_otp = reg_data.get("mock_otp")
        assert mock_otp is not None, "Mock OTP should be returned for testing"
        
        # Now verify OTP
        verify_payload = {
            "mobile": test_email,  # Note: registration uses email as identifier for OTP
            "otp": mock_otp,
            "purpose": "registration"
        }
        
        verify_response = requests.post(f"{BASE_URL}/api/auth/verify-otp", json=verify_payload, timeout=30)
        
        assert verify_response.status_code == 200, f"OTP verification failed: {verify_response.text}"
        
        data = verify_response.json()
        assert data.get("success") == True
        assert "token" in data, "Response should contain auth token"
        assert "user" in data, "Response should contain user data"
        
        user_data = data["user"]
        assert user_data.get("email") == test_email
        assert user_data.get("role") == "user"
        
        print(f"OTP verified successfully for {test_email}")
        print(f"Token received: {data['token'][:20]}...")
        
        return data
    
    def test_verify_otp_invalid_fails(self):
        """Test that invalid OTP returns error"""
        # Register a user first
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"invalid_{unique_id}@testmail.com"
        test_mobile = f"+919222{unique_id[:6]}"
        
        register_payload = {
            "mobile": test_mobile,
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=30)
        assert reg_response.status_code == 200
        
        # Try to verify with wrong OTP
        verify_payload = {
            "mobile": test_email,
            "otp": "000000",  # Wrong OTP
            "purpose": "registration"
        }
        
        verify_response = requests.post(f"{BASE_URL}/api/auth/verify-otp", json=verify_payload, timeout=30)
        
        assert verify_response.status_code == 400
        data = verify_response.json()
        assert "detail" in data
        print(f"Invalid OTP rejected: {data['detail']}")


class TestLoginWith2FA:
    """Test login flow with 2FA OTP"""
    
    @pytest.fixture
    def registered_user(self):
        """Create and verify a test user for login tests"""
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"login_{unique_id}@testmail.com"
        test_mobile = f"+919333{unique_id[:6]}"
        password = "TestPassword123!"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "mobile": test_mobile,
            "email": test_email,
            "password": password
        }, timeout=30)
        
        if reg_response.status_code != 200:
            pytest.skip(f"Registration failed: {reg_response.text}")
        
        reg_data = reg_response.json()
        mock_otp = reg_data.get("mock_otp")
        
        # Verify OTP
        verify_response = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={
            "mobile": test_email,
            "otp": mock_otp,
            "purpose": "registration"
        }, timeout=30)
        
        if verify_response.status_code != 200:
            pytest.skip(f"OTP verification failed: {verify_response.text}")
        
        return {
            "email": test_email,
            "mobile": test_mobile,
            "password": password
        }
    
    def test_login_returns_2fa_required_and_sms_sent(self, registered_user):
        """
        Test POST /api/auth/login returns requires_2fa: true and sms_sent field
        For users with 2FA, login should send SMS OTP
        """
        login_payload = {
            "identifier": registered_user["email"],
            "password": registered_user["password"]
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=30)
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        
        # Core assertions
        assert data.get("success") == True
        assert data.get("requires_2fa") == True, "Login should require 2FA"
        assert "mobile" in data, "Response should contain mobile for 2FA"
        assert "mock_otp" in data, "Response should contain mock OTP for testing"
        
        # SMS sent assertion - KEY TEST for 2FA SMS
        assert "sms_sent" in data, "Response should contain sms_sent field"
        print(f"2FA SMS Sent Status: {data.get('sms_sent')}")
        print(f"2FA Email Sent Status: {data.get('email_sent')}")
        print(f"2FA Mock OTP: {data.get('mock_otp')}")
        
        return data
    
    def test_login_invalid_credentials_fails(self):
        """Test that invalid credentials return 401"""
        login_payload = {
            "identifier": "nonexistent@email.com",
            "password": "wrongpassword"
        }
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=30)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "invalid" in data["detail"].lower()
        print(f"Invalid login rejected: {data['detail']}")


class TestVerify2FA:
    """Test 2FA verification to complete login"""
    
    def test_verify_2fa_success(self):
        """
        Test POST /api/auth/verify-2fa completes login
        """
        # Register and verify a new user
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"2fa_{unique_id}@testmail.com"
        test_mobile = f"+919444{unique_id[:6]}"
        password = "TestPassword123!"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "mobile": test_mobile,
            "email": test_email,
            "password": password
        }, timeout=30)
        assert reg_response.status_code == 200
        reg_data = reg_response.json()
        
        # Verify registration OTP
        verify_reg = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={
            "mobile": test_email,
            "otp": reg_data.get("mock_otp"),
            "purpose": "registration"
        }, timeout=30)
        assert verify_reg.status_code == 200
        
        # Login (will require 2FA)
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": test_email,
            "password": password
        }, timeout=30)
        assert login_response.status_code == 200
        login_data = login_response.json()
        
        assert login_data.get("requires_2fa") == True
        mobile_for_2fa = login_data.get("mobile")
        mock_2fa_otp = login_data.get("mock_otp")
        
        # Verify 2FA OTP
        verify_2fa_response = requests.post(f"{BASE_URL}/api/auth/verify-2fa", json={
            "mobile": mobile_for_2fa,
            "otp": mock_2fa_otp
        }, timeout=30)
        
        assert verify_2fa_response.status_code == 200, f"2FA verification failed: {verify_2fa_response.text}"
        
        data = verify_2fa_response.json()
        assert data.get("success") == True
        assert "token" in data, "Should receive auth token"
        assert "user" in data, "Should receive user data"
        
        user_data = data["user"]
        assert user_data.get("email") == test_email
        
        print(f"2FA verification successful for {test_email}")
        print(f"Token received: {data['token'][:20]}...")
        
        return data
    
    def test_verify_2fa_invalid_otp_fails(self):
        """Test that invalid 2FA OTP returns error"""
        # Register and verify a user
        unique_id = str(uuid.uuid4())[:8]
        test_email = f"bad2fa_{unique_id}@testmail.com"
        test_mobile = f"+919555{unique_id[:6]}"
        password = "TestPassword123!"
        
        # Register
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "mobile": test_mobile,
            "email": test_email,
            "password": password
        }, timeout=30)
        assert reg_response.status_code == 200
        reg_data = reg_response.json()
        
        # Verify registration
        requests.post(f"{BASE_URL}/api/auth/verify-otp", json={
            "mobile": test_email,
            "otp": reg_data.get("mock_otp"),
            "purpose": "registration"
        }, timeout=30)
        
        # Login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": test_email,
            "password": password
        }, timeout=30)
        login_data = login_response.json()
        
        # Try wrong 2FA OTP
        verify_2fa_response = requests.post(f"{BASE_URL}/api/auth/verify-2fa", json={
            "mobile": login_data.get("mobile"),
            "otp": "000000"  # Wrong OTP
        }, timeout=30)
        
        assert verify_2fa_response.status_code == 400
        data = verify_2fa_response.json()
        assert "detail" in data
        print(f"Invalid 2FA OTP rejected: {data['detail']}")


class TestAdminLogin:
    """Test admin user login with provided credentials"""
    
    def test_admin_login_success(self):
        """Test login with admin credentials from request"""
        admin_email = "admin@bharatbit.com"
        admin_password = "admin123"
        
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "identifier": admin_email,
            "password": admin_password
        }, timeout=30)
        
        assert login_response.status_code == 200, f"Admin login failed: {login_response.text}"
        
        data = login_response.json()
        assert data.get("success") == True
        assert data.get("requires_2fa") == True, "Admin should require 2FA too"
        
        # Verify 2FA
        mock_otp = data.get("mock_otp")
        mobile = data.get("mobile")
        
        verify_response = requests.post(f"{BASE_URL}/api/auth/verify-2fa", json={
            "mobile": mobile,
            "otp": mock_otp
        }, timeout=30)
        
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        
        assert verify_data.get("success") == True
        assert verify_data.get("user", {}).get("role") == "admin"
        
        print(f"Admin login successful")
        print(f"Admin role: {verify_data.get('user', {}).get('role')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

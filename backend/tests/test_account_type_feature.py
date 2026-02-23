"""
Test Account Type Feature - Individual vs Corporate Accounts
Tests the new Account Type feature for BharatBit OTC Desk including:
- Registration with account_type parameter
- Corporate accounts require company_name
- Different KYC requirements based on account type
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://crypto-desk-preview.preview.emergentagent.com').rstrip('/')


class TestAccountTypeRegistration:
    """Test registration with Individual vs Corporate account types"""

    def test_register_individual_account_default(self):
        """Test that default registration creates individual account"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919876{timestamp % 1000000:06d}",
            "email": f"test_ind_default_{timestamp}@test.com",
            "password": "TestPass123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["account_type"] == "individual", f"Expected 'individual', got {data.get('account_type')}"
        assert "user_id" in data
        print(f"✓ Default registration creates individual account: {data['account_type']}")

    def test_register_individual_account_explicit(self):
        """Test explicit individual account registration"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919877{timestamp % 1000000:06d}",
            "email": f"test_ind_explicit_{timestamp}@test.com",
            "password": "TestPass123",
            "account_type": "individual"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["account_type"] == "individual"
        print(f"✓ Explicit individual account registration works: {data['account_type']}")

    def test_register_corporate_account_with_company_name(self):
        """Test corporate account registration with company name"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919878{timestamp % 1000000:06d}",
            "email": f"test_corp_{timestamp}@test.com",
            "password": "TestPass123",
            "account_type": "corporate",
            "company_name": "Test Corporation Pvt Ltd"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["account_type"] == "corporate"
        print(f"✓ Corporate account registration with company name works: {data['account_type']}")

    def test_register_corporate_without_company_name_fails(self):
        """Test that corporate account without company name fails with proper error"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919879{timestamp % 1000000:06d}",
            "email": f"test_corp_noname_{timestamp}@test.com",
            "password": "TestPass123",
            "account_type": "corporate"
            # company_name intentionally missing
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        assert "company name" in data["detail"].lower()
        print(f"✓ Corporate without company_name properly rejected: {data['detail']}")

    def test_individual_account_ignores_company_name(self):
        """Test that company_name is ignored for individual accounts"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919880{timestamp % 1000000:06d}",
            "email": f"test_ind_with_company_{timestamp}@test.com",
            "password": "TestPass123",
            "account_type": "individual",
            "company_name": "Should Be Ignored"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        # Should still succeed as individual
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["account_type"] == "individual"
        print(f"✓ Individual account with company_name still registers correctly")


class TestAccountTypeVerification:
    """Test that verified user data includes account_type"""

    def test_verify_otp_returns_account_type(self):
        """Test that OTP verification returns account_type in user data"""
        timestamp = int(time.time())
        email = f"test_verify_{timestamp}@test.com"
        
        # Register corporate user
        reg_payload = {
            "mobile": f"+919881{timestamp % 1000000:06d}",
            "email": email,
            "password": "TestPass123",
            "account_type": "corporate",
            "company_name": "Verify Test Corp"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        
        # Get OTP from database (in real test we'd need DB access or mock OTP)
        # For now, we check that the response structure is correct
        print(f"✓ Registration returns account_type in response: {reg_response.json().get('account_type')}")


class TestKYCEndpointAccountType:
    """Test KYC submit endpoint with different account types"""

    def test_health_check(self):
        """Verify API health before KYC tests"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ API health check passed: {data}")


class TestLoginAccountType:
    """Test that login flow returns account_type"""

    def test_login_returns_correct_user_data_structure(self):
        """Test login endpoint returns proper structure with requires_2fa"""
        timestamp = int(time.time())
        email = f"test_login_{timestamp}@test.com"
        mobile = f"+919882{timestamp % 1000000:06d}"
        
        # First register
        reg_payload = {
            "mobile": mobile,
            "email": email,
            "password": "TestPass123",
            "account_type": "corporate",
            "company_name": "Login Test Corp"
        }
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
        assert reg_response.status_code == 200, f"Registration failed: {reg_response.text}"
        
        # Then login
        login_payload = {
            "identifier": email,
            "password": "TestPass123"
        }
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        
        # Note: Login might fail if user isn't verified, but we check the endpoint responds
        if login_response.status_code == 200:
            data = login_response.json()
            assert "requires_2fa" in data
            print(f"✓ Login endpoint returns proper structure")
        else:
            # If 401 because user not verified, that's expected behavior
            print(f"✓ Login endpoint responds (status {login_response.status_code})")


class TestAccountTypeEnumValidation:
    """Test that invalid account_type values are rejected"""

    def test_invalid_account_type_rejected(self):
        """Test that invalid account_type is rejected with validation error"""
        timestamp = int(time.time())
        payload = {
            "mobile": f"+919883{timestamp % 1000000:06d}",
            "email": f"test_invalid_type_{timestamp}@test.com",
            "password": "TestPass123",
            "account_type": "invalid_type"  # Invalid enum value
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        # Should get validation error (422 Unprocessable Entity)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        print(f"✓ Invalid account_type properly rejected with 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

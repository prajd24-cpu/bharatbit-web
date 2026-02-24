#!/usr/bin/env python3
"""
BharatBit OTC Desk Backend API Tests
Test all backend endpoints for functionality, authentication, and data integrity.
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class BharatBitAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.api_base = f"{self.base_url}/api"
        self.admin_token = None
        self.user_token = None
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL" 
        self.test_results.append({
            'test': test_name,
            'status': status,
            'details': details,
            'response_data': response_data
        })
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, token: str = None) -> Dict[str, Any]:
        """Make HTTP request with proper error handling"""
        url = f"{self.api_base}{endpoint}"
        
        # Prepare headers
        request_headers = {"Content-Type": "application/json"}
        if token:
            request_headers["Authorization"] = f"Bearer {token}"
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers, timeout=30)
            else:
                return {"error": f"Unsupported method: {method}", "status_code": 0}
            
            # Parse response
            try:
                response_data = response.json()
                if isinstance(response_data, dict):
                    response_data["status_code"] = response.status_code
                else:
                    # For list responses, wrap in a dict
                    response_data = {"data": response_data, "status_code": response.status_code}
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}
            
            return response_data
            
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status_code": 0}
    
    def test_1_initialize_default_data(self):
        """Initialize default admin user and rates"""
        print("\n=== Test 1: Initialize Default Data ===")
        
        response = self.make_request("POST", "/admin/init-default-data")
        
        if response.get("status_code") == 200 and response.get("success"):
            self.log_test("Initialize Default Data", True, 
                         "Admin user and default rates created successfully")
        else:
            self.log_test("Initialize Default Data", False, 
                         f"Failed to initialize: {response.get('error', 'Unknown error')}", response)
    
    def test_2_admin_login_flow(self):
        """Test admin login with 2FA flow"""
        print("\n=== Test 2: Admin Login & 2FA Flow ===")
        
        # Step 1: Initial login
        login_data = {
            "identifier": "admin@bharatbit.com",
            "password": "admin123"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response.get("status_code") != 200:
            self.log_test("Admin Login - Initial", False, 
                         f"Login failed: {response.get('detail', 'Unknown error')}", response)
            return
        
        if not response.get("requires_2fa"):
            self.log_test("Admin Login - Initial", False, 
                         "Expected requires_2fa=true but got false", response)
            return
        
        mock_otp = response.get("mock_otp")
        mobile = response.get("mobile")
        
        if not mock_otp:
            self.log_test("Admin Login - Initial", False, 
                         "No mock_otp returned", response)
            return
        
        self.log_test("Admin Login - Initial", True, 
                     f"2FA required, got mock OTP: {mock_otp}")
        
        # Step 2: Verify 2FA
        verify_data = {
            "mobile": mobile,
            "otp": mock_otp
        }
        
        response = self.make_request("POST", "/auth/verify-2fa", verify_data)
        
        if response.get("status_code") != 200:
            self.log_test("Admin Login - 2FA Verification", False, 
                         f"2FA verification failed: {response.get('detail', 'Unknown error')}", response)
            return
        
        if not response.get("token"):
            self.log_test("Admin Login - 2FA Verification", False, 
                         "No token returned", response)
            return
        
        self.admin_token = response.get("token")
        user_info = response.get("user", {})
        
        if user_info.get("role") != "admin":
            self.log_test("Admin Login - 2FA Verification", False, 
                         f"Expected admin role but got: {user_info.get('role')}", response)
            return
        
        self.log_test("Admin Login - 2FA Verification", True, 
                     f"Admin authenticated successfully, role: {user_info.get('role')}")
    
    def test_3_default_rates_check(self):
        """Test getting default rates with admin token"""
        print("\n=== Test 3: Default Rates Check ===")
        
        if not self.admin_token:
            self.log_test("Get Default Rates", False, "No admin token available")
            return
        
        response = self.make_request("GET", "/rates", token=self.admin_token)
        
        if response.get("status_code") != 200:
            self.log_test("Get Default Rates", False, 
                         f"Failed to get rates: {response.get('detail', 'Unknown error')}", response)
            return
        
        # Check if we got the expected assets
        if response.get("status_code") != 200:
            self.log_test("Get Default Rates", False, 
                         f"Failed to get rates: {response.get('detail', 'Unknown error')}", response)
            return
        
        rates = response.get("data", []) if "data" in response else (response if isinstance(response, list) else [])
        assets_found = [rate.get("asset") for rate in rates if isinstance(rate, dict)]
        expected_assets = ["USDT", "BTC", "ETH"]
        
        missing_assets = [asset for asset in expected_assets if asset not in assets_found]
        
        if missing_assets:
            self.log_test("Get Default Rates", False, 
                         f"Missing assets: {missing_assets}, Found: {assets_found}", response)
        else:
            self.log_test("Get Default Rates", True, 
                         f"All expected rates found: {assets_found}")
    
    def test_4_user_registration_flow(self):
        """Test new user registration with OTP verification"""
        print("\n=== Test 4: User Registration Flow ===")
        
        # Generate unique user data
        import time
        timestamp = str(int(time.time()))[-6:]
        
        # Step 1: Register new user
        registration_data = {
            "mobile": f"98765{timestamp}",
            "email": f"test{timestamp}@example.com", 
            "password": "Test@123"
        }
        
        response = self.make_request("POST", "/auth/register", registration_data)
        
        if response.get("status_code") != 200:
            self.log_test("User Registration", False, 
                         f"Registration failed: {response.get('detail', 'Unknown error')}", response)
            return
        
        mock_otp = response.get("mock_otp")
        user_id = response.get("user_id")
        
        if not mock_otp:
            self.log_test("User Registration", False, 
                         "No mock_otp returned", response)
            return
        
        self.log_test("User Registration", True, 
                     f"User registered, got mock OTP: {mock_otp}")
        
        # Step 2: Verify OTP
        verify_data = {
            "mobile": registration_data["mobile"],
            "otp": mock_otp,
            "purpose": "registration"
        }
        
        response = self.make_request("POST", "/auth/verify-otp", verify_data)
        
        if response.get("status_code") != 200:
            self.log_test("User OTP Verification", False, 
                         f"OTP verification failed: {response.get('detail', 'Unknown error')}", response)
            return
        
        if not response.get("token"):
            self.log_test("User OTP Verification", False, 
                         "No token returned", response)
            return
        
        self.user_token = response.get("token")
        user_info = response.get("user", {})
        
        self.log_test("User OTP Verification", True, 
                     f"User verified successfully, role: {user_info.get('role')}")
    
    def test_5_admin_kyc_endpoints(self):
        """Test admin KYC-related endpoints"""
        print("\n=== Test 5: Admin KYC Endpoints ===")
        
        if not self.admin_token:
            self.log_test("Admin KYC Endpoints", False, "No admin token available")
            return
        
        # Test GET /api/admin/kyc-pending
        response = self.make_request("GET", "/admin/kyc-pending", token=self.admin_token)
        if response.get("status_code") == 200:
            kyc_data = response.get("data", []) if "data" in response else (response if isinstance(response, list) else [])
            self.log_test("GET /admin/kyc-pending", True, 
                         f"Retrieved {len(kyc_data)} pending KYC records")
        else:
            self.log_test("GET /admin/kyc-pending", False, 
                         f"Failed: {response.get('detail', 'Unknown error')}", response)
        
        # Test GET /api/admin/users
        response = self.make_request("GET", "/admin/users", token=self.admin_token)
        if response.get("status_code") == 200:
            users_data = response.get("data", []) if "data" in response else (response if isinstance(response, list) else [])
            users_count = len(users_data)
            self.log_test("GET /admin/users", True, 
                         f"Retrieved {users_count} users")
        else:
            self.log_test("GET /admin/users", False, 
                         f"Failed: {response.get('detail', 'Unknown error')}", response)
        
        # Test GET /api/admin/analytics
        response = self.make_request("GET", "/admin/analytics", token=self.admin_token)
        if response.get("status_code") == 200:
            analytics = response
            expected_fields = ["total_users", "pending_kyc", "approved_kyc", "total_orders", "pending_orders", "completed_orders"]
            missing_fields = [field for field in expected_fields if field not in analytics]
            
            if missing_fields:
                self.log_test("GET /admin/analytics", False, 
                             f"Missing analytics fields: {missing_fields}", response)
            else:
                self.log_test("GET /admin/analytics", True, 
                             f"Analytics retrieved successfully: {analytics}")
        else:
            self.log_test("GET /admin/analytics", False, 
                         f"Failed: {response.get('detail', 'Unknown error')}", response)
    
    def test_6_payment_details_endpoints(self):
        """Test payment details endpoints (no auth required)"""
        print("\n=== Test 6: Payment Details Endpoints ===")
        
        # Test GET /api/payment/bank-details
        response = self.make_request("GET", "/payment/bank-details")
        if response.get("status_code") == 200:
            required_fields = ["bank_name", "account_holder", "account_number", "ifsc"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test("GET /payment/bank-details", False, 
                             f"Missing fields: {missing_fields}", response)
            else:
                self.log_test("GET /payment/bank-details", True, 
                             f"Bank details retrieved: {response.get('bank_name')}, {response.get('ifsc')}")
        else:
            self.log_test("GET /payment/bank-details", False, 
                         f"Failed: {response.get('detail', 'Unknown error')}", response)
        
        # Test GET /api/payment/upi-details  
        response = self.make_request("GET", "/payment/upi-details")
        if response.get("status_code") == 200:
            if "upi_id" in response:
                self.log_test("GET /payment/upi-details", True, 
                             f"UPI details retrieved: {response.get('upi_id')}")
            else:
                self.log_test("GET /payment/upi-details", False, 
                             "Missing upi_id field", response)
        else:
            self.log_test("GET /payment/upi-details", False, 
                         f"Failed: {response.get('detail', 'Unknown error')}", response)
    
    def test_7_authentication_security(self):
        """Test authentication security - ensure regular users cannot access admin routes"""
        print("\n=== Test 7: Authentication Security ===")
        
        if not self.user_token:
            self.log_test("Authentication Security", False, "No user token available")
            return
        
        # Test that regular user cannot access admin endpoints
        admin_endpoints = [
            "/admin/users",
            "/admin/kyc-pending", 
            "/admin/analytics"
        ]
        
        unauthorized_access = []
        for endpoint in admin_endpoints:
            response = self.make_request("GET", endpoint, token=self.user_token)
            if response.get("status_code") != 403:
                unauthorized_access.append(endpoint)
        
        if unauthorized_access:
            self.log_test("Authentication Security", False, 
                         f"User can access admin endpoints: {unauthorized_access}")
        else:
            self.log_test("Authentication Security", True, 
                         "Regular user properly denied access to admin endpoints")
    
    def test_8_token_validation(self):
        """Test JWT token validation"""
        print("\n=== Test 8: Token Validation ===")
        
        # Test with invalid token
        response = self.make_request("GET", "/rates", token="invalid_token")
        if response.get("status_code") == 401:
            self.log_test("Invalid Token Rejection", True, 
                         "Invalid token properly rejected")
        else:
            self.log_test("Invalid Token Rejection", False, 
                         f"Invalid token not rejected, status: {response.get('status_code')}", response)
        
        # Test with no token on protected endpoint
        response = self.make_request("GET", "/rates")
        if response.get("status_code") == 403:
            self.log_test("No Token Rejection", True, 
                         "Request without token properly rejected")
        else:
            self.log_test("No Token Rejection", False, 
                         f"Request without token not rejected, status: {response.get('status_code')}", response)

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"Starting BharatBit OTC Desk API Tests")
        print(f"Backend URL: {self.api_base}")
        print("=" * 60)
        
        # Run tests in order
        self.test_1_initialize_default_data()
        time.sleep(1)  # Brief pause between tests
        
        self.test_2_admin_login_flow()
        time.sleep(1)
        
        self.test_3_default_rates_check()
        time.sleep(1)
        
        self.test_4_user_registration_flow()
        time.sleep(1)
        
        self.test_5_admin_kyc_endpoints()
        time.sleep(1)
        
        self.test_6_payment_details_endpoints()
        time.sleep(1)
        
        self.test_7_authentication_security()
        time.sleep(1)
        
        self.test_8_token_validation()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for result in self.test_results:
            print(f"{result['status']} - {result['test']}")
            if result['details']:
                print(f"    {result['details']}")
            
            if "PASS" in result['status']:
                passed += 1
            else:
                failed += 1
        
        print(f"\n📊 TOTAL: {len(self.test_results)} tests | ✅ PASSED: {passed} | ❌ FAILED: {failed}")
        
        if failed == 0:
            print("🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
        else:
            print(f"⚠️  {failed} tests failed. Review the failures above.")

def main():
    # Use the production backend URL from frontend .env
    backend_url = "https://crypto-trading-desk.preview.emergentagent.com"
    
    tester = BharatBitAPITester(backend_url)
    tester.run_all_tests()

if __name__ == "__main__":
    main()
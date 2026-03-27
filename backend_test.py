#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class CampusMartAPITester:
    def __init__(self, base_url="https://rental-hub-259.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@campus.edu",
            "password": "TestPass123!",
            "location": "Test Campus"
        }
        
        self.test_item = {
            "title": "Test MacBook Pro",
            "description": "Test laptop for rental testing",
            "category": "electronics",
            "price_per_day": 25.0,
            "deposit": 100.0,
            "location": "Test Campus",
            "condition": "Good"
        }

    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test API health endpoint"""
        success, data = self.make_request('GET', 'health')
        self.log_result("Health Check", success and data.get('status') == 'healthy', 
                       f"Response: {data}", data)
        return success

    def test_user_signup(self):
        """Test user registration"""
        success, data = self.make_request('POST', 'auth/signup', self.test_user)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.user_id = data['user']['id']
            self.log_result("User Signup", True, f"User created with ID: {self.user_id}")
            return True
        else:
            self.log_result("User Signup", False, f"Failed: {data}", data)
            return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        success, data = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.log_result("User Login", True, "Login successful")
            return True
        else:
            self.log_result("User Login", False, f"Failed: {data}", data)
            return False

    def test_get_profile(self):
        """Test get user profile"""
        success, data = self.make_request('GET', 'auth/me')
        
        if success and data.get('email') == self.test_user['email']:
            self.log_result("Get Profile", True, "Profile retrieved successfully")
            return True
        else:
            self.log_result("Get Profile", False, f"Failed: {data}", data)
            return False

    def test_create_item(self):
        """Test creating an item listing"""
        success, data = self.make_request('POST', 'items/', self.test_item, 200)
        
        if success and 'id' in data:
            self.test_item['id'] = data['id']
            self.log_result("Create Item", True, f"Item created with ID: {data['id']}")
            return True
        else:
            self.log_result("Create Item", False, f"Failed: {data}", data)
            return False

    def test_get_items(self):
        """Test getting all items"""
        success, data = self.make_request('GET', 'items')
        
        if success and isinstance(data, list):
            self.log_result("Get Items", True, f"Retrieved {len(data)} items")
            return True
        else:
            self.log_result("Get Items", False, f"Failed: {data}", data)
            return False

    def test_get_featured_items(self):
        """Test getting featured items"""
        success, data = self.make_request('GET', 'items/featured')
        
        if success and isinstance(data, list):
            self.log_result("Get Featured Items", True, f"Retrieved {len(data)} featured items")
            return True
        else:
            self.log_result("Get Featured Items", False, f"Failed: {data}", data)
            return False

    def test_get_my_listings(self):
        """Test getting user's listings"""
        success, data = self.make_request('GET', 'items/my-listings')
        
        if success and isinstance(data, list):
            self.log_result("Get My Listings", True, f"Retrieved {len(data)} listings")
            return True
        else:
            self.log_result("Get My Listings", False, f"Failed: {data}", data)
            return False

    def test_get_item_detail(self):
        """Test getting item details"""
        if not hasattr(self, 'test_item') or 'id' not in self.test_item:
            self.log_result("Get Item Detail", False, "No test item ID available")
            return False
            
        success, data = self.make_request('GET', f'items/{self.test_item["id"]}')
        
        if success and data.get('id') == self.test_item['id']:
            self.log_result("Get Item Detail", True, "Item details retrieved")
            return True
        else:
            self.log_result("Get Item Detail", False, f"Failed: {data}", data)
            return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, data = self.make_request('GET', 'dashboard/stats')
        
        expected_keys = ['total_listings', 'active_rentals', 'total_earnings', 'pending_requests']
        if success and all(key in data for key in expected_keys):
            self.log_result("Dashboard Stats", True, f"Stats: {data}")
            return True
        else:
            self.log_result("Dashboard Stats", False, f"Failed: {data}", data)
            return False

    def test_dashboard_activity(self):
        """Test dashboard recent activity"""
        success, data = self.make_request('GET', 'dashboard/recent-activity')
        
        if success and isinstance(data, list):
            self.log_result("Dashboard Activity", True, f"Retrieved {len(data)} activities")
            return True
        else:
            self.log_result("Dashboard Activity", False, f"Failed: {data}", data)
            return False

    def test_create_booking(self):
        """Test creating a booking (should fail for own item)"""
        if not hasattr(self, 'test_item') or 'id' not in self.test_item:
            self.log_result("Create Booking", False, "No test item ID available")
            return False
            
        booking_data = {
            "item_id": self.test_item['id'],
            "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "end_date": (datetime.now() + timedelta(days=3)).isoformat()
        }
        
        success, data = self.make_request('POST', 'bookings/', booking_data, 400)
        
        if success and 'Cannot book your own item' in data.get('detail', ''):
            self.log_result("Create Booking (Own Item)", True, "Correctly rejected booking own item")
            return True
        else:
            self.log_result("Create Booking (Own Item)", False, f"Unexpected response: {data}", data)
            return False

    def test_get_bookings(self):
        """Test getting user bookings"""
        success, data = self.make_request('GET', 'bookings/')
        
        if success and isinstance(data, list):
            self.log_result("Get Bookings", True, f"Retrieved {len(data)} bookings")
            return True
        else:
            self.log_result("Get Bookings", False, f"Failed: {data}", data)
            return False

    def test_get_conversations(self):
        """Test getting message conversations"""
        success, data = self.make_request('GET', 'messages/conversations')
        
        if success and isinstance(data, list):
            self.log_result("Get Conversations", True, f"Retrieved {len(data)} conversations")
            return True
        else:
            self.log_result("Get Conversations", False, f"Failed: {data}", data)
            return False

    def test_item_reviews(self):
        """Test getting item reviews"""
        if not hasattr(self, 'test_item') or 'id' not in self.test_item:
            self.log_result("Get Item Reviews", False, "No test item ID available")
            return False
            
        success, data = self.make_request('GET', f'reviews/item/{self.test_item["id"]}')
        
        if success and isinstance(data, list):
            self.log_result("Get Item Reviews", True, f"Retrieved {len(data)} reviews")
            return True
        else:
            self.log_result("Get Item Reviews", False, f"Failed: {data}", data)
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting CampusMart API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_signup,
            self.test_get_profile,
            self.test_user_login,
            self.test_create_item,
            self.test_get_items,
            self.test_get_featured_items,
            self.test_get_my_listings,
            self.test_get_item_detail,
            self.test_dashboard_stats,
            self.test_dashboard_activity,
            self.test_create_booking,
            self.test_get_bookings,
            self.test_get_conversations,
            self.test_item_reviews
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_result(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            
            # Print failed tests
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            
            return 1

def main():
    tester = CampusMartAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
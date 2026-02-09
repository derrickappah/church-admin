#!/usr/bin/env python3
"""
Backend API Testing Script
Tests the PDF generation endpoint for requisitions and other endpoints
"""

import requests
import os
from datetime import datetime

def test_pdf_generation_endpoint():
    """Test the PDF generation endpoint for requisitions"""
    
    # Get base URL from environment
    base_url = "https://sacred-manager.preview.emergentagent.com"
    
    # Test endpoint
    endpoint = f"{base_url}/api/requisitions/REQ-001/pdf"
    
    print(f"Testing PDF Generation Endpoint: {endpoint}")
    print("=" * 60)
    
    try:
        # Make GET request to PDF endpoint
        print("Making GET request to PDF endpoint...")
        response = requests.get(endpoint, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        # Test 1: Verify 200 status code
        if response.status_code == 200:
            print("✅ Test 1 PASSED: Returns 200 status code")
        else:
            print(f"❌ Test 1 FAILED: Expected 200, got {response.status_code}")
            print(f"Response text: {response.text}")
            return False
        
        # Test 2: Verify Content-Type header
        content_type = response.headers.get('Content-Type', '')
        print(f"Content-Type header: {content_type}")
        
        if content_type == 'application/pdf':
            print("✅ Test 2 PASSED: Content-Type is 'application/pdf'")
        else:
            print(f"❌ Test 2 FAILED: Expected 'application/pdf', got '{content_type}'")
            return False
        
        # Test 3: Verify Content-Disposition header
        content_disposition = response.headers.get('Content-Disposition', '')
        print(f"Content-Disposition header: {content_disposition}")
        
        if 'attachment' in content_disposition and 'withdrawal-REQ-001.pdf' in content_disposition:
            print("✅ Test 3 PASSED: Content-Disposition contains 'attachment' and filename")
        else:
            print(f"❌ Test 3 FAILED: Content-Disposition should contain 'attachment' and 'withdrawal-REQ-001.pdf'")
            return False
        
        # Additional verification: Check if response contains PDF content
        content_length = len(response.content)
        print(f"Response content length: {content_length} bytes")
        
        if content_length > 0:
            print("✅ Additional check PASSED: PDF content is not empty")
            
            # Check if content starts with PDF signature
            if response.content.startswith(b'%PDF'):
                print("✅ Additional check PASSED: Content starts with PDF signature")
            else:
                print("⚠️  Warning: Content doesn't start with PDF signature")
        else:
            print("❌ Additional check FAILED: PDF content is empty")
            return False
        
        print("\n🎉 ALL TESTS PASSED: PDF generation endpoint is working correctly!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_pdf_nonexistent_id():
    """Test the PDF generation endpoint with non-existent ID (expecting 404)"""
    
    # Get base URL from environment
    base_url = "https://sacred-manager.preview.emergentagent.com"
    
    # Test endpoint with non-existent ID
    endpoint = f"{base_url}/api/requisitions/REQ-999/pdf"
    
    print(f"Testing PDF Endpoint with Non-existent ID: {endpoint}")
    print("=" * 60)
    
    try:
        # Make GET request to PDF endpoint with non-existent ID
        print("Making GET request to PDF endpoint with non-existent ID...")
        response = requests.get(endpoint, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response text: {response.text}")
        
        # Test: Verify 404 status code
        if response.status_code == 404:
            print("✅ Test PASSED: Returns 404 status code for non-existent ID")
            return True
        else:
            print(f"❌ Test FAILED: Expected 404, got {response.status_code}")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_login_page():
    """Test the Login page (GET /login)"""
    
    # Get base URL from environment
    base_url = "https://sacred-manager.preview.emergentagent.com"
    
    # Test endpoint
    endpoint = f"{base_url}/login"
    
    print(f"Testing Login Page: {endpoint}")
    print("=" * 60)
    
    try:
        # Make GET request to login page
        print("Making GET request to login page...")
        response = requests.get(endpoint, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        # Test: Verify 200 status code
        if response.status_code == 200:
            print("✅ Test PASSED: Login page returns 200 status code")
            
            # Additional check: verify it's HTML content
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                print("✅ Additional check PASSED: Content-Type indicates HTML page")
            else:
                print(f"⚠️  Warning: Content-Type is '{content_type}', expected HTML")
            
            return True
        else:
            print(f"❌ Test FAILED: Expected 200, got {response.status_code}")
            print(f"Response text: {response.text[:500]}...")  # First 500 chars
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_dashboard_page():
    """Test the Dashboard page (GET /dashboard)"""
    
    # Get base URL from environment
    base_url = "https://sacred-manager.preview.emergentagent.com"
    
    # Test endpoint
    endpoint = f"{base_url}/dashboard"
    
    print(f"Testing Dashboard Page: {endpoint}")
    print("=" * 60)
    
    try:
        # Make GET request to dashboard page
        print("Making GET request to dashboard page...")
        response = requests.get(endpoint, timeout=30, allow_redirects=False)
        
        print(f"Status Code: {response.status_code}")
        
        # Test: Check for expected status codes (200 or redirect codes)
        if response.status_code == 200:
            print("✅ Test PASSED: Dashboard page returns 200 status code")
            
            # Additional check: verify it's HTML content
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                print("✅ Additional check PASSED: Content-Type indicates HTML page")
            else:
                print(f"⚠️  Warning: Content-Type is '{content_type}', expected HTML")
            
            return True
        elif response.status_code in [301, 302, 307, 308]:
            print(f"✅ Test PASSED: Dashboard redirects with status {response.status_code}")
            
            # Check redirect location
            location = response.headers.get('Location', '')
            if location:
                print(f"✅ Redirect location: {location}")
            
            return True
        else:
            print(f"❌ Test FAILED: Expected 200 or redirect (3xx), got {response.status_code}")
            print(f"Response text: {response.text[:500]}...")  # First 500 chars
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main test function"""
    print("Backend API Testing - PDF Generation Endpoint")
    print(f"Test started at: {datetime.now()}")
    print("=" * 60)
    
    # Test PDF generation endpoint
    pdf_test_passed = test_pdf_generation_endpoint()
    
    print("\n" + "=" * 60)
    print("FINAL TEST RESULTS:")
    print("=" * 60)
    
    if pdf_test_passed:
        print("✅ PDF Generation Endpoint: WORKING")
        print("\nSUMMARY: All tests passed successfully!")
    else:
        print("❌ PDF Generation Endpoint: FAILED")
        print("\nSUMMARY: Some tests failed. Check the output above for details.")
    
    print(f"Test completed at: {datetime.now()}")

if __name__ == "__main__":
    main()
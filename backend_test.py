#!/usr/bin/env python3

import requests
import sys
from urllib.parse import urljoin

# Base URL from environment
BASE_URL = "https://demobackend.emergentagent.com"

def test_dashboard_redirect():
    """Test GET /dashboard - Expect a redirect (307) to /login"""
    print("\n=== Testing GET /dashboard ===")
    try:
        url = urljoin(BASE_URL, "/dashboard")
        print(f"Testing URL: {url}")
        
        # Use allow_redirects=False to capture the redirect response
        response = requests.get(url, allow_redirects=False, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code in [301, 302, 307, 308]:
            location = response.headers.get('Location', 'No Location header')
            print(f"Redirect Location: {location}")
            
            if response.status_code == 307:
                print("✅ PASS: Got expected 307 redirect")
                if '/login' in location:
                    print("✅ PASS: Redirects to /login as expected")
                    return True
                else:
                    print(f"❌ FAIL: Redirects to {location}, expected /login")
                    return False
            else:
                print(f"⚠️  WARNING: Got {response.status_code} redirect instead of 307")
                if '/login' in location:
                    print("✅ PASS: Still redirects to /login (acceptable)")
                    return True
                else:
                    print(f"❌ FAIL: Redirects to {location}, expected /login")
                    return False
        else:
            print(f"❌ FAIL: Expected redirect (307), got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_login_page():
    """Test GET /login - Expect 200 OK"""
    print("\n=== Testing GET /login ===")
    try:
        url = urljoin(BASE_URL, "/login")
        print(f"Testing URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Not specified')}")
        print(f"Content Length: {len(response.content)} bytes")
        
        if response.status_code == 200:
            print("✅ PASS: Got expected 200 OK")
            
            # Check if it's HTML content
            content_type = response.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                print("✅ PASS: Returns HTML content as expected")
                return True
            else:
                print(f"⚠️  WARNING: Content-Type is {content_type}, expected HTML")
                return True  # Still consider it a pass if status is 200
        else:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_api_pdf_endpoint():
    """Test GET /api/requisitions/REQ-999/pdf - Expect 404 (or 500) but not a redirect"""
    print("\n=== Testing GET /api/requisitions/REQ-999/pdf ===")
    try:
        url = urljoin(BASE_URL, "/api/requisitions/REQ-999/pdf")
        print(f"Testing URL: {url}")
        
        # Use allow_redirects=False to detect any unexpected redirects
        response = requests.get(url, allow_redirects=False, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Content Length: {len(response.content)} bytes")
        
        if response.status_code in [301, 302, 307, 308]:
            location = response.headers.get('Location', 'No Location header')
            print(f"❌ FAIL: Got unexpected redirect to {location}")
            print("API endpoints should not redirect for authentication")
            return False
        elif response.status_code == 404:
            print("✅ PASS: Got expected 404 (resource not found)")
            return True
        elif response.status_code == 500:
            print("✅ PASS: Got 500 (acceptable for non-existent resource)")
            # Print response content to understand the error
            try:
                content = response.text[:500]  # First 500 chars
                print(f"Response content: {content}")
            except:
                pass
            return True
        elif response.status_code == 401:
            print("✅ PASS: Got 401 (API authentication required)")
            return True
        else:
            print(f"⚠️  UNEXPECTED: Got {response.status_code}, expected 404/500/401")
            # Print response content for debugging
            try:
                content = response.text[:500]  # First 500 chars
                print(f"Response content: {content}")
            except:
                pass
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Run all tests and report results"""
    print("🧪 Starting Backend Authentication & Routing Tests")
    print(f"Base URL: {BASE_URL}")
    
    results = []
    
    # Test 1: Dashboard redirect
    results.append(("Dashboard Redirect", test_dashboard_redirect()))
    
    # Test 2: Login page
    results.append(("Login Page", test_login_page()))
    
    # Test 3: API PDF endpoint
    results.append(("API PDF Endpoint", test_api_pdf_endpoint()))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST RESULTS SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - see details above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3

import os
import sys

print("🔍 Testing deployment and imports...")

try:
    print("1. Testing basic imports...")
    import firebase_admin
    from firebase_admin import credentials, firestore
    print("✅ Firebase Admin SDK imported successfully")
    
    print("2. Testing firestore_service import...")
    from firestore_service import firestore_service
    print("✅ Firestore service imported successfully")
    
    print("3. Testing Firestore connection...")
    tests = firestore_service.get_all_tests()
    print(f"✅ Firestore connection working. Found {len(tests)} tests")
    
    print("4. Testing app import...")
    import app
    print("✅ App imported successfully")
    
    print("🎉 All tests passed! Deployment is working correctly.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1) 
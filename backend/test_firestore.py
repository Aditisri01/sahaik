#!/usr/bin/env python3

import os
import firebase_admin
from firebase_admin import credentials, firestore

print("🔍 Testing Firestore connection...")

# Set project environment variable
os.environ['GOOGLE_CLOUD_PROJECT'] = 'sahaik-c5804'

try:
    # Initialize Firebase Admin SDK with service account key
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin SDK initialized successfully")
    
    # Test Firestore connection
    db = firestore.client()
    print("✅ Firestore client created successfully")
    
    # Test a simple read operation
    test_collection = db.collection('tests')
    docs = list(test_collection.limit(1).stream())
    print(f"✅ Successfully connected to Firestore. Found {len(docs)} test documents")
    
    print("🎉 Firestore connection test passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("🔧 Troubleshooting steps:")
    print("1. Make sure you're authenticated: gcloud auth application-default login")
    print("2. Make sure the project is set: gcloud config set project sahaik-c5804")
    print("3. Make sure Firestore API is enabled") 
#!/usr/bin/env python3
"""
Migration script to move tests from local JSON files to Firestore
"""

import json
import os
from firestore_service import firestore_service
from datetime import datetime

def migrate_tests_to_firestore():
    """Migrate tests from local JSON file to Firestore"""
    
    # Load existing tests from JSON file
    tests_file = 'tests.json'
    if not os.path.exists(tests_file):
        print(f"Tests file {tests_file} not found. Nothing to migrate.")
        return
    
    try:
        with open(tests_file, 'r') as f:
            tests_data = json.load(f)
        
        print(f"Found {len(tests_data)} tests to migrate")
        
        # Check if tests already exist in Firestore
        existing_tests = firestore_service.get_all_tests()
        print(f"Found {len(existing_tests)} existing tests in Firestore")
        
        # Migrate tests that don't already exist
        migrated_count = 0
        for test_id, test_data in tests_data.items():
            # Check if test already exists in Firestore
            if test_id not in existing_tests:
                try:
                    # Add test_id to the test data
                    test_data['test_id'] = test_id
                    test_data['original_id'] = test_id
                    test_data['migrated_at'] = datetime.now().isoformat()
                    
                    # Create test in Firestore
                    firestore_service.create_test(test_data)
                    migrated_count += 1
                    print(f"Migrated test: {test_id} - {test_data.get('topic', 'Unknown topic')}")
                except Exception as e:
                    print(f"Error migrating test {test_id}: {e}")
            else:
                print(f"Test {test_id} already exists in Firestore, skipping")
        
        print(f"Migration completed. {migrated_count} tests migrated to Firestore")
        
    except Exception as e:
        print(f"Error during migration: {e}")

def migrate_responses_to_firestore():
    """Migrate responses from local JSON file to Firestore"""
    
    # Load existing responses from JSON file
    responses_file = 'responses.json'
    if not os.path.exists(responses_file):
        print(f"Responses file {responses_file} not found. Nothing to migrate.")
        return
    
    try:
        with open(responses_file, 'r') as f:
            responses_data = json.load(f)
        
        print(f"Found responses for {len(responses_data)} tests to migrate")
        
        # Migrate responses
        migrated_count = 0
        for test_id, test_responses in responses_data.items():
            for student_id, response_data in test_responses.items():
                try:
                    # Add metadata to response
                    response_data['test_id'] = test_id
                    response_data['student_id'] = student_id
                    response_data['migrated_at'] = datetime.now().isoformat()
                    
                    # Create response in Firestore
                    firestore_service.submit_response(response_data)
                    migrated_count += 1
                    print(f"Migrated response: Test {test_id}, Student {student_id}")
                except Exception as e:
                    print(f"Error migrating response for test {test_id}, student {student_id}: {e}")
        
        print(f"Response migration completed. {migrated_count} responses migrated to Firestore")
        
    except Exception as e:
        print(f"Error during response migration: {e}")

if __name__ == "__main__":
    print("Starting migration to Firestore...")
    
    # Migrate tests
    print("\n=== Migrating Tests ===")
    migrate_tests_to_firestore()
    
    # Migrate responses
    print("\n=== Migrating Responses ===")
    migrate_responses_to_firestore()
    
    print("\nMigration completed!") 
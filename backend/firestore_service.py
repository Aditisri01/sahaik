import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

# Initialize Firebase Admin SDK
try:
    # Use default credentials for Cloud Run
    print("Using default credentials for Firebase initialization (Cloud Run)")
    firebase_admin.initialize_app()
except ValueError:
    # App already initialized
    print("Firebase app already initialized")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# Set the project explicitly for Firestore
os.environ['GOOGLE_CLOUD_PROJECT'] = 'sahaik-c5804'
try:
    db = firestore.client()
    print("Firestore client created successfully")
except Exception as e:
    print(f"Error creating Firestore client: {e}")
    db = None

class FirestoreService:
    def __init__(self):
        self.db = db
        if self.db is None:
            print("WARNING: Firestore client is not available")

    # Test Operations
    def get_all_tests(self):
        """Get all tests from Firestore"""
        if self.db is None:
            print("ERROR: Firestore client not available")
            return {}
        try:
            tests = {}
            docs = self.db.collection('tests').stream()
            for doc in docs:
                tests[doc.id] = {**doc.to_dict(), 'test_id': doc.id}
            return tests
        except Exception as e:
            print(f"Error getting all tests: {e}")
            return {}

    def get_tests_by_class_subject(self, class_name, subject):
        """Get tests filtered by class and subject"""
        tests = []
        docs = self.db.collection('tests').where('class', '==', class_name).where('subject', '==', subject).stream()
        for doc in docs:
            tests.append({**doc.to_dict(), 'test_id': doc.id})
        return tests

    def get_test_by_id(self, test_id):
        """Get a specific test by ID"""
        if self.db is None:
            print("ERROR: Firestore client not available")
            return None
        try:
            doc = self.db.collection('tests').document(test_id).get()
            if doc.exists:
                return {**doc.to_dict(), 'test_id': doc.id}
            return None
        except Exception as e:
            print(f"Error getting test by ID {test_id}: {e}")
            return None

    def create_test(self, test_data):
        """Create a new test"""
        test_data['created_at'] = datetime.now()
        doc_ref = self.db.collection('tests').add(test_data)
        return doc_ref[1].id

    def update_test(self, test_id, test_data):
        """Update an existing test"""
        test_data['updated_at'] = datetime.now()
        self.db.collection('tests').document(test_id).update(test_data)

    def delete_test(self, test_id):
        """Delete a test"""
        self.db.collection('tests').document(test_id).delete()

    # Response Operations
    def get_test_responses(self, test_id):
        """Get all responses for a specific test"""
        responses = {}
        docs = self.db.collection('responses').where('test_id', '==', test_id).stream()
        for doc in docs:
            data = doc.to_dict()
            student_id = data.get('student_id')
            if student_id:
                responses[student_id] = data
        return responses

    def get_responses_by_test_id(self, test_id):
        """Get all responses for a specific test (alias for get_test_responses)"""
        return self.get_test_responses(test_id)

    def get_student_response(self, test_id, student_id):
        """Get a specific student's response for a test"""
        docs = self.db.collection('responses').where('test_id', '==', test_id).where('student_id', '==', student_id).stream()
        for doc in docs:
            return doc.to_dict()
        return None

    def submit_response(self, response_data):
        """Submit a student's test response"""
        response_data['submitted_at'] = datetime.now()
        doc_ref = self.db.collection('responses').add(response_data)
        return doc_ref[1].id

    def get_student_history(self, student_id):
        """Get all test history for a student"""
        history = []
        docs = self.db.collection('responses').where('student_id', '==', student_id).order_by('submitted_at', direction=firestore.Query.DESCENDING).stream()
        for doc in docs:
            history.append(doc.to_dict())
        return history

    def get_all_responses(self):
        """Get all responses (for admin)"""
        responses = {}
        docs = self.db.collection('responses').stream()
        for doc in docs:
            data = doc.to_dict()
            test_id = data.get('test_id')
            student_id = data.get('student_id')
            if test_id and student_id:
                if test_id not in responses:
                    responses[test_id] = {}
                responses[test_id][student_id] = data
        return responses

    # User Operations
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        doc = self.db.collection('users').document(user_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def create_user(self, user_data):
        """Create a new user"""
        user_data['created_at'] = datetime.now()
        doc_ref = self.db.collection('users').add(user_data)
        return doc_ref[1].id

    def update_user(self, user_id, user_data):
        """Update user data"""
        user_data['updated_at'] = datetime.now()
        self.db.collection('users').document(user_id).update(user_data)

    def get_users_by_role(self, role):
        """Get all users by role"""
        users = []
        docs = self.db.collection('users').where('role', '==', role).stream()
        for doc in docs:
            users.append({**doc.to_dict(), 'user_id': doc.id})
        return users

    # Migration Operations
    def migrate_tests_from_json(self, tests_data):
        """Migrate tests from JSON to Firestore"""
        batch = self.db.batch()
        for test_id, test_data in tests_data.items():
            doc_ref = self.db.collection('tests').document()
            test_data['original_id'] = test_id
            test_data['migrated_at'] = datetime.now()
            batch.set(doc_ref, test_data)
        batch.commit()

    def migrate_responses_from_json(self, responses_data):
        """Migrate responses from JSON to Firestore"""
        batch = self.db.batch()
        for test_id, test_responses in responses_data.items():
            for student_id, response_data in test_responses.items():
                doc_ref = self.db.collection('responses').document()
                response_data['test_id'] = test_id
                response_data['student_id'] = student_id
                response_data['migrated_at'] = datetime.now()
                batch.set(doc_ref, response_data)
        batch.commit()

# Global instance
firestore_service = FirestoreService() 
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Collections
const TESTS_COLLECTION = 'tests';
const RESPONSES_COLLECTION = 'responses';
const USERS_COLLECTION = 'users';

// Test Operations
export const testService = {
  // Get all tests
  async getAllTests() {
    const querySnapshot = await getDocs(collection(db, TESTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get tests by class and subject
  async getTestsByClassAndSubject(class_name, subject) {
    const q = query(
      collection(db, TESTS_COLLECTION),
      where('class', '==', class_name),
      where('subject', '==', subject)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get test by ID
  async getTestById(testId) {
    const docRef = doc(db, TESTS_COLLECTION, testId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  // Create new test
  async createTest(testData) {
    const docRef = await addDoc(collection(db, TESTS_COLLECTION), {
      ...testData,
      created_at: serverTimestamp(),
      created_by: testData.created_by || 'teacher'
    });
    return docRef.id;
  },

  // Update test
  async updateTest(testId, testData) {
    const docRef = doc(db, TESTS_COLLECTION, testId);
    await updateDoc(docRef, {
      ...testData,
      updated_at: serverTimestamp()
    });
  },

  // Delete test
  async deleteTest(testId) {
    const docRef = doc(db, TESTS_COLLECTION, testId);
    await deleteDoc(docRef);
  }
};

// Response Operations
export const responseService = {
  // Get responses for a test
  async getTestResponses(testId) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('test_id', '==', testId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get student's response for a test
  async getStudentResponse(testId, studentId) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('test_id', '==', testId),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  },

  // Submit test response
  async submitResponse(responseData) {
    const docRef = await addDoc(collection(db, RESPONSES_COLLECTION), {
      ...responseData,
      submitted_at: serverTimestamp()
    });
    return docRef.id;
  },

  // Get student's test history
  async getStudentHistory(studentId) {
    const q = query(
      collection(db, RESPONSES_COLLECTION),
      where('student_id', '==', studentId),
      orderBy('submitted_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get all responses (for admin)
  async getAllResponses() {
    const querySnapshot = await getDocs(collection(db, RESPONSES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// User Operations
export const userService = {
  // Get user by ID
  async getUserById(userId) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  // Create user
  async createUser(userData) {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      created_at: serverTimestamp()
    });
    return docRef.id;
  },

  // Update user
  async updateUser(userId, userData) {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...userData,
      updated_at: serverTimestamp()
    });
  },

  // Get users by role
  async getUsersByRole(role) {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Migration helper to move data from JSON files to Firestore
export const migrationService = {
  async migrateTestsFromJSON(testsData) {
    const batch = [];
    for (const [testId, testData] of Object.entries(testsData)) {
      batch.push(
        addDoc(collection(db, TESTS_COLLECTION), {
          ...testData,
          original_id: testId,
          migrated_at: serverTimestamp()
        })
      );
    }
    return Promise.all(batch);
  },

  async migrateResponsesFromJSON(responsesData) {
    const batch = [];
    for (const [testId, testResponses] of Object.entries(responsesData)) {
      for (const [studentId, responseData] of Object.entries(testResponses)) {
        batch.push(
          addDoc(collection(db, RESPONSES_COLLECTION), {
            ...responseData,
            test_id: testId,
            student_id: studentId,
            migrated_at: serverTimestamp()
          })
        );
      }
    }
    return Promise.all(batch);
  }
}; 
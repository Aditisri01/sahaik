import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBTliL4_wkx5Vu5r9KpBTShqxqHxN9Xx00",
  authDomain: "sahaik-c5804.firebaseapp.com",
  projectId: "sahaik-c5804",
  storageBucket: "sahaik-c5804.appspot.com",
  messagingSenderId: "1073580335924",
  appId: "1:1073580335924:web:1f996ad431bd0de4a73b61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 
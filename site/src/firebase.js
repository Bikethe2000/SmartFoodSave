import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these with your Firebase config from Firebase Console
// Go to Firebase Console > Project Settings > Your apps > Copy the config
const firebaseConfig = {
  apiKey: "AIzaSyC4u_WycoDv84P0dqzQtV0y2JD9n0du8-k",
  authDomain: "foodwasteai-8d074.firebaseapp.com",
  projectId: "foodwasteai-8d074",
  storageBucket: "foodwasteai-8d074.firebasestorage.app",
  messagingSenderId: "298988180962",
  appId: "1:298988180962:web:bb885bbefa2d3084e895bb",
  measurementId: "G-R5324SN97G"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

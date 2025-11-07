import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACP_cz9ZZ4hsbZebkA51eu813dZ7cHaLw",
  authDomain: "mobiledev-marketplace.firebaseapp.com",
  projectId: "mobiledev-marketplace",
  storageBucket: "mobiledev-marketplace.appspot.com",
  messagingSenderId: "680477926513",
  appId: "1:680477926513:web:c0d0935b87eb5b2a1c3c42"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

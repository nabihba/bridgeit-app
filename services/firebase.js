// Firebase service for BridgeIT app
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBoIrmmj4-52MDBRIIHkyR4ohIAVLGVHrg',
  authDomain: 'bridge-it-app-f0f70.firebaseapp.com',
  projectId: 'bridge-it-app-f0f70',
  storageBucket: 'bridge-it-app-f0f70.firebasestorage.app',
  messagingSenderId: '759342814511',
  appId: '1:759342814511:web:9fed88c081203420487dda',
  measurementId: 'G-44DKJ9WR0P',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

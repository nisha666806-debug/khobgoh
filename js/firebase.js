import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCr2AynK-aXLHmKoq8lVU7tb49U-V1TVG0",
  authDomain: "khobgoh-23dcc.firebaseapp.com",
  projectId: "khobgoh-23dcc",
  storageBucket: "khobgoh-23dcc.firebasestorage.app",
  messagingSenderId: "154064833176",
  appId: "1:154064833176:web:a4f2a002a2783ecd5fdeed"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
  app,
  auth,
  db,

  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,

  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,

  query,
  where,
  orderBy,
  limit,

  serverTimestamp,
  runTransaction
};

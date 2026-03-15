import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit, 
  serverTimestamp, doc, updateDoc, setDoc, deleteDoc, getDoc, writeBatch, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu4MvRWhQuPaR9BmP0B-FCb6DISQ7P1YY",
  authDomain: "bhavya-agro-exports.firebaseapp.com",
  projectId: "bhavya-agro-exports",
  storageBucket: "bhavya-agro-exports.firebasestorage.app",
  messagingSenderId: "468738165745",
  appId: "1:468738165745:web:8de582791b376ab0071250",
  measurementId: "G-45SB1V576F"
};

// Initialize Firebase (guard against duplicate init across modules)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // App already initialized — get existing instance
  const { getApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
  app = getApp();
}

const db   = getFirestore(app, "bhavya-agro-exports-quotes");
const auth = getAuth(app);
const storage = getStorage(app);

// Export for use in other scripts
export { db, auth, storage, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, updateDoc, setDoc, deleteDoc, getDoc, writeBatch, onSnapshot };

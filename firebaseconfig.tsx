import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyA5jR0yv8v3utMOPmOGlwIqRppbjiwQmJw",
  authDomain: "glamconnect-c6286.firebaseapp.com",
  projectId: "glamconnect-c6286",
  storageBucket: "glamconnect-c6286.firebasestorage.app",
  messagingSenderId: "55527924150",
  appId: "1:55527924150:web:4ce396d98009127948e117",
  measurementId: "G-L6EDB8YDLM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
export const db = getFirestore(app); 

const storage = getStorage(app);  

export { storage };
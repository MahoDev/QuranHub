import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBBZIcFfmgmTBiqsNKPjpmVgrD_rtAoe-s",
  authDomain: "quranhub-93563.firebaseapp.com",
  projectId: "quranhub-93563",
  storageBucket: "quranhub-93563.appspot.com",
  messagingSenderId: "952803592312",
  appId: "1:952803592312:web:8a6cedbfddc844bed1858d",
  measurementId: "G-HBV65V7VH4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

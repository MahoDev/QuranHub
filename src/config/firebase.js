import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBBZIcFfmgmTBiqsNKPjpmVgrD_rtAoe-s",
  authDomain: "quranhub-93563.firebaseapp.com",
  projectId: "quranhub-93563",
  storageBucket: "quranhub-93563.appspot.com",
  messagingSenderId: "952803592312",
  appId: "1:952803592312:web:8a6cedbfddc844bed1858d",
  measurementId: "G-HBV65V7VH4"
};

// Initialize Firebase with error handling
let app;
let firestore;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with persistence settings
  firestore = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: false,
    experimentalAutoDetectLongPolling: true
  });
  
  // Enable offline persistence
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });

  // Initialize Analytics if supported
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    } else {
      console.log('Analytics not supported in this environment');
    }
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error; // Re-throw to prevent the app from starting with a broken Firebase setup
}

export { app, firestore, analytics };
export const auth = getAuth(app);

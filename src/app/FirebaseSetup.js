// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
   getAuth, connectAuthEmulator, 
   setPersistence, browserSessionPersistence,
  } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator} from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASEURL,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export: Auth & Firestore
export const firestore = getFirestore(app);
export const auth = getAuth(app);

// Setup Testing Emulator Environment
const functions = getFunctions(app);
if (process.env.NEXT_PUBLIC_DEV === "true") {
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFunctionsEmulator(functions, "localhost", 5001)
  // Stop Auth from Saving Across New Sessions
  setPersistence(auth, browserSessionPersistence)
}
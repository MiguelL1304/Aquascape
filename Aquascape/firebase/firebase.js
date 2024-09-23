import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "@firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

// Your Firebase configuration - replace this with your Firebase project's config
const firebaseConfig = {
    apiKey: "AIzaSyCMx-KfZUaXkywSPdkEcTgujqOozJI8cTo",
    authDomain: "aquascape-ad068.firebaseapp.com",
    projectId: "aquascape-ad068",
    storageBucket: "aquascape-ad068.appspot.com",
    messagingSenderId: "281590937935",
    appId: "1:281590937935:web:8b750a179c65785c5d6d3a",
    measurementId: "G-7ZLL0E5RJ7"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore database
const firestoreDB = getFirestore(app);

// Initialize Firebase Storage
const firebaseStorage = getStorage(app);

export { app, auth, firestoreDB, firebaseStorage };
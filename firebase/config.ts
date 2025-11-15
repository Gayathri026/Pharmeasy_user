// src/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDigonyCNb5TNfzwx8j3B3LvwfnLH1GmTc",
    authDomain: "pharmeasy-clone-cf6d5.firebaseapp.com",
    projectId: "pharmeasy-clone-cf6d5",
    storageBucket: "pharmeasy-clone-cf6d5.appspot.com",
    messagingSenderId: "268553101129",
    appId: "1:268553101129:web:c9ea8af88a1d185b9c4498",
    measurementId: "G-NZ6J1X2WEW",
};

let app: FirebaseApp;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase');
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
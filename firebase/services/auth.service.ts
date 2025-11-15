// src/firebase/services/auth.service.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    User,
    UserCredential,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config";
import { COLLECTIONS } from "../collections";

export const authService = {
    async signUp(email: string, password: string, fullName?: string): Promise<{ user: User | null; error: Error | null }> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create profile
            await setDoc(doc(db, COLLECTIONS.PROFILES, user.uid), {
                email: user.email,
                full_name: fullName || '',
                phone: '',
                created_at: serverTimestamp(),
            });

            // Assign default 'user' role
            await setDoc(doc(db, COLLECTIONS.USER_ROLES, user.uid), {
                user_id: user.uid,
                role: 'user',
            });

            return { user, error: null };
        } catch (error: any) {
            return { user: null, error };
        }
    },

    async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error: any) {
            return { user: null, error };
        }
    },

    async signOut(): Promise<{ error: Error | null }> {
        try {
            await firebaseSignOut(auth);
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    },

    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    },
};
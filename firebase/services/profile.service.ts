// src/firebase/services/profile.service.ts
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config";
import { COLLECTIONS } from "../collections";
import { Profile } from "../types";

export const profileService = {
    async getProfile(userId: string): Promise<Profile | null> {
        try {
            const docRef = doc(db, COLLECTIONS.PROFILES, userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;

            const data = docSnap.data();
            return {
                id: docSnap.id,
                email: data.email,
                full_name: data.full_name,
                phone: data.phone,
                created_at: data.created_at?.toDate() || new Date(),
            } as Profile;
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    },

    async updateProfile(
        userId: string,
        data: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>
    ): Promise<{ error: Error | null }> {
        try {
            const docRef = doc(db, COLLECTIONS.PROFILES, userId);
            await updateDoc(docRef, data);
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    },
};
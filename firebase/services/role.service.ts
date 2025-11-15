// src/firebase/services/role.service.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import { COLLECTIONS } from "../collections";
import { AppRole } from "../types";

export const roleService = {
    async hasRole(userId: string, role: AppRole): Promise<boolean> {
        try {
            const roleDoc = await getDoc(doc(db, COLLECTIONS.USER_ROLES, userId));
            if (!roleDoc.exists()) return false;
            return roleDoc.data()?.role === role;
        } catch (error) {
            console.error('Error checking role:', error);
            return false;
        }
    },

    async getUserRole(userId: string): Promise<AppRole | null> {
        try {
            const roleDoc = await getDoc(doc(db, COLLECTIONS.USER_ROLES, userId));
            if (!roleDoc.exists()) return null;
            return roleDoc.data()?.role as AppRole;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    },

    async isAdmin(userId: string): Promise<boolean> {
        return this.hasRole(userId, 'admin');
    },
};
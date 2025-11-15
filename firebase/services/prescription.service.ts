// src/firebase/services/prescription.service.ts
import { supabaseStorageService } from '../../supabase/storage.service';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "../config";
import { COLLECTIONS } from "../collections";
import { Prescription, PrescriptionStatus } from "../types";
import { profileService } from "./profile.service";

export const prescriptionService = {
    // Updated to use Supabase Storage
    async uploadFile(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
        try {
            console.log('📤 Uploading file via Supabase:', file.name);

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                return {
                    url: null,
                    error: new Error('File size exceeds 5MB limit')
                };
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                return {
                    url: null,
                    error: new Error('Only JPG, PNG, and PDF files are allowed')
                };
            }

            // Use Supabase Storage Service
            const { url, error } = await supabaseStorageService.uploadPrescription(userId, file);

            if (error) {
                console.error('❌ Upload error:', error);
                return { url: null, error };
            }

            console.log('✅ Upload successful:', url);
            return { url, error: null };
        } catch (error: any) {
            console.error('❌ Upload error:', error);
            return { url: null, error };
        }
    },

    async create(
        userId: string,
        fileUrl: string,
        fileName: string,
        deliveryAddress?: string,
        notes?: string
    ): Promise<{ id: string | null; error: Error | null }> {
        try {
            const prescriptionData = {
                user_id: userId,
                file_url: fileUrl,
                file_name: fileName,
                status: 'pending' as PrescriptionStatus,
                delivery_address: deliveryAddress || '',
                notes: notes || '',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.PRESCRIPTIONS), prescriptionData);
            console.log('✅ Prescription created:', docRef.id);
            return { id: docRef.id, error: null };
        } catch (error: any) {
            console.error('❌ Prescription creation error:', error);
            return { id: null, error };
        }
    },

    async getUserPrescriptions(userId: string): Promise<Prescription[]> {
        try {
            const q = query(
                collection(db, COLLECTIONS.PRESCRIPTIONS),
                where('user_id', '==', userId),
                orderBy('created_at', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: (doc.data().created_at as Timestamp).toDate(),
                updated_at: (doc.data().updated_at as Timestamp).toDate(),
            })) as Prescription[];
        } catch (error) {
            console.error('Error fetching user prescriptions:', error);
            return [];
        }
    },

    async getAllPrescriptions(): Promise<Prescription[]> {
        try {
            const q = query(
                collection(db, COLLECTIONS.PRESCRIPTIONS),
                orderBy('created_at', 'desc')
            );

            const snapshot = await getDocs(q);

            // Fetch profile data for each prescription
            const prescriptionsWithProfiles = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const profile = await profileService.getProfile(data.user_id);

                    return {
                        id: docSnap.id,
                        ...data,
                        created_at: (data.created_at as Timestamp).toDate(),
                        updated_at: (data.updated_at as Timestamp).toDate(),
                        profiles: profile ? {
                            email: profile.email,
                            full_name: profile.full_name || '',
                            phone: profile.phone || '',
                        } : {
                            email: '',
                            full_name: '',
                            phone: '',
                        },
                    } as Prescription;
                })
            );

            return prescriptionsWithProfiles;
        } catch (error) {
            console.error('Error fetching all prescriptions:', error);
            return [];
        }
    },

    async updateStatus(
        prescriptionId: string,
        status: PrescriptionStatus,
        notes?: string
    ): Promise<{ error: Error | null }> {
        try {
            const docRef = doc(db, COLLECTIONS.PRESCRIPTIONS, prescriptionId);
            await updateDoc(docRef, {
                status,
                notes: notes || '',
                updated_at: serverTimestamp(),
            });
            console.log('✅ Prescription status updated:', prescriptionId);
            return { error: null };
        } catch (error: any) {
            console.error('❌ Status update error:', error);
            return { error };
        }
    },

    async delete(prescriptionId: string): Promise<{ error: Error | null }> {
        try {
            await deleteDoc(doc(db, COLLECTIONS.PRESCRIPTIONS, prescriptionId));
            console.log('✅ Prescription deleted:', prescriptionId);
            return { error: null };
        } catch (error: any) {
            console.error('❌ Delete error:', error);
            return { error };
        }
    },
};
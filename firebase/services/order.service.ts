import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy as firestoreOrderBy,
    serverTimestamp,
    Timestamp,
    arrayUnion
} from "firebase/firestore";
import { db } from "../config";
import { COLLECTIONS } from "../collections";
import { Order, OrderItem, OrderStatus, StatusHistoryEntry } from "../types";

export const orderService = {
    async create(
        userId: string,
        items: OrderItem[],
        deliveryAddress: string,
        phone: string,
        prescriptionId?: string
    ): Promise<{ id: string | null; error: Error | null }> {
        try {
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const now = new Date();

            // Calculate estimated delivery (5-7 days from now)
            const estimatedDelivery = new Date(now);
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

            const orderData = {
                user_id: userId,
                prescription_id: prescriptionId || null,
                total_amount: totalAmount,
                status: 'pending' as OrderStatus,
                delivery_address: deliveryAddress,
                phone,
                items,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                estimatedDelivery: estimatedDelivery,
                trackingNumber: null,
                statusHistory: [{
                    status: 'pending',
                    timestamp: now,
                    note: 'Order placed successfully'
                }]
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);
            return { id: docRef.id, error: null };
        } catch (error: any) {
            console.error('Error creating order:', error);
            return { id: null, error };
        }
    },

    async getUserOrders(userId: string): Promise<Order[]> {
        try {
            const q = query(
                collection(db, COLLECTIONS.ORDERS),
                where('user_id', '==', userId),
                firestoreOrderBy('created_at', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    created_at: (data.created_at as Timestamp)?.toDate() || new Date(),
                    updated_at: (data.updated_at as Timestamp)?.toDate() || new Date(),
                    estimatedDelivery: data.estimatedDelivery ? (data.estimatedDelivery as Timestamp).toDate() : undefined,
                    statusHistory: data.statusHistory?.map((entry: any) => ({
                        ...entry,
                        timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)
                    })) || []
                } as Order;
            });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    },

    async getAllOrders(): Promise<Order[]> {
        try {
            const q = query(
                collection(db, COLLECTIONS.ORDERS),
                firestoreOrderBy('created_at', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    created_at: (data.created_at as Timestamp)?.toDate() || new Date(),
                    updated_at: (data.updated_at as Timestamp)?.toDate() || new Date(),
                    estimatedDelivery: data.estimatedDelivery ? (data.estimatedDelivery as Timestamp).toDate() : undefined,
                    statusHistory: data.statusHistory?.map((entry: any) => ({
                        ...entry,
                        timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)
                    })) || []
                } as Order;
            });
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    },

    async getOrder(orderId: string): Promise<Order | null> {
        try {
            const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                created_at: (data.created_at as Timestamp)?.toDate() || new Date(),
                updated_at: (data.updated_at as Timestamp)?.toDate() || new Date(),
                estimatedDelivery: data.estimatedDelivery ? (data.estimatedDelivery as Timestamp).toDate() : undefined,
                statusHistory: data.statusHistory?.map((entry: any) => ({
                    ...entry,
                    timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)
                })) || []
            } as Order;
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    },

    async updateStatus(
        orderId: string,
        status: OrderStatus,
        note?: string,
        updatedBy?: string,
        trackingNumber?: string
    ): Promise<{ error: Error | null }> {
        try {
            const docRef = doc(db, COLLECTIONS.ORDERS, orderId);

            const updateData: any = {
                status,
                updated_at: serverTimestamp(),
                statusHistory: arrayUnion({
                    status,
                    timestamp: new Date(),
                    note: note || `Order status updated to ${status}`,
                    updatedBy: updatedBy || 'system'
                })
            };

            if (trackingNumber) {
                updateData.trackingNumber = trackingNumber;
            }

            await updateDoc(docRef, updateData);
            return { error: null };
        } catch (error: any) {
            console.error('Error updating order status:', error);
            return { error };
        }
    },
};
                console.log('✅ Email sent successfully to user!');
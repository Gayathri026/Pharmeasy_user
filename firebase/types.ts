// // src/firebase/types.ts
// export type AppRole = 'admin' | 'user';
// export type PrescriptionStatus = 'pending' | 'approved' | 'rejected';
// export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
// export interface StatusHistoryEntry {
//     status: OrderStatus;
//     timestamp: Date;
//     note?: string;
//     updatedBy?: string;
// }

// export interface OrderItem {
//     id: string;
//     name: string;
//     quantity: number;
//     price: number;
//     image?: string;
// }
// export interface Profile {
//     id: string;
//     email: string;
//     full_name?: string;
//     phone?: string;
//     created_at: Date;
// }

// export interface UserRole {
//     id: string;
//     user_id: string;
//     role: AppRole;
// }

// export interface Prescription {
//     id: string;
//     user_id: string;
//     file_url: string;
//     file_name: string;
//     status: PrescriptionStatus;
//     notes?: string;
//     delivery_address?: string;
//     created_at: Date;
//     updated_at: Date;
//     profiles?: {
//         email: string;
//         full_name: string;
//         phone: string;
//     };
// }

// export interface OrderItem {
//     name: string;
//     quantity: number;
//     price: number;
// }

// export interface Order {
//     id: string;
//     user_id: string;
//     prescription_id?: string;
//     total_amount: number;
//     status: OrderStatus;
//     delivery_address: string;
//     phone: string;
//     items: OrderItem[];
//     created_at: Date;
//     updated_at: Date;
//     statusHistory?: StatusHistoryEntry[];  // NEW
//     estimatedDelivery?: Date;              // NEW
//     trackingNumber?: string;               // NEW
// }4
// src/firebase/types.ts




//+++++++++++++++++++++++++++++++++++++++++++++//
// export type AppRole = 'admin' | 'user';
// export type PrescriptionStatus = 'pending' | 'approved' | 'rejected';
// export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// export interface StatusHistoryEntry {
//     status: OrderStatus;
//     timestamp: Date;
//     note?: string;
//     updatedBy?: string;
// }

// export interface OrderItem {
//     id: string;
//     name: string;
//     quantity: number;
//     price: number;
//     image?: string;
// }

// export interface Profile {
//     id: string;
//     email: string;
//     full_name?: string;
//     phone?: string;
//     created_at: Date;
// }

// export interface UserRole {
//     id: string;
//     user_id: string;
//     role: AppRole;
// }

// export interface Prescription {
//     id: string;
//     user_id: string;
//     file_url: string;
//     file_name: string;
//     status: PrescriptionStatus;
//     notes?: string;
//     delivery_address?: string;
//     created_at: Date;
//     updated_at: Date;
//     profiles?: {
//         email: string;
//         full_name: string;
//         phone: string;
//     };
// }

// export interface Order {
//     id: string;
//     user_id: string;
//     prescription_id?: string;
//     total_amount: number;
//     status: OrderStatus;
//     delivery_address: string;
//     phone: string;
//     items: OrderItem[];
//     created_at: Date;
//     updated_at: Date;
//     statusHistory?: StatusHistoryEntry[];
//     estimatedDelivery?: Date;
//     trackingNumber?: string;
// }




// src/firebase/types.ts
import { Timestamp } from "firebase/firestore";

export interface OrderItem {
    id: string;
    image: string;
    name: string;
    price: number;
    quantity: number;
    phone: string;
    prescription_id: string | null;
    status: string;
}

export interface StatusHistoryEntry {
    note: string;
    status: string;
    timestamp: Timestamp;
}

export interface Order {
    id?: string;
    status: string;
    created_at: Timestamp;
    delivery_address: string;
    location: string; // NEW: City/Area for location-based filtering
    estimatedDelivery: Timestamp;
    items: OrderItem[];
    statusHistory: StatusHistoryEntry[];
    total_amount: number;
    trackingNumber: string | null;
    updated_at: Timestamp;
    user_id: string;
    phone?: string;
}

export interface Prescription {
    id?: string;
    user_id: string;
    customer_name: string;
    customer_phone: string;
    order_id?: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    delivery_address: string;
    location: string; // NEW: City/Area for location-based filtering
    notes?: string;
    status: "pending" | "verified" | "rejected" | "assigned" | "completed";
    assigned_seller_id?: string;
    assigned_seller_name?: string;
    verified_by?: string;
    verified_at?: Timestamp;
    rejection_reason?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
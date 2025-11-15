// src/services/email.service.ts
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'mX5FzjLj_TP82eV6Q');

export const emailService = {
    /**
     * Send email notification to admin when new prescription is uploaded
     */
    async notifyAdminNewPrescription(params: {
        userName: string;
        userEmail: string;
        userPhone?: string;
        deliveryAddress: string;
        userNotes?: string;
        prescriptionId: string;
        fileUrl: string;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📧 Sending email to admin...');

            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

            if (!serviceId || !templateId) {
                console.error('❌ EmailJS not configured. Check .env file.');
                return { success: false, error: 'Email service not configured' };
            }

            // Prepare template parameters
            const templateParams = {
                user_name: params.userName || 'Unknown User',
                user_email: params.userEmail,
                user_phone: params.userPhone || 'Not provided',
                delivery_address: params.deliveryAddress,
                user_notes: params.userNotes || 'None',
                prescription_id: params.prescriptionId,
                file_url: params.fileUrl,
                admin_url: `${window.location.origin}/admin/prescriptions/${params.prescriptionId}`,
                upload_date: new Date().toLocaleString(),
                to_email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@medistore.com',
            };

            console.log('📤 Sending with params:', templateParams);

            // Send email using EmailJS
            const response = await emailjs.send(
                serviceId,
                templateId,
                templateParams
            );

            if (response.status === 200) {
                console.log('✅ Email sent successfully to admin!');
                return { success: true };
            } else {
                console.error('❌ Email failed with status:', response.status);
                return { success: false, error: 'Email send failed' };
            }
        } catch (error: any) {
            console.error('❌ Email error:', error);
            return { success: false, error: error.message || 'Unknown error' };
        }
    },

    /**
     * Send notification to user when medicines are ready
     */
    async notifyUserMedicinesReady(params: {
        userName: string;
        userEmail: string;
        prescriptionId: string;
        medicineCount: number;
        totalAmount: number;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            console.log('📧 Sending medicines ready notification to user...');

            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            // Prefer a dedicated user template, fallback to the default template ID
            const templateId = import.meta.env.VITE_EMAILJS_USER_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

            const templateParams = {
                user_name: params.userName,
                to_email: params.userEmail,
                prescription_id: params.prescriptionId,
                medicine_count: params.medicineCount,
                total_amount: params.totalAmount,
                view_url: `${window.location.origin}/my-prescriptions`,
            };

            const response = await emailjs.send(
                serviceId,
                templateId,
                templateParams
            );

            if (response.status === 200) {
                console.log('✅ User notification sent!');
                return { success: true };
            } else {
                return { success: false, error: 'Email send failed' };
            }
        } catch (error: any) {
            console.error('❌ Email error:', error);
            return { success: false, error: error.message };
        }
    },

/**
 * Test email configuration
 */
// async testEmail(): Promise<boolean> {
//     try {
//         const result = await this.notifyAdminNewPrescription({
//             userName: 'Test User',
//             userEmail: 'test@example.com',
//             userPhone: '1234567890',
//             deliveryAddress: '123 Test Street',
//             userNotes: 'This is a test',
//             prescriptionId: 'test-123',
//             fileUrl: 'https://meuoqqwwauqqeejvmfnh.supabase.co/storage/v1/object/public/prescriptions/xZufx6NwEBgj5Qa3sYrjsCyzF4y2/1761424044666.jpg',
//         });

//         return result.success;
//     } catch (error) {
//         console.error('Test email failed:', error);
//         return false;
//     }
// };
// Close the emailService object
};
// src/supabase/storage.service.ts
import { supabase } from './config';

export const supabaseStorageService = {
    async uploadPrescription(
        userId: string,
        file: File
    ): Promise<{ url: string | null; path: string | null; error: Error | null }> {
        try {
            console.log('📤 Uploading to Supabase:', file.name);

            const fileExt = file.name.split('.').pop();
            const timestamp = Date.now();
            const fileName = `${timestamp}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('prescriptions')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('❌ Upload error:', error);
                return { url: null, path: null, error };
            }

            console.log('✅ File uploaded successfully:', data.path);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('prescriptions')
                .getPublicUrl(data.path);

            console.log('🔗 Public URL:', urlData.publicUrl);

            return {
                url: urlData.publicUrl,
                path: data.path,
                error: null
            };
        } catch (error: any) {
            console.error('❌ Unexpected error:', error);
            return { url: null, path: null, error };
        }
    },

    async deletePrescription(filePath: string): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase.storage
                .from('prescriptions')
                .remove([filePath]);

            if (error) {
                console.error('❌ Delete error:', error);
                return { error };
            }

            console.log('✅ File deleted:', filePath);
            return { error: null };
        } catch (error: any) {
            console.error('❌ Unexpected error:', error);
            return { error };
        }
    },

    async listUserFiles(userId: string): Promise<string[]> {
        try {
            const { data, error } = await supabase.storage
                .from('prescriptions')
                .list(userId, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                console.error('❌ List error:', error);
                return [];
            }

            return data.map(file => `${userId}/${file.name}`);
        } catch (error) {
            console.error('❌ Unexpected error:', error);
            return [];
        }
    },
};
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('StorageService: Missing Supabase credentials for signed URLs.');
    }

    this.supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');
  }

  async getSignedUrl(path: string, bucket: string = 'reports', expiresIn: number = 3600) {
    if (!path) return null;
    
    // If it's already a full URL (legacy), we might need to extract the path
    const cleanPath = path.includes('storage/v1/object/public/') 
      ? path.split('public/')[1].split('/').slice(1).join('/')
      : path;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return path; // Fallback to original path if signing fails
    }

    return data.signedUrl;
  }
}

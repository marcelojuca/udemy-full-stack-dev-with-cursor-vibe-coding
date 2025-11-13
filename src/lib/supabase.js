import { createClient } from '@supabase/supabase-js';
import { validateSupabaseEnv } from './env-validation';

// Use placeholders during build time, but validate at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Client for client-side operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Validates Supabase environment variables before use
 * Call this function at the start of API routes or server-side code
 * @throws {Error} If Supabase env vars are missing
 */
export function ensureSupabaseEnv() {
  // Only validate at runtime, not during build
  if (typeof window === 'undefined') {
    // Server-side: validate before use
    validateSupabaseEnv();
  }
}

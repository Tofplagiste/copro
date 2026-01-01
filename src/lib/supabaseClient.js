/**
 * Supabase Client Configuration
 * 
 * Initialize the Supabase client with environment variables.
 * This file provides a single instance of the Supabase client
 * for use throughout the application.
 * 
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '[Supabase] Missing environment variables. ' +
        'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local'
    );
}

/**
 * @typedef {import('./database.types').Database} Database
 */

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<Database>}
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

/**
 * Helper to check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

/**
 * Helper to get current user profile
 * @returns {Promise<Object|null>}
 */
export async function getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

/**
 * Check if current user is approved
 * @returns {Promise<boolean>}
 */
export async function isUserApproved() {
    const profile = await getCurrentProfile();
    return profile?.is_approved === true;
}

export default supabase;

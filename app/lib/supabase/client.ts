import { createBrowserClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

// Safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Remove debug logging in production to improve performance
if (isBrowser && import.meta.env['DEV']) {
  console.log('VITE_SUPABASE_URL:', import.meta.env['VITE_SUPABASE_URL']);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env['VITE_SUPABASE_ANON_KEY'] ? 'is defined' : 'is not defined');
  // Use type assertions for non-standard env vars
  console.log('SUPABASE_URL:', (import.meta.env as any)['SUPABASE_URL']);
  console.log('SUPABASE_ANON_KEY:', (import.meta.env as any)['SUPABASE_ANON_KEY'] ? 'is defined' : 'is not defined');
}

// Cache the Supabase client instance to prevent multiple initializations
let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Create a method that can be used during client-side rendering
export const createSupabaseBrowserClient = (
  supabaseUrl: string = (import.meta.env as any)['SUPABASE_URL'] || import.meta.env['VITE_SUPABASE_URL'] as string,
  supabaseKey: string = (import.meta.env as any)['SUPABASE_ANON_KEY'] || import.meta.env['VITE_SUPABASE_ANON_KEY'] as string
) => {
  if (isBrowser && supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Create client with default options
  const client = createBrowserClient<Database>(supabaseUrl, supabaseKey);

  if (isBrowser) {
    supabaseClientInstance = client;
  }

  return client;
};

/**
 * Helper function to get the redirect URL for auth
 */
export const getRedirectURL = () => {
  if (!isBrowser) {
    /**
     * During SSR, return a placeholder that will be replaced
     */
    return '/auth/callback';
  }

  return `${window.location.origin}/auth/callback`;
};

/**
 * Export a non-functional client for imports during SSR
 * This will be replaced with a real client on the browser
 */
const dummyClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: {

      unsubscribe: () => {}
    } } }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithOAuth: () => Promise.resolve({ error: null }),
    signInWithOtp: () => Promise.resolve({ error: null }),
    signUp: () => Promise.resolve({ error: null }),
    exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => ({ select: () => Promise.resolve({ data: null, error: null }) }),
} as any;

/**
 * Export a client that will be used during SSR but replaced client-side
 */
export const supabase = isBrowser
  ? createSupabaseBrowserClient(
      /**
       * During CSR we access environment variables via import.meta.env in Vite
       */
      (import.meta.env as any)['SUPABASE_URL'] || import.meta.env['VITE_SUPABASE_URL'] || '',
      (import.meta.env as any)['SUPABASE_ANON_KEY'] || import.meta.env['VITE_SUPABASE_ANON_KEY'] || ''
    )
  : dummyClient;

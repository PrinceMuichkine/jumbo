import { createBrowserClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

// Safely check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Access environment variables safely
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // @ts-ignore - Vite-specific env access
  if (isBrowser && typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore - Vite-specific env access
    return import.meta.env[key] || '';
  }

  return '';
};

// Remove debug logging in production to improve performance
if (isBrowser && process.env.NODE_ENV === 'development') {
  console.log('SUPABASE_URL:', getEnv('VITE_SUPABASE_URL'));
  console.log('SUPABASE_ANON_KEY:', getEnv('VITE_SUPABASE_ANON_KEY') ? 'is defined' : 'is not defined');
}

// Cache the Supabase client instance to prevent multiple initializations
let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Create a method that can be used during client-side rendering
export const createSupabaseBrowserClient = (
  supabaseUrl: string = getEnv('VITE_SUPABASE_URL'),
  supabaseKey: string = getEnv('VITE_SUPABASE_ANON_KEY')
) => {
  if (isBrowser && supabaseClientInstance) {
    return supabaseClientInstance;
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key is missing');
    return createDummyClient();
  }

  try {
    // Create client with default options
    const client = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      // @ts-ignore - The types seem to be incorrect, but these options are valid
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: isBrowser,
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    if (isBrowser) {
      supabaseClientInstance = client;
    }

    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createDummyClient();
  }
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
 * Create a dummy client for SSR or when real client fails
 */
const createDummyClient = () => {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ error: null }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => ({ select: () => Promise.resolve({ data: null, error: null }) }),
  } as any;
};

/**
 * Export a client that will be used during SSR but replaced client-side
 */
export const supabase = isBrowser
  ? (() => {
      // Initialize in a function to handle any errors safely
      try {
        // Get env vars safely
        const supabaseUrl = getEnv('VITE_SUPABASE_URL');
        const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

        return createSupabaseBrowserClient(supabaseUrl, supabaseKey);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return createDummyClient();
      }
    })()
  : createDummyClient();

import { createClient } from '@supabase/supabase-js';

if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY');
}

// Create Supabase client with improved configuration
export const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    fetch: (url, options = {}) => {
      const headers = new Headers(options.headers);
      headers.set('Cache-Control', 'no-store');

      return fetch(url, { ...options, headers, credentials: 'include' });
    },
  },
});

// Helper function to get the correct redirect URL based on environment
export function getRedirectURL(path: string = '/auth/callback'): string {
  const url = typeof window !== 'undefined' ? window.location.origin : process.env.SITE_URL;
  return `${url}${path}`;
}

// Sign in with OAuth providers
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectURL(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { error };
}

export async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: getRedirectURL(),
    },
  });
  return { error };
}

export default supabase;

export type { User, Session } from '@supabase/supabase-js';

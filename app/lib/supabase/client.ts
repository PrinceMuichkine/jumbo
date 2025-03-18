import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the storage key for the current Supabase project
export function getAuthStorageKey(): string {
  if (!supabaseUrl) {
    return '';
  }

  return `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
}

// Custom storage implementation that works in both browser and server environments
const customStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) {
      return null;
    }

    try {
      console.log(`Supabase storage: Getting key ${key}`);

      const value = localStorage.getItem(key);
      console.log(`Supabase storage: Key ${key} ${value ? 'found' : 'not found'}`);

      return value;

    } catch (error) {
      console.error(`Supabase storage: Error getting key ${key}`, error);

      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) {
      return;
    }

    try {
      console.log(`Supabase storage: Setting key ${key}`);
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Supabase storage: Error setting key ${key}`, error);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) {
      return;
    }

    try {
      console.log(`Supabase storage: Removing key ${key}`);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Supabase storage: Error removing key ${key}`, error);
    }
  }
};

// Create Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true, // Enable debug mode to see more logs
    storage: customStorage,
  },
  global: {
    fetch: (url, options = {}) => {
      const headers = new Headers(options.headers);

      // Prevent caching of auth-related requests
      if (typeof url === 'string' && url.includes('/auth/')) {
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        headers.set('Pragma', 'no-cache');
      }

      return fetch(url, { ...options, headers });
    },
  },
});

// Check for manual session restoration needed
const attemptSessionRestoration = async () => {
  if (!isBrowser) {
    return;
  }

  try {
    // Check if we have a session in localStorage but not in memory
    const storageKey = getAuthStorageKey();
    const storedSession = localStorage.getItem(storageKey);

    if (storedSession) {
      const sessionData = JSON.parse(storedSession);

      // Check if we have a current session
      const { data } = await supabase.auth.getSession();

      // If we have stored session but not active one, try to restore it
      if (!data.session && sessionData.access_token && sessionData.refresh_token) {
        console.log('Attempting to restore session from localStorage');

        // Set the session using the SDK
        await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });

        console.log('Session restored successfully');
      }
    }
  } catch (error) {
    console.error('Error restoring session:', error);
  }
};

// Log when client is ready in browser environment
if (isBrowser) {
  window.addEventListener('load', () => {
    console.log('Window loaded - checking Supabase auth state');

    // Try to restore session first
    attemptSessionRestoration().then(() => {
      // Then check current session
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error('Error getting session on window load:', error);
        } else if (data.session) {
          console.log('Session found on window load for user:', data.session.user.email);
        } else {
          console.log('No session found on window load');
        }
      });
    });
  });

  window.refreshAuthState = () => {
    console.log('Manually refreshing auth state');

    return supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error refreshing auth state:', error);

        return null;
      }

      if (data.session) {
        console.log('Session found during refresh for user:', data.session.user.email);
        window.dispatchEvent(new Event('supabase.auth.refresh'));

        return data.session;
      }

      console.log('No session found during refresh');

      // Try session restoration
      return attemptSessionRestoration().then(() => {
        return supabase.auth.getSession().then(({ data: refreshData }) => {
          if (refreshData.session) {
            console.log('Session restored during refresh');
            window.dispatchEvent(new Event('supabase.auth.refresh'));

            return refreshData.session;
          }

          return null;
        });
      });
    });
  };
}

// Helper function to get the correct redirect URL based on environment
export function getRedirectURL(path: string = '/auth/callback'): string {
  if (!isBrowser) {
    return path;
  }

  // Use the actual origin of the current window
  return `${window.location.origin}${path}`;
}

// Sign in with OAuth providers
export async function signInWithGoogle() {
  console.log('Signing in with Google...');
  console.log('Using redirect URL:', getRedirectURL());

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

  if (error) {
    console.error('Error signing in with Google:', error);
  } else {
    console.log('Google sign-in initiated successfully');
  }

  return { error };
}

export async function signInWithGitHub() {
  console.log('Signing in with GitHub...');
  console.log('Using redirect URL:', getRedirectURL());

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: getRedirectURL(),
    },
  });

  if (error) {
    console.error('Error signing in with GitHub:', error);
  } else {
    console.log('GitHub sign-in initiated successfully');
  }

  return { error };
}

export default supabase;

export type { User, Session } from '@supabase/supabase-js';

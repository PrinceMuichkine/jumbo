import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { clearAuthState } from '@/utils/localStorage';

// Create custom events for auth state changes to ensure all components update immediately
export const SIGNOUT_EVENT = 'jumbo:user:signout';
export const SIGNIN_EVENT = 'jumbo:user:signin';

// Define the context type
interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
  refreshUser: async () => { return null; },
});

// Define the provider component as a named function to help with Fast Refresh
function UserProviderComponent({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // Always get authenticated user data from getUser() first
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting authenticated user:', userError);
        setUser(null);
        return null;
      }

      const newUser = userData?.user || null;
      setUser(newUser);

      // Get access token for auth operations, but DO NOT use session.user
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      // If user was successfully fetched, dispatch sign-in event
      if (newUser) {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent(SIGNIN_EVENT, { detail: { user: newUser } });
          window.dispatchEvent(event);
        }
      }

      return newUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Update states immediately for a responsive UI
      setUser(null);
      setSession(null);

      // Dispatch a global event so all components can react immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SIGNOUT_EVENT));
      }

      // Clear local storage immediately
      clearAuthState();

      // Perform the actual signout in the background
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }

      // Navigate to home page immediately
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, still navigate home
      window.location.href = '/';
    }
  }, []);

  // Listen for sign-out events from other components
  useEffect(() => {
    const handleSignOutEvent = () => {
      setUser(null);
      setSession(null);
      setLoading(false);
    };

    // Handle sign-in events from auth callbacks and other components
    const handleSignInEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: User }>;
      if (customEvent.detail?.user) {
        setUser(customEvent.detail.user);
        setLoading(false);
      }
    };

    window.addEventListener(SIGNOUT_EVENT, handleSignOutEvent);
    window.addEventListener(SIGNIN_EVENT, handleSignInEvent);

    return () => {
      window.removeEventListener(SIGNOUT_EVENT, handleSignOutEvent);
      window.removeEventListener(SIGNIN_EVENT, handleSignInEvent);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const fetchUser = async () => {
      try {
        setLoading(true);

        // Always use getUser() first for authenticated data
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error getting authenticated user:', userError);
          if (isMounted) setUser(null);
        } else {
          const newUser = userData?.user || null;
          if (isMounted) {
            setUser(newUser);

            // Dispatch sign-in event if we have a user
            if (newUser && typeof window !== 'undefined') {
              const event = new CustomEvent(SIGNIN_EVENT, { detail: { user: newUser } });
              window.dispatchEvent(event);
            }
          }
        }

        // Get access token only - DO NOT use session.user
        const { data: sessionData } = await supabase.auth.getSession();
        if (isMounted) setSession(sessionData.session);

        // Set up auth state change listener - only do this once
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            // IMPORTANT: Never directly use the session.user from the event!
            // Store the session for token info only
            if (isMounted) setSession(newSession);

            // For SIGNED_OUT events, update UI immediately without waiting for getUser()
            if (event === 'SIGNED_OUT') {
              if (isMounted) {
                setUser(null);
                setSession(null);

                // Dispatch a global event so all components can react immediately
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event(SIGNOUT_EVENT));
                }
              }
              return;
            }

            // For SIGNED_IN events, update UI immediately with session user
            if (event === 'SIGNED_IN' && newSession?.user) {
              if (isMounted) {
                setUser(newSession.user);
                setLoading(false);

                // Dispatch a global event for SIGNED_IN
                if (typeof window !== 'undefined') {
                  const signInEvent = new CustomEvent(SIGNIN_EVENT, { detail: { user: newSession.user } });
                  window.dispatchEvent(signInEvent);
                }
              }
              return;
            }

            // For other events, verify with getUser()
            const { data, error } = await supabase.auth.getUser();
            if (error) {
              console.error('Error getting authenticated user after state change:', error);
              if (isMounted) setUser(null);
            } else if (data?.user) {
              if (isMounted) {
                setUser(data.user);

                // Dispatch sign-in event for any auth event that resulted in a user
                if (typeof window !== 'undefined') {
                  const signInEvent = new CustomEvent(SIGNIN_EVENT, { detail: { user: data.user } });
                  window.dispatchEvent(signInEvent);
                }
              }
            }
          }
        );

        authSubscription = subscription;
      } catch (error) {
        console.error('Error fetching user:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, session, loading, signOut, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Export the provider as a named export to help with Fast Refresh
export const UserProvider = UserProviderComponent;

// Export the hook as a named function to help with Fast Refresh
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

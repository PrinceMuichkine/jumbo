import { useStore } from '@nanostores/react';
import { ClientOnly } from '@/components/utils/ClientOnly';
import { chatStore } from '@/lib/stores/chat';
import { classNames } from '@/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '@/lib/persistence/ChatDescription.client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AuthModal } from '@/components/auth/AuthModal';
import { motion } from 'framer-motion';
import { toast } from '@/lib/hooks/use-toast';

// Type declaration for the global window object to include our custom function
declare global {
  interface Window {
    refreshAuthState?: () => Promise<any>;
  }
}

type AuthCleanup = (() => void) | { unsubscribe: () => void } | undefined;

export function Header() {
  const chat = useStore(chatStore);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Add useEffect for debugging localStorage
  useEffect(() => {
    // Check localStorage for auth keys
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(key => key.includes('supabase'));
      console.log('Auth-related localStorage keys:', authKeys);

      // Log auth-related values
      authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value ? 'Has value' : 'Empty'}`);
      });
    }
  }, [user]); // Re-run when user changes

  // Function to check auth state
  const checkAuthState = async () => {
    try {
      console.log('Header: Checking auth state');

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Header: Error getting session', error);
      } else if (session) {
        console.log('Header: Session found for user', session.user.email);
        setUser(session.user);
      } else {
        console.log('Header: No session found');
        setUser(null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Header: Error checking auth state', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        console.log('Header: Initializing auth state...');

        await checkAuthState();

        // Then listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Header: Auth state changed:", event);
          console.log("Header: Session in auth change:", session ? 'Present' : 'Not present');

          if (session?.user) {
            console.log("Header: User in auth change:", session.user.email);
          }

          if (mounted) {
            setUser(session?.user ?? null);

            // Show toast for sign in/out events
            if (event === 'SIGNED_IN') {
              toast({
                title: "Signed in",
                description: `Welcome${session?.user?.email ? ' ' + session.user.email : ''}!`,
              });
            } else if (event === 'SIGNED_OUT') {
              toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
              });
            }
          }
        });

        // Listen for the custom refresh event
        const handleCustomRefresh = () => {
          console.log('Header: Caught custom refresh event');
          checkAuthState();
        };

        window.addEventListener('supabase.auth.refresh', handleCustomRefresh);

        // Return a cleanup function that handles both subscription and event listener
        return {
          unsubscribe: () => {
            subscription.unsubscribe();
            window.removeEventListener('supabase.auth.refresh', handleCustomRefresh);
          }
        };
      } catch (error) {
        console.error('Header: Auth initialization error:', error);

        if (mounted) {
          setLoading(false);
        }

        return undefined;
      }
    }

    const cleanup = initializeAuth() as Promise<AuthCleanup>;

    return () => {
      mounted = false;

      cleanup.then((unsub) => {
        if (unsub) {
          if (typeof unsub === 'function') {
            unsub();
          } else if (typeof unsub.unsubscribe === 'function') {
            unsub.unsubscribe();
          }
        }
      }).catch(err => {
        console.error('Error cleaning up auth subscriptions:', err);
      });
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('Header: Signing out...');
      await supabase.auth.signOut();
      console.log('Header: Sign out completed');
    } catch (error) {
      console.error('Header: Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header
        className={classNames(
          'flex items-center p-5 border-b h-[var(--header-height)] bg-jumbo-elements-background-depth-1',
          {
            'border-transparent': !chat.started,
            'border-jumbo-elements-borderColor': chat.started,
          },
        )}
      >
        <div className="flex items-center gap-2 z-logo text-jumbo-elements-textPrimary cursor-pointer">
          <div className="i-ph:sidebar-simple-duotone text-xl" />
          <a href="/" className="text-2xl font-semibold text-accent flex items-center">
            <span className="i-jumbo:logo-text?mask w-[75px] h-[75px] inline-block" />
          </a>
        </div>
        <span className="flex-1 px-4 truncate text-center text-jumbo-elements-textPrimary">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </span>

        <div className="flex items-center gap-4">
          {chat.started && (
            <ClientOnly>
              {() => (
                <div>
                  <HeaderActionButtons />
                </div>
              )}
            </ClientOnly>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-jumbo-elements-button-primary-background flex items-center justify-center text-jumbo-elements-button-primary-text font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={user.email || "Signed in user"}
                  >
                    {user.email?.[0].toUpperCase() || 'U'}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignOut}
                    className="text-sm text-jumbo-elements-textSecondary hover:text-jumbo-elements-textPrimary transition-colors"
                  >
                    Sign out
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors"
                >
                  Sign in
                </motion.button>
              )}
            </>
          )}
        </div>
      </header>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="signin"
      />
    </>
  );
}

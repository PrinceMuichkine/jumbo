import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '@/lib/stores/chat';
import { classNames } from '@/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '@/lib/persistence/ChatDescription.client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthModal } from '@/components/auth/AuthModal';
import { motion } from 'framer-motion';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';
import { supabase as supabaseClient } from '@/lib/supabase/client';
import { useUser, SIGNOUT_EVENT, SIGNIN_EVENT } from '@/lib/contexts/UserContext';

export function Header() {
  const chat = useStore(chatStore);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const context = useOutletContext<SupabaseOutletContext>();
  const { user, loading, signOut } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(user);
  const [localLoading, setLocalLoading] = useState(loading);

  // Sync with context
  useEffect(() => {
    setLocalUser(user);
    setLocalLoading(loading);
  }, [user, loading]);

  // Listen for auth events
  useEffect(() => {
    // Reset state on sign-out event
    const handleSignOutEvent = () => {
      setLocalUser(null);
      setLocalLoading(false);
      setIsSigningOut(false);
    };

    // Handle sign-in events
    const handleSignInEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: User }>;

      if (customEvent.detail?.user) {
        setLocalUser(customEvent.detail.user);
        setLocalLoading(false);
      }
    };

    window.addEventListener(SIGNOUT_EVENT, handleSignOutEvent);
    window.addEventListener(SIGNIN_EVENT, handleSignInEvent);

    return () => {
      window.removeEventListener(SIGNOUT_EVENT, handleSignOutEvent);
      window.removeEventListener(SIGNIN_EVENT, handleSignInEvent);
    };
  }, []);

  // Use the context supabase if available, otherwise fall back to the client
  const supabase = context?.supabase || supabaseClient;

  // Immediately refresh user on mount to ensure we have the latest data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always verify with getUser on component mount
        const { data } = await supabase.auth.getUser();

        // If we have user data from getUser, update local state immediately
        if (data?.user) {
          setLocalUser(data.user);
          setLocalLoading(false);

          // Dispatch a sign-in event to sync other components
          const signInEvent = new CustomEvent(SIGNIN_EVENT, { detail: { user: data.user } });
          window.dispatchEvent(signInEvent);
        }
      } catch (error) {
        console.error('Error verifying user on header mount:', error);
      }
    };

    checkAuth();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      // Update local state immediately for responsive UI
      setIsSigningOut(true);
      setLocalUser(null);

      // Set a timeout to ensure UI state gets reset if sign-out takes too long
      const timeoutId = setTimeout(() => {
        setIsSigningOut(false);
      }, 3000); // 3 second timeout as fallback

      await signOut(); // This already redirects to homepage
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
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

          <ClientOnly>
            {() => (
              localLoading ? (

                // Show a loading state
                <div className="w-[84px] h-[34px] bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ) : (
                localUser ? (
                  <motion.button
                    whileHover={{ scale: isSigningOut ? 1 : 1.05 }}
                    whileTap={{ scale: isSigningOut ? 1 : 0.95 }}
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isSigningOut
                      ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                      : 'bg-jumbo-elements-button-danger-background text-jumbo-elements-button-danger-text hover:bg-jumbo-elements-button-danger-backgroundHover'
                      }`}
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-1.5 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium hover:bg-jumbo-elements-button-primary-backgroundHover transition-colors"
                  >
                    Sign in
                  </motion.button>
                )
              )
            )}
          </ClientOnly>
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

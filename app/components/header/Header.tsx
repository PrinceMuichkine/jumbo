import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '@/lib/stores/chat';
import { classNames } from '@/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '@/lib/persistence/ChatDescription.client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AuthModal } from '@/components/auth/AuthModal';
import { motion } from 'framer-motion';

export function Header() {
  const chat = useStore(chatStore);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // check for current user session
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

          {!loading &&
            (user ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full bg-jumbo-elements-button-primary-background flex items-center justify-center text-jumbo-elements-button-primary-text font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.email?.[0].toUpperCase() || 'U'}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
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
            ))
          }
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

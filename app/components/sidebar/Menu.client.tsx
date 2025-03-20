import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '@/components/ui/Dialog';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';
import { db, deleteById, getAll, chatId, type ChatHistoryItem } from '@/lib/persistence';
import { cubicEasingFn } from '@/utils/easings';
import { logger } from '@/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { ReferralModal } from '@/components/settings/ReferralModal';
import { SubscriptionModal } from '@/components/settings/SubscriptionModal';
import { useUser } from '@/lib/contexts/UserContext';
import { SIGNOUT_EVENT, SIGNIN_EVENT } from '@/lib/contexts/UserEvents';
import type { User } from '@supabase/supabase-js';

// Import supabase-user-fixes.d.ts to make TS aware of the email property
import '@/lib/types/supabase-user-fixes';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function Menu() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const { user, loading, signOut } = useUser();
  const [localUser, setLocalUser] = useState<User | null>(user);
  const [localLoading, setLocalLoading] = useState(loading);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Sync with context
  useEffect(() => {
    setLocalUser(user);
    setLocalLoading(loading);
  }, [user, loading]);

  // Listen for sign-out events
  useEffect(() => {
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

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();

          if (chatId.get() === item.id) {
            // hard page navigation to clear the stores
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        setOpen(false);
      }
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      // Update local state immediately
      setIsSigningOut(true);
      setLocalUser(null);

      // Set a timeout to ensure UI state gets reset if sign-out takes too long
      const timeoutId = setTimeout(() => {
        setIsSigningOut(false);
        toast.error('Sign out is taking longer than expected. Please try again.');
      }, 3000); // 3 second timeout as fallback

      await signOut();
      clearTimeout(timeoutId);

      // signOut already redirects to home page
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const openHelpCenter = () => {
    window.open('https://help.jumbo.lomi.africa', '_blank');
  };

  // Check if we're on the home page
  const isHomePage = window.location.pathname === '/';

  return (
    <>
      <motion.div
        ref={menuRef}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={menuVariants}
        className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-jumbo-elements-background-depth-2 dark:bg-gray-900 border-r rounded-r-3xl border-jumbo-elements-borderColor z-sidebar shadow-xl shadow-jumbo-elements-sidebar-dropdownShadow text-sm"
      >
        <div className="flex items-center h-[var(--header-height)]">{/* Placeholder */}</div>
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          <div className="p-4">
            <a
              href="/"
              className="flex gap-2 items-center bg-jumbo-elements-sidebar-buttonBackgroundDefault text-jumbo-elements-sidebar-buttonText hover:bg-jumbo-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
            >
              <span className="inline-block i-jumbo:chat scale-110" />
              Start new chat
            </a>
          </div>
          <div className="text-jumbo-elements-textPrimary font-medium pl-6 pr-5 my-2">Your Chats</div>
          <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
            {list.length === 0 && <div className="pl-2 text-jumbo-elements-textTertiary">No previous conversations</div>}
            <DialogRoot open={dialogContent !== null}>
              {binDates(list).map(({ category, items }) => (
                <div key={category} className="mt-4 first:mt-0 space-y-1">
                  <div className="text-jumbo-elements-textTertiary sticky top-0 z-1 bg-jumbo-elements-background-depth-2 dark:bg-gray-900 pl-2 pt-2 pb-1">
                    {category}
                  </div>
                  {items.map((item) => (
                    <HistoryItem key={item.id} item={item} onDelete={() => setDialogContent({ type: 'delete', item })} />
                  ))}
                </div>
              ))}
              <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
                {dialogContent?.type === 'delete' && (
                  <>
                    <DialogTitle>Delete Chat?</DialogTitle>
                    <DialogDescription asChild>
                      <div>
                        <p>
                          You are about to delete <strong>{dialogContent.item.description}</strong>.
                        </p>
                        <p className="mt-1">Are you sure you want to delete this chat?</p>
                      </div>
                    </DialogDescription>
                    <div className="px-5 pb-4 bg-jumbo-elements-background-depth-2 dark:bg-gray-800 flex gap-2 justify-end">
                      <DialogButton type="secondary" onClick={closeDialog}>
                        Cancel
                      </DialogButton>
                      <DialogButton
                        type="danger"
                        onClick={(event) => {
                          deleteItem(event, dialogContent.item);
                          closeDialog();
                        }}
                      >
                        Delete
                      </DialogButton>
                    </div>
                  </>
                )}
              </Dialog>
            </DialogRoot>
          </div>

          {/* Menu options - only show to authenticated users */}
          <div className="border-t border-jumbo-elements-borderColor px-4 py-3">
            {!localLoading && localUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowReferralModal(true);
                    setShowSettingsModal(false);
                    setShowSubscriptionModal(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-jumbo-elements-textPrimary hover:text-green-500 rounded-md transition-colors mb-1 bg-transparent"
                >
                  <span className="i-ph:gift-duotone text-lg text-green-500 mr-2.5" />
                  Get free credits
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSettingsModal(true);
                    setShowReferralModal(false);
                    setShowSubscriptionModal(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-jumbo-elements-textPrimary hover:text-jumbo-elements-textTertiary rounded-md transition-colors mb-1 bg-transparent"
                >
                  <span className="i-ph:gear-six-duotone text-lg text-blue-500 mr-2.5" />
                  Settings
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openHelpCenter}
                  className="flex items-center w-full px-3 py-2 text-sm text-jumbo-elements-textPrimary hover:text-jumbo-elements-textTertiary rounded-md transition-colors mb-1 bg-transparent"
                >
                  <span className="i-ph:question-duotone text-lg text-purple-500 mr-2.5" />
                  Help
                </motion.button>

                <div className="mx-1 my-2 border-t border-jumbo-elements-borderColor"></div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSubscriptionModal(true);
                    setShowReferralModal(false);
                    setShowSettingsModal(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-jumbo-elements-textPrimary hover:text-jumbo-elements-textTertiary rounded-md transition-colors mb-1 bg-transparent"
                >
                  <span className="i-ph:credit-card-duotone text-lg text-yellow-500 mr-2.5" />
                  My subscription
                </motion.button>
              </>
            ) : localLoading ? (

              // Show loading state
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md mb-2"></div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openHelpCenter}
                className="flex items-center w-full px-3 py-2 text-sm text-jumbo-elements-textPrimary hover:text-jumbo-elements-textTertiary rounded-md transition-colors mb-1 bg-transparent"
              >
                <span className="i-ph:question-duotone text-lg text-purple-500 mr-2.5" />
                Help
              </motion.button>
            )}

            {/* Only show sign out button if we're not on the home page and user is logged in */}
            {!isHomePage && !localLoading && localUser && (
              <motion.button
                whileHover={{ scale: isSigningOut ? 1 : 1.02 }}
                whileTap={{ scale: isSigningOut ? 1 : 0.98 }}
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${isSigningOut
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-jumbo-elements-button-danger-text hover:text-red-300 bg-transparent'
                  }`}
              >
                <span className="i-ph:sign-out-duotone text-lg text-red-500 mr-2.5" />
                {isSigningOut ? 'Signing out...' : 'Sign out'}
              </motion.button>
            )}
          </div>

          {/* User profile and theme toggle */}
          <div className="flex items-center border-t border-jumbo-elements-borderColor p-4">
            {!localLoading && localUser ? (
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-md">
                  {/* Show avatar from OAuth provider if available (GitHub/Google) */}
                  {localUser.user_metadata?.avatar_url ? (
                    <img
                      src={localUser.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : localUser.user_metadata?.picture ? (
                    <img
                      src={localUser.user_metadata.picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (

                    // Use our proxy route for Vercel avatar
                    <img
                      src={`/api/avatar/${encodeURIComponent((localUser.email ?? '').toLowerCase())}?rounded=true`}
                      alt="Generated avatar"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="ml-2 overflow-hidden">
                  <p className="text-sm font-medium text-jumbo-elements-textPrimary truncate">
                    {localUser.user_metadata?.full_name || (localUser.email && localUser.email.split('@')[0]) || 'User'}
                  </p>
                  <p className="text-xs text-jumbo-elements-textSecondary truncate">{localUser.email || ''}</p>
                </div>
              </div>
            ) : localLoading ? (
              <div className="flex-1 animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded-md"></div>
              </div>
            ) : null}
            <ThemeSwitch className="ml-auto" />
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />

      {/* Referral Modal */}
      <ReferralModal open={showReferralModal} onOpenChange={setShowReferralModal} />

      {/* Subscription Modal */}
      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </>
  );
}

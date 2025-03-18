import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState<'signin' | 'signup'>(defaultTab);

  React.useEffect(() => {
    if (open) {
      // Reset to default tab when opening
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  if (!open) { return null; }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-[425px] max-w-md rounded-lg shadow-lg bg-white dark:bg-gray-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'signin' ? (
              <SignIn onSwitchToSignUp={() => setActiveTab('signup')} />
            ) : (
              <SignUp onSwitchToSignIn={() => setActiveTab('signin')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

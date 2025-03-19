import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import ResetPasswordForm from './ResetPasswordForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup' | 'resetPassword';
}

export function AuthModal({ open, onOpenChange, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState<'signin' | 'signup' | 'resetPassword'>(defaultTab);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    if (open) {
      // Reset to default tab when opening
      setActiveTab(defaultTab);

      // Add a class to the body to style elements outside the modal
      document.body.classList.add('modal-open');
    } else {
      // Remove the class when the modal is closed
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to ensure we remove the class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [open, defaultTab]);

  const handleForgotPassword = (currentEmail: string) => {
    console.log("Forgot password clicked with email:", currentEmail);
    setEmail(currentEmail);
    setActiveTab('resetPassword');
  };

  if (!open) { return null; }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={() => onOpenChange(false)}
      style={{ backdropFilter: 'blur(1px)' }}
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
              <SignIn
                onSwitchToSignUp={() => setActiveTab('signup')}
                onForgotPassword={handleForgotPassword}
              />
            ) : activeTab === 'signup' ? (
              <SignUp onSwitchToSignIn={() => setActiveTab('signin')} />
            ) : (
              <ResetPasswordForm onBackToSignIn={() => setActiveTab('signin')} email={email} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

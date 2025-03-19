import React, { useState } from 'react';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';
import { toast } from '@/lib/hooks/use-toast';

interface ResetPasswordFormProps {
  onBackToSignIn?: () => void;
  email?: string;
}

export default function ResetPasswordForm({ onBackToSignIn, email: initialEmail }: ResetPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for a link to reset your password.",
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while trying to reset your password.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-transparent">
        <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Check your email</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
            <p className="text-green-800 dark:text-green-200">
              If an account exists with the email <strong>{email}</strong>, we've sent instructions to reset your password.
            </p>
          </div>
          {onBackToSignIn && (
            <button
              onClick={onBackToSignIn}
              className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors hover:bg-jumbo-elements-button-primary-backgroundHover"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Reset your password</h2>
      <p className="text-jumbo-elements-textSecondary mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleResetRequest} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
            placeholder="Email address**"
          />
        </div>
        {error && (
          <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
        )}
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            disabled={isSending}
            className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
          >
            {isSending ? 'Sending reset link...' : 'Send reset link'}
          </button>
          {onBackToSignIn && (
            <button
              type="button"
              onClick={onBackToSignIn}
              className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-transparent text-jumbo-elements-textPrimary text-sm font-medium transition-colors hover:bg-jumbo-elements-bg-depth-1"
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

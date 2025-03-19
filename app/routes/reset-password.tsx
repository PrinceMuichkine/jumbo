import React, { useState } from 'react';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';
import { toast } from '@/lib/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      toast({
        title: "Error",
        description: "Passwords don't match. Please try again.",
        variant: "destructive",
      });

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSuccess(true);
        toast({
          title: "Password updated",
          description: "Your password has been reset successfully. You'll be redirected to login shortly.",
          variant: "success",
        });

        // Redirect after successful password reset
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred while resetting your password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-jumbo-elements-background p-4">
      <div className="w-full max-w-md bg-transparent rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Reset Your Password</h2>

        {success ? (
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
            <p className="text-green-800 dark:text-green-200 text-center">
              Password has been reset successfully. You'll be redirected to the login page shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
                placeholder="New password**"
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
                placeholder="Confirm password"
              />
            </div>
            {error && (
              <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
            >
              {isSubmitting ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

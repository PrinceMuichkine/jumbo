import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getRedirectURL } from '@/lib/supabase/client';
import { toast } from '@/lib/hooks/use-toast';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';

interface SignInProps {
  onSwitchToSignUp?: () => void;
}

export function SignIn({ onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectURL(),
        },
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmail('');
        toast({
          title: "Check your email",
          description: "We've sent you a magic link to sign in.",
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Welcome back</h2>
      <div className="space-y-4">
        {/* Email login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-jumbo-elements-textSecondary mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
              placeholder="your@email.com**"
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
            {isSubmitting ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-jumbo-elements-borderColor"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-jumbo-elements-textSecondary">Or continue with</span>
          </div>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'var(--jumbo-elements-button-primary-background)',
                  brandAccent: 'var(--jumbo-elements-button-primary-backgroundHover)',
                  inputBackground: 'transparent',
                  inputBorder: 'var(--jumbo-elements-borderColor)',
                  inputText: 'var(--jumbo-elements-textPrimary)',
                  inputLabelText: 'var(--jumbo-elements-textSecondary)',
                },
              },
            },
            style: {
              button: {
                fontWeight: '500',
                padding: '8px 12px',
                height: '42px',
                backgroundColor: 'var(--jumbo-elements-bg-depth-1)',
                color: 'var(--jumbo-elements-textPrimary)',
                border: '1px solid var(--jumbo-elements-borderColor)',
              },
              container: {
                backgroundColor: 'transparent',
              },
              divider: {
                backgroundColor: 'var(--jumbo-elements-borderColor)',
              },
              input: {
                display: 'none',
              },
              label: {
                display: 'none',
              },
              message: {
                display: 'none'
              },
              anchor: {
                display: 'none'
              }
            },
          }}
          view="sign_in"
          showLinks={false}
          providers={['github', 'google']}
          onlyThirdPartyProviders={true}
          queryParams={{
            access_type: 'offline',
            prompt: 'consent',
          }}
        />

        {onSwitchToSignUp && (
          <div className="mt-4 text-center">
            <p className="text-jumbo-elements-textSecondary text-sm">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-jumbo-elements-button-primary-text hover:underline font-medium bg-transparent"
              >
                Create an account
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

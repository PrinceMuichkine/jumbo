import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import * as React from 'react';
import { supabase, getRedirectURL } from '@/lib/supabase/client';

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectURL(),
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setEmail('');
        setPassword('');

        // Show success message or redirect
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Create an account</h2>
      <div className="space-y-4">
        {/* Email signup form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-jumbo-elements-textSecondary mb-1">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
              placeholder="your@email.com**"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-jumbo-elements-textSecondary mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
          )}

          <div className="text-xs text-center text-jumbo-elements-textSecondary">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-jumbo-elements-button-primary-text hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-jumbo-elements-button-primary-text hover:underline">
              Privacy Policy
            </a>
            .
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
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
          view="sign_up"
          showLinks={false}
          providers={['github', 'google']}
          onlyThirdPartyProviders={true}
        />

        {onSwitchToSignIn && (
          <div className="mt-4 text-center">
            <p className="text-jumbo-elements-textSecondary text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToSignIn}
                className="text-jumbo-elements-button-primary-text hover:underline font-medium bg-transparent"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

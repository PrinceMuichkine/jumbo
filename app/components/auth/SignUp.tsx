import * as React from 'react';
import { getRedirectURL } from '@/lib/supabase/client';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';
import { toast } from '@/lib/hooks/use-toast';

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9]+([\._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;

// Password strength validation
const hasLowerCase = (str: string) => /[a-z]/.test(str);
const hasUpperCase = (str: string) => /[A-Z]/.test(str);
const hasNumber = (str: string) => /[0-9]/.test(str);
const hasSpecialChar = (str: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
const isLongEnough = (str: string) => str.length >= 8;

export function SignUp({ onSwitchToSignIn }: SignUpProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = React.useState(false);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false,
  });
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  // Validate email when it changes
  React.useEffect(() => {
    if (email) {
      setIsEmailValid(EMAIL_REGEX.test(email));
    } else {
      setIsEmailValid(null);
    }
  }, [email]);

  // Validate password strength when it changes
  React.useEffect(() => {
    if (password) {
      const hasLower = hasLowerCase(password);
      const hasUpper = hasUpperCase(password);
      const hasNum = hasNumber(password);
      const hasSpecial = hasSpecialChar(password);
      const isLong = isLongEnough(password);

      let score = 0;

      if (hasLower) {score++;}

      if (hasUpper) {score++;}

      if (hasNum) {score++;}

      if (hasSpecial) {score++;}

      if (isLong) {score++;}

      setPasswordStrength({
        score,
        hasLower,
        hasUpper,
        hasNumber: hasNum,
        hasSpecial,
        isLongEnough: isLong,
      });
    } else {
      setPasswordStrength({
        score: 0,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
        isLongEnough: false,
      });
    }
  }, [password]);

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
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmail('');
        setPassword('');
        setSignupSuccess(true);

        toast({
          title: "Account created",
          description: "Check your email for a verification link to activate your account.",
          variant: "success",
        });
      }
    } catch (err) {
      console.error('Sign up error:', err);
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

  const getEmailBorderClass = () => {
    if (isEmailValid === null) {return "border-jumbo-elements-borderColor";}

    return isEmailValid
      ? "border-green-500 ring-1 ring-green-500"
      : "border-red-500 ring-1 ring-red-500";
  };

  const getPasswordBorderClass = () => {
    if (!password) {return "border-jumbo-elements-borderColor";}

    return passwordStrength.score >= 4
      ? "border-green-500 ring-1 ring-green-500"
      : "border-red-500 ring-1 ring-red-500";
  };

  const isSignUpDisabled = () => {
    return !isEmailValid || passwordStrength.score < 4 || isSubmitting;
  };

  if (signupSuccess) {
    return (
      <div className="bg-transparent">
        <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Account created</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
            <p className="text-green-800 dark:text-green-200">
              Your account has been created successfully! You can now sign in with your credentials.
            </p>
          </div>

          <button
            onClick={onSwitchToSignIn}
            className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors hover:bg-jumbo-elements-button-primary-backgroundHover"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Create an account</h2>
      <div className="space-y-4">
        {/* Email signup form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none ${getEmailBorderClass()}`}
              placeholder="Email address**"
            />
          </div>

          <div>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none ${getPasswordBorderClass()}`}
              placeholder="••••••••••••"
            />
            {password && passwordStrength.score < 5 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${index <= passwordStrength.score ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${passwordStrength.isLongEnough ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    8+ chars
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${passwordStrength.hasLower ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    abc
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${passwordStrength.hasUpper ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    ABC
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${passwordStrength.hasNumber ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    123
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${passwordStrength.hasSpecial ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                    !@#
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
          )}

          <div className="text-[11px] text-center text-jumbo-elements-textSecondary">
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
            disabled={isSignUpDisabled()}
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
            <span className="px-4 bg-white dark:bg-gray-950 text-sm text-jumbo-elements-textSecondary">Or continue with</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);

              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'github',
                  options: {
                    redirectTo: getRedirectURL(),
                  },
                });

                if (error) {throw error;}
              } catch (err) {
                console.error('GitHub login error:', err);
                toast({
                  title: "Error",
                  description: "Failed to sign in with GitHub",
                  variant: "destructive",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="w-full h-[42px] px-3 rounded-md bg-[#333] hover:bg-[#444] dark:bg-[#171515] dark:hover:bg-[#2b2a2a] text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);

              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: getRedirectURL(),
                    queryParams: {
                      access_type: 'offline',
                      prompt: 'consent',
                    },
                  },
                });

                if (error) {throw error;}
              } catch (err) {
                console.error('Google login error:', err);
                toast({
                  title: "Error",
                  description: "Failed to sign in with Google",
                  variant: "destructive",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="w-full h-[42px] px-3 rounded-md bg-white hover:bg-gray-50 dark:bg-[#333] dark:hover:bg-[#444] text-gray-600 dark:text-white border border-gray-300 dark:border-transparent text-sm font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" className="dark:fill-white" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" className="dark:fill-white" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" className="dark:fill-white" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" className="dark:fill-white" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

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

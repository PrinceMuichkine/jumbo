import React, { useState, useEffect } from 'react';
import { getRedirectURL } from '@/lib/supabase/client';
import { toast } from '@/lib/hooks/use-toast';
import { useOutletContext } from '@remix-run/react';
import type { SupabaseOutletContext } from '@/lib/types/supabase.types';

interface SignInProps {
  onSwitchToSignUp?: () => void;
  onForgotPassword?: (email: string) => void;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9]+([\._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;

// Password strength validation
const hasLowerCase = (str: string) => /[a-z]/.test(str);
const hasUpperCase = (str: string) => /[A-Z]/.test(str);
const hasNumber = (str: string) => /[0-9]/.test(str);
const hasSpecialChar = (str: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
const isLongEnough = (str: string) => str.length >= 8;

export function SignIn({ onSwitchToSignUp, onForgotPassword }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    isLongEnough: false,
  });
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  // Validate email when it changes
  useEffect(() => {
    if (email) {
      setIsEmailValid(EMAIL_REGEX.test(email));
    } else {
      setIsEmailValid(null);
    }
  }, [email]);

  // Validate password strength when it changes
  useEffect(() => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectURL(),
          shouldCreateUser: true,
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
        setShowOtpVerification(true);
        toast({
          title: "Check your email",
          description: "We've sent you a login link. Please check your inbox and spam folder.",
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.session) {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        });

        window.location.href = '/';
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('An unexpected error occurred during verification');
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingCode(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectURL(),
          shouldCreateUser: true,
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
        toast({
          title: "Code sent",
          description: "A new verification code has been sent to your email.",
        });
      }
    } catch (err) {
      console.error('Resend code error:', err);
      setError('Failed to resend verification code');
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setResendingCode(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        });

        window.location.href = '/';
      }
    } catch (err) {
      console.error('Password login error:', err);
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

  const handleForgotPassword = async () => {
    if (onForgotPassword) {
      onForgotPassword(email);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!email || !isEmailValid) {
        toast({
          title: "Please enter a valid email",
          description: "We need your email address to send you a password reset link.",
          variant: "destructive",
        });
        setIsSubmitting(false);

        return;
      }

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
        toast({
          title: "Password reset email sent",
          description: "Check your email for a link to reset your password.",
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while trying to reset your password.",
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

  const isPasswordLoginDisabled = () => {
    return !isEmailValid || passwordStrength.score < 4 || isSubmitting;
  };

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold mb-4 text-jumbo-elements-textPrimary text-left">Welcome back</h2>
      <div className="space-y-4">
        {!showOtpVerification ? (
          !showPasswordLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none ${getEmailBorderClass()}`}
                  placeholder="Email address**"
                />
              </div>
              {error && (
                <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
              )}
              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isEmailValid}
                  className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
                >
                  {isSubmitting ? 'Sending link...' : 'Send magic link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordLogin(true)}
                  className="w-full h-[42px] px-3 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-medium transition-colors dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/50"
                >
                  Use password instead
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <input
                  id="email-password"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none ${getEmailBorderClass()}`}
                  placeholder="Email address**"
                />
              </div>
              <div className="relative mb-1">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none ${getPasswordBorderClass()}`}
                  placeholder="Password**"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleForgotPassword();
                  }}
                  className="absolute right-2 top-[14px] text-xs text-jumbo-elements-button-primary-text hover:underline bg-transparent"
                >
                  Forgot password?
                </button>
              </div>
              {error && (
                <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
              )}
              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={isPasswordLoginDisabled()}
                  className="w-full h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in with password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordLogin(false)}
                  className="w-full h-[42px] px-3 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-medium transition-colors dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-900/50"
                >
                  Use magic link instead
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-jumbo-elements-textSecondary mb-1">
                Enter the code from your email
              </label>
              <input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-white dark:bg-gray-800 text-jumbo-elements-textPrimary focus:outline-none focus:ring-1 focus:ring-jumbo-elements-button-primary-text"
                placeholder="123456**"
              />
            </div>
            {error && (
              <div className="text-sm text-jumbo-elements-button-danger-text mt-1">{error}</div>
            )}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={verifyingOtp}
                className="flex-1 h-[42px] px-3 rounded-md bg-jumbo-elements-button-primary-background text-jumbo-elements-button-primary-text text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-jumbo-elements-button-primary-backgroundHover"
              >
                {verifyingOtp ? 'Verifying...' : 'Verify code'}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpVerification(false)}
                className="h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-transparent text-jumbo-elements-textPrimary text-sm font-medium transition-colors hover:bg-jumbo-elements-bg-depth-1"
              >
                Back
              </button>
            </div>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendingCode}
              className="w-full h-[42px] px-3 rounded-md border border-jumbo-elements-borderColor bg-transparent text-jumbo-elements-textPrimary text-sm font-medium transition-colors hover:bg-jumbo-elements-bg-depth-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendingCode ? 'Sending...' : 'Resend code'}
            </button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-jumbo-elements-borderColor"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-950 text-jumbo-elements-textSecondary">Or continue with</span>
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

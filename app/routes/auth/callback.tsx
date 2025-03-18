import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/lib/hooks/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next') || '/';
        const type = params.get('type');

        // Handle email verification
        if (type === 'signup' || params.get('message')?.includes('Email verified')) {
          navigate('/auth/email-verified', { replace: true });

          return;
        }

        // Handle email change confirmation
        if (type === 'email_change' || params.get('message')?.includes('Confirmation link accepted')) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (!session) {
            throw new Error('No active session found');
          }

          toast({
            title: "Success",
            description: "Email address updated successfully",
          });

          window.history.replaceState(null, '', window.location.pathname);
          navigate(next || '/settings/profile', { replace: true });

          return;
        }

        // Handle OAuth callback
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          navigate(next, { replace: true });

          return;
        }

        // No code in URL, redirect to login
        navigate('/login');
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "There was a problem signing you in. Please try again.",
          variant: "destructive",
        });
        navigate('/login?error=Authentication%20failed', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-jumbo-elements-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jumbo-elements-item-contentAccent m-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-jumbo-elements-textPrimary">Completing authentication...</h2>
        <p className="mt-2 text-jumbo-elements-textSecondary">You'll be redirected in a moment</p>
      </div>
    </div>
  );
}

export default AuthCallback;

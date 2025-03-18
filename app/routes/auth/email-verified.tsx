import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/hooks/use-toast';

export default function EmailVerified() {
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Email Verified",
      description: "Your email has been verified successfully! You can now sign in.",
    });

    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      navigate('/auth/login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-jumbo-elements-background">
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-jumbo-elements-textPrimary">Email Verified</h2>
        <p className="mt-2 text-jumbo-elements-textSecondary">Your email has been verified successfully!</p>
        <p className="mt-1 text-jumbo-elements-textSecondary">Redirecting to login...</p>
      </div>
    </div>
  );
}

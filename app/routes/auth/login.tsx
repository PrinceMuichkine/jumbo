import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Login() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorMessage = searchParams.get('error');

  // determine the default tab based on the URL search params
  const signupParam = searchParams.get('signup');
  const defaultTab = signupParam === 'true' ? 'signup' : 'signin';

  useEffect(() => {
    // if the modal is closed, redirect to the home page
    if (!isOpen) {
      navigate('/');
    }
  }, [isOpen, navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-jumbo-elements-background">
      {errorMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto max-w-md bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg shadow-lg">
          <p className="text-center">{errorMessage}</p>
        </div>
      )}

      <AuthModal open={isOpen} defaultTab={defaultTab as 'signin' | 'signup'} onOpenChange={setIsOpen} />
    </div>
  );
}

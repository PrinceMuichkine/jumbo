import { redirect } from '@remix-run/cloudflare';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SIGNIN_EVENT } from '@/lib/contexts/UserContext';

// Client-side component to trigger events after authentication
export function AuthSuccessHandler({ userId, userMetadata }: { userId: string, userMetadata?: Record<string, any> }) {
  // This client-side component helps bridge server auth with client state
  if (typeof window !== 'undefined' && userId) {
    // We need to wait a moment for the client-side hydration
    setTimeout(() => {
      try {
        // Dispatch a synthetic sign-in event to update UI immediately
        const signInEvent = new CustomEvent(SIGNIN_EVENT, {
          detail: {
            user: {
              id: userId,
              user_metadata: userMetadata
            }
          }
        });
        window.dispatchEvent(signInEvent);
      } catch (error) {
        console.error('Error dispatching sign-in event:', error);
      }
    }, 0);
  }

  return null;
}

export const loader = async ({ request }: { request: Request }) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  let userId = '';
  let userMetadata = '';

  if (code) {
    try {
      const supabase = createSupabaseServerClient({ request, response });
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        // Still redirect to home page, but with an error parameter
        return redirect('/?auth_error=exchange_failed', {
          headers: response.headers,
        });
      }

      // Extract user ID and metadata to pass to the client for immediate UI update
      if (data?.session?.user?.id) {
        userId = data.session.user.id;

        // Extract avatar URL from user metadata
        const metadata = data.session.user.user_metadata || {};

        // For Google auth, ensure we use the correct profile picture field
        if (metadata.provider === 'google' && metadata.picture && !metadata.avatar_url) {
          // Google uses 'picture' instead of 'avatar_url'
          metadata.avatar_url = metadata.picture;
        }

        // Safely encode user metadata as JSON string for URL
        userMetadata = encodeURIComponent(JSON.stringify(metadata));
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      // If there's an error, still redirect to home, with error parameter
      return redirect('/?auth_error=callback_error', {
        headers: response.headers,
      });
    }
  }

  // Append special reload parameter to ensure the page refreshes immediately
  // The force_reload=true makes the client-side code reload the page
  return redirect(`/?auth_success=true&userId=${userId}&userMetadata=${userMetadata}`, {
    headers: response.headers,
  });
};

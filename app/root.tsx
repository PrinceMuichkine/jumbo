import { useStore } from '@nanostores/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRevalidator } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabase } from './lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { TranslationProvider } from '@/lib/contexts/TranslationContext';
import { UserProvider } from '@/lib/contexts/UserContext';
import { SIGNIN_EVENT } from '@/lib/contexts/UserEvents';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('jumbo_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const authenticatedUser = userError ? null : userData?.user;
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || null;

  const env = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  };

  return json(
    { env, access_token: accessToken, user: authenticatedUser },
    { headers: response.headers }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {children}
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

// Default export is a single React component - this is crucial for Fast Refresh
export default function App() {
  const { access_token, user } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  // Handle auth callback success
  useEffect(() => {
    const handleAuthCallback = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authSuccess = params.get('auth_success');
        const userId = params.get('userId');
        const userMetadataParam = params.get('userMetadata');

        if (authSuccess === 'true' && userId) {
          const url = new URL(window.location.href);
          url.searchParams.delete('auth_success');
          url.searchParams.delete('userId');
          url.searchParams.delete('userMetadata');
          url.searchParams.delete('force_reload');
          window.history.replaceState({}, '', url.toString());

          try {
            // Parse the user metadata if available
            let userMetadata = undefined;

            if (userMetadataParam) {
              try {
                userMetadata = JSON.parse(decodeURIComponent(userMetadataParam));

                // Ensure avatar_url is available for Google auth
                if (userMetadata.provider === 'google' && userMetadata.picture && !userMetadata.avatar_url) {
                  userMetadata.avatar_url = userMetadata.picture;
                }
              } catch (parseError) {
                console.error('Error parsing user metadata:', parseError);
              }
            }

            const signInEvent = new CustomEvent(SIGNIN_EVENT, {
              detail: {
                user: {
                  id: userId,
                  user_metadata: userMetadata
                }
              }
            });
            window.dispatchEvent(signInEvent);
            revalidate();
          } catch (error) {
            console.error('Error dispatching sign-in event:', error);
          }
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
      }
    };

    handleAuthCallback();
  }, [revalidate]);

  // Monitor auth state changes
  useEffect(() => {
    if (typeof window === 'undefined') { return; }

    const serverAccessToken = access_token;
    let isRevalidating = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (newSession?.access_token !== serverAccessToken && !isRevalidating) {
        isRevalidating = true;

        if (event === 'SIGNED_IN') {
          revalidate();
          isRevalidating = false;

          return;
        }

        setTimeout(() => {
          revalidate();
          isRevalidating = false;
        }, 10);
      }

      if (event === 'SIGNED_OUT') { return; }

      try {
        await supabase.auth.getUser();
      } catch (error) {
        console.error('Error verifying user after state change:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [access_token, revalidate]);

  // Set up theme preference on initial load
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('jumbo.settings.theme');

    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <TranslationProvider>
      <UserProvider>
        <Outlet context={{ supabase, user }} />
      </UserProvider>
    </TranslationProvider>
  );
}

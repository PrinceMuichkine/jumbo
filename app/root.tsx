import { useStore } from '@nanostores/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRevalidator } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { createSupabaseServerClient } from './lib/supabase/server';
import { supabase } from './lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();

  // Create a Supabase client for the server
  const supabase = createSupabaseServerClient({ request, response });

  // Get the session from Supabase
  const { data: { session } } = await supabase.auth.getSession();

  /**
   * Pass environment variables to the client
   * We need to pass VITE_ prefixed variables for client-side code
   */
  const env = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  };

  return json(
    { env, session },
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

export default function App() {
  const { session } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    // We need to check if we're in the browser
    if (typeof window === 'undefined') {
      return;
    }

    const serverAccessToken = session?.access_token;

    // Use the pre-initialized supabase instance from client.ts
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session?.access_token !== serverAccessToken) {
        // Server and client are out of sync - revalidate
        revalidate();
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      subscription.unsubscribe();
    };
  }, [session?.access_token, revalidate]);

  // Simply provide the already-initialized supabase client
  return (
    <Outlet context={{ supabase }} />
  );
}

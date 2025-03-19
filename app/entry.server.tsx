import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { DEFAULT_THEME } from '@/lib/stores/theme';
import * as ReactDOMServer from 'react-dom/server';

/**
 * Handle both bot and non-bot requests consistently
 * This approach works in both Node.js and Edge runtimes
 */
export default async function handleRequestWrapper(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  // Add isSpaMode property needed by remix-island
  const enhancedContext = { ...remixContext, isSpaMode: false };

  // Create our React app
  const markup = ReactDOMServer.renderToString(
    <RemixServer context={enhancedContext} url={request.url} />
  );

  // Render the head using remix-island
  const head = renderHeadToString({
    request,
    remixContext: enhancedContext,
    Head
  });

  // Use default theme for server-side rendering
  const serverTheme = DEFAULT_THEME;

  // Set header values
  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'DENY');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Use standard Remix SSR with HTML customizations
  return new Response(
    `<!DOCTYPE html>
<html lang="en" data-theme="${serverTheme}">
<head>${head}</head>
<body>
  <div id="root" class="w-full h-full">${markup}</div>
</body>
</html>`,
    {
      headers: responseHeaders,
      status: responseStatusCode,
    }
  );
}

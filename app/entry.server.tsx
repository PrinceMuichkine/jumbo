import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import * as ReactDOMServer from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { DEFAULT_THEME } from '@/lib/stores/theme';

/**
 * Handle both bot and non-bot requests consistently
 * This approach works in both Node.js and Edge runtimes
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  // Add isSpaMode property needed by remix-island
  const enhancedContext = { ...remixContext, isSpaMode: false };

  const markup = ReactDOMServer.renderToString(
    <RemixServer context={enhancedContext} url={request.url} />
  );

  const head = renderHeadToString({
    request,
    remixContext: enhancedContext,
    Head
  });

  // Use default theme for server-side rendering
  const serverTheme = DEFAULT_THEME;

  // Note: The HTML structure must exactly match what the client expects for hydration
  const html = `<!DOCTYPE html>
<html lang="en" data-theme="${serverTheme}">
<head>${head}</head>
<body>
<div id="root" class="w-full h-full">${markup}</div>
</body>
</html>`;

  // Set proper content type
  responseHeaders.set('Content-Type', 'text/html');

  // Add security headers
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'DENY');

  // Add headers for SharedArrayBuffer support
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(html, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

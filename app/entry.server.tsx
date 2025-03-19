import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import pkg from 'react-dom/server';
const { renderToString } = pkg;
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '@/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const enhancedContext = { ...remixContext, isSpaMode: false };

  try {
    // Use renderToString instead of renderToReadableStream for simplicity
    const markup = renderToString(
      <RemixServer context={enhancedContext} url={request.url} />
    );

    const head = renderHeadToString({ request, remixContext: enhancedContext, Head });

    // Note: The HTML structure must exactly match what the client expects for hydration
    const html = `<!DOCTYPE html>
<html lang="en" data-theme="${themeStore.value}">
<head>${head}</head>
<body>
<div id="root" class="w-full h-full">${markup}</div>
</body>
</html>`;

    responseHeaders.set('Content-Type', 'text/html');
    responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
    responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

    return new Response(html, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
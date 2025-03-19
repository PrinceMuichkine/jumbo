// Edge Runtime config
export const config = {
  runtime: 'edge',
};

import { createRequestHandler } from '@vercel/remix';

// This import will be generated at build time by the Vercel adapter
import * as build from '@remix-run/dev/server-build';

// Create a middleware function to pass environment variables via request headers
async function handleRequest(request: Request) {
  // Create a new request with environment variables attached
  const newHeaders = new Headers(request.headers);

  // Add Supabase environment variables to headers for server-side access
  if (process.env.SUPABASE_URL) {
    newHeaders.set('X-Supabase-URL', process.env.SUPABASE_URL);
  }

  if (process.env.SUPABASE_ANON_KEY) {
    newHeaders.set('X-Supabase-Anon-Key', process.env.SUPABASE_ANON_KEY);
  }

  const enhancedRequest = new Request(request.url, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal,
  });

  // Use standard Vercel Remix request handler
  const handler = createRequestHandler(build);
  return handler(enhancedRequest);
}

export default handleRequest;

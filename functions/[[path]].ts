// Edge Runtime config
export const config = {
  runtime: 'edge',
};

import { createRequestHandler } from '@vercel/remix';

// This import will be generated at build time by the Vercel adapter
import * as build from '@remix-run/dev/server-build';

// Add a middleware function to set environment variables
async function handleRequest(request: Request) {
  // Log available environment variables for debugging
  console.log('Edge runtime environment check:', {
    hasViteUrl: typeof process.env.VITE_SUPABASE_URL === 'string',
    hasViteKey: typeof process.env.VITE_SUPABASE_ANON_KEY === 'string',
    hasPureUrl: typeof process.env.SUPABASE_URL === 'string',
    hasPureKey: typeof process.env.SUPABASE_ANON_KEY === 'string',
    nodeEnv: process.env.NODE_ENV
  });

  // Create a new request with environment variables attached
  const requestWithEnv = new Request(request.url, {
    method: request.method,
    headers: new Headers(request.headers),
    body: request.body,
    redirect: request.redirect,
    signal: request.signal,
  });

  // Add environment variables to headers so they can be accessed in loaders
  // Try to pass both VITE_ prefixed and non-prefixed versions
  const pairs: [string, string | undefined][] = [
    ['X-Supabase-URL', process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL],
    ['X-Supabase-Anon-Key', process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY],
    ['X-Vite-Supabase-URL', process.env.VITE_SUPABASE_URL],
    ['X-Vite-Supabase-Anon-Key', process.env.VITE_SUPABASE_ANON_KEY]
  ];

  // Set all available environment variables in headers
  for (const [key, value] of pairs) {
    if (value) {
      requestWithEnv.headers.set(key, value);
    }
  }

  // Set environment debug info
  requestWithEnv.headers.set('X-Env-Debug', JSON.stringify({
    hasViteUrl: Boolean(process.env.VITE_SUPABASE_URL),
    hasViteKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
    hasPureUrl: Boolean(process.env.SUPABASE_URL),
    hasPureKey: Boolean(process.env.SUPABASE_ANON_KEY)
  }));

  // Pass to the Remix handler
  const handler = createRequestHandler(build);
  return handler(requestWithEnv);
}

export default handleRequest;

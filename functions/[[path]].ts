// Edge Runtime config
export const config = {
  runtime: 'edge',
};

import { createRequestHandler } from '@vercel/remix';

// This import will be generated at build time by the Vercel adapter
import * as build from '@remix-run/dev/server-build';

// Environment variables to pass to the app
const env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_URL: process.env.VITE_SUPABASE_URL, // Create non-VITE prefixed versions
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY, // Create non-VITE prefixed versions
  NODE_ENV: process.env.NODE_ENV,
};

// Add a middleware function to set environment variables
async function handleRequest(request: Request) {
  // Check and log if important env vars are missing
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables in Edge runtime', {
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY
    });
  }

  // Create a new request with environment variables attached
  const requestWithEnv = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal,
  });

  // Set a custom header that can be read by the app
  // This is helpful for debugging
  requestWithEnv.headers.set('X-Has-Supabase-Env',
    process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY ? 'true' : 'false');

  const handler = createRequestHandler(build);
  return handler(requestWithEnv);
}

export default handleRequest;

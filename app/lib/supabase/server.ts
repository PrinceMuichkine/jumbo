import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

// Helper function to get environment variables
const getServerEnv = (key: string): string => {
  // For server environment, we need to check process.env
  if (process.env[key]) {
    return process.env[key] || '';
  }

  // For environment variables set directly in Vercel
  if (key.startsWith('VITE_') && process.env[key.replace('VITE_', '')]) {
    return process.env[key.replace('VITE_', '')] || '';
  }

  // For non-VITE prefixed keys checking VITE_ version
  if (!key.startsWith('VITE_') && process.env[`VITE_${key}`]) {
    return process.env[`VITE_${key}`] || '';
  }

  return '';
};

// Get environment variables from either process.env or request headers
const getEnvFromRequestOrProcess = (request: Request, key: string): string => {
  // First try to get from headers (set by Edge function)
  const headerKey = `X-${key.replace('_', '-')}`;
  const viteHeaderKey = `X-Vite-${key.replace('VITE_', '').replace('_', '-')}`;

  // Check all possible header names
  const headerValue =
    request.headers.get(headerKey) ||
    request.headers.get(viteHeaderKey) ||
    request.headers.get(`X-${key}`) ||
    request.headers.get(key);

  if (headerValue) {
    return headerValue;
  }

  // Fallback to process.env
  return getServerEnv(key);
};

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // Try multiple possible environment variable names and sources
  const supabaseUrl =
    getEnvFromRequestOrProcess(request, 'SUPABASE_URL') ||
    getEnvFromRequestOrProcess(request, 'VITE_SUPABASE_URL');

  const supabaseKey =
    getEnvFromRequestOrProcess(request, 'SUPABASE_ANON_KEY') ||
    getEnvFromRequestOrProcess(request, 'VITE_SUPABASE_ANON_KEY');

  // Debug for Vercel deployment
  console.log('Server environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    // Check what was passed in headers
    envDebug: request.headers.get('X-Env-Debug'),
    headerKeys: [...request.headers.keys()].filter(k =>
      k.toLowerCase().includes('supabase') ||
      k.toLowerCase().includes('vite') ||
      k.toLowerCase().includes('x-')
    )
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      // Additional debug info
      headerKeys: [...request.headers.keys()],
      availableEnvKeys: Object.keys(process.env)
        .filter(k => !k.includes('SECRET') && !k.includes('KEY'))
        .join(', ')
    });
    throw new Error('Supabase URL and key are required to create a Supabase client!');
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    { request, response }
  );

  return supabase;
};

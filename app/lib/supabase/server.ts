import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

// Log environment debug info once
if (process.env.NODE_ENV === 'development') {
  console.log('Server environment check:', {
    hasViteUrl: typeof process.env['VITE_SUPABASE_URL'] === 'string',
    hasViteKey: typeof process.env['VITE_SUPABASE_ANON_KEY'] === 'string',
    hasUrl: typeof process.env['SUPABASE_URL'] === 'string',
    hasKey: typeof process.env['SUPABASE_ANON_KEY'] === 'string',
  });
}

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // Check for environment variables in headers (set by Edge function)
  const supabaseUrl =
    request.headers.get('X-Supabase-URL') ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';

  const supabaseKey =
    request.headers.get('X-Supabase-Anon-Key') ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      headers: {
        url: !!request.headers.get('X-Supabase-URL'),
        key: !!request.headers.get('X-Supabase-Anon-Key')
      },
      env: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY
      }
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

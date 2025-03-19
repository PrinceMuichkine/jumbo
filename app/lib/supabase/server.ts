import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

// Log environment debug info once
if (process.env.NODE_ENV === 'development') {
  console.log('Server environment check:', {
    hasViteUrl: typeof process.env['VITE_SUPABASE_URL'] === 'string',
    hasViteKey: typeof process.env['VITE_SUPABASE_ANON_KEY'] === 'string',
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
    process.env.VITE_SUPABASE_URL ||
    '';

  const supabaseKey =
    request.headers.get('X-Supabase-Anon-Key') ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
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
import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // Try different ways to access environment variables in various environments
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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

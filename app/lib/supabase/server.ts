import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEVELOPMENT } from '@/lib/middleware/env';

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  // Log the environment variables in development mode
  if (IS_DEVELOPMENT) {
    console.log('Server environment check:');
    console.log('SUPABASE_URL:', SUPABASE_URL || 'undefined');
    console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY must be defined in environment variables'
    );
  }

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    { request, response }
  );

  return supabase;
};

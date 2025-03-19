import { createServerClient } from '@supabase/auth-helpers-remix';
import type { Database } from '@/lib/types/database.types';

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  const supabase = createServerClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    { request, response }
  );

  return supabase;
};
import { redirect } from '@remix-run/cloudflare';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const loader = async ({ request }: { request: Request }) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient({ request, response });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the home page after successfully exchanging the code for a session
  return redirect('/', {
    headers: response.headers,
  });
};

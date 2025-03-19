declare global {
  interface ProcessEnv {
    ANTHROPIC_API_KEY?: string;
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
    VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
    VITE_LOG_LEVEL?: string;
    VITE_ENV?: string;
    VITE_WEBCONTAINER_CLIENT_ID?: string;
    VITE_WEBCONTAINER_CLIENT_SECRET?: string;
  }
}

export {};

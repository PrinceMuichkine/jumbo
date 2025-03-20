// Basic Remix type declarations to prevent TypeScript errors during development
declare module '@remix-run/node' {
  export interface ActionFunctionArgs {
    request: Request;
    params: Record<string, string | undefined>;
  }

  export interface LoaderFunctionArgs {
    request: Request;
    params: Record<string, string | undefined>;
  }

  export type MetaFunction = (...args: any[]) => any[];
  export function json<T>(data: T, init?: ResponseInit): Response;
  export function redirect(url: string, init?: ResponseInit): Response;
}

// Basic Supabase type declarations
declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    user_metadata: Record<string, any>;
  }

  export interface Session {
    access_token: string;
    user: User;
  }

  export type AuthChangeEvent =
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'USER_UPDATED'
    | 'PASSWORD_RECOVERY';
}

// Vite client declarations
declare module 'vite/client' {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Add CSS Module type declaration
declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Ensure SharedArrayBuffer is available globally
interface Window {
  SharedArrayBuffer: typeof SharedArrayBuffer;
}

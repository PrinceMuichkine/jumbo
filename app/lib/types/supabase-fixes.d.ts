/**
 * Declaration file to fix TypeScript errors in Supabase packages
 * This patches the unref property error in GoTrueClient.ts
 */

declare module '@supabase/auth-js' {
  interface TimeoutId {
    unref(): void;
  }

  namespace GoTrueClient {
    interface AuthChangeEvent {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    }
  }
}

// Add a declare statement to provide patch for setTimeout return type
declare global {
  interface ReturnType<T extends (...args: any) => any> {
    unref?: () => void;
  }
}

// Export something to make TypeScript treat this as a module
export {};

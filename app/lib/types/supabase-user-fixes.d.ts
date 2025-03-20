/**
 * Declaration file to fix TypeScript errors in Supabase User interface
 * This adds the email property that is used in our components but not explicitly
 * defined in the Supabase types
 */

import type { User } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  export interface User {
    email?: string;
  }
}

// Export something to make TypeScript treat this as a module
export {};

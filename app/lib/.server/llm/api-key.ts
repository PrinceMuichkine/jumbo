import { env } from 'node:process';
import type { Env } from './stream-text';

export function getAPIKey(envParam?: Env) {
  // Priority order:
  // 1. Use the explicitly passed environment parameter
  // 2. Fall back to process.env (works in both local and Vercel)
  // 3. If all else fails, return undefined (will cause proper error handling)

  // Check if we have a direct env parameter with the key
  if (envParam?.ANTHROPIC_API_KEY) {
    return envParam.ANTHROPIC_API_KEY;
  }

  // Fall back to process.env
  if (env.ANTHROPIC_API_KEY) {
    return env.ANTHROPIC_API_KEY;
  }

  // If we get here, we don't have a key
  return undefined;
}

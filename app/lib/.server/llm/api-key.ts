import { env } from 'node:process';
import type { Env } from './stream-text';

export function getAPIKey(envParam?: Env) {
  return envParam?.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY;
}

import { createAnthropic } from '@ai-sdk/anthropic';
import type { Env } from './stream-text';

export function getAnthropicModel(apiKeyOrEnv?: string | Env | undefined) {
  let apiKey: string | undefined;

  try {
    if (typeof apiKeyOrEnv === 'string') {
      apiKey = apiKeyOrEnv;
    } else if (apiKeyOrEnv && 'ANTHROPIC_API_KEY' in apiKeyOrEnv) {
      apiKey = apiKeyOrEnv.ANTHROPIC_API_KEY;
    }

    // If no API key provided, the SDK will attempt to use ANTHROPIC_API_KEY from process.env
    const anthropic = createAnthropic({
      apiKey,
    });

    // Using the standard model ID format to ensure compatibility
    return anthropic('claude-3-5-sonnet-20240620');
  } catch (error) {
    console.error('Error creating Anthropic model:', error);
    // Re-throw the error for proper handling upstream
    throw error;
  }
}

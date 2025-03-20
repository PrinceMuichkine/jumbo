import { streamText as _streamText, convertToCoreMessages } from 'ai';
import { getAPIKey } from '@/lib/.server/llm/api-key';
import { getAnthropicModel } from '@/lib/.server/llm/model';
import { MAX_TOKENS } from './constants';
import { getSystemPrompt } from './prompts';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
  state: 'result';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], 'model'>;

export interface Env {
  ANTHROPIC_API_KEY?: string;
}

export function streamText(messages: Messages, env?: Env, options?: StreamingOptions) {
  // Get API key from env parameter or use process.env
  const apiKey = getAPIKey(env);

  try {
    return _streamText({
      model: getAnthropicModel(apiKey ? { ANTHROPIC_API_KEY: apiKey } : undefined),
      system: getSystemPrompt(),
      maxTokens: MAX_TOKENS,
      headers: {
        'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
      },
      messages: convertToCoreMessages(messages),
      ...options,
    });
  } catch (error) {
    console.error('Error in streamText:', error);
    throw error;
  }
}

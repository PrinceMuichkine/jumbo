import { type ActionFunctionArgs } from '@remix-run/node';
import { getAPIKey } from '@/lib/.server/llm/api-key';
import { MAX_TOKENS } from '@/lib/.server/llm/constants';
import { getSystemPrompt } from '@/lib/.server/llm/prompts';
import { stripIndents } from '@/utils/stripIndent';

// Controller type definition for ReadableStream
type ReadableStreamController = {
  enqueue: (chunk: any) => void;
  close: () => void;
  error: (error: any) => void;
};

// Ensure we have a consistent ReadableStream implementation across environments
const getReadableStreamImpl = () => {
  // Use native ReadableStream if available
  if (typeof ReadableStream !== 'undefined') {
    return ReadableStream;
  }

  // Fallback to node:stream/web in Node.js environment if needed
  try {
    return require('node:stream/web').ReadableStream;
  } catch (e) {
    console.error('Failed to load ReadableStream implementation:', e);
    throw new Error('No ReadableStream implementation available');
  }
};

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

async function enhancerAction({ request }: ActionFunctionArgs) {
  try {
    const { message } = await request.json() as { message: string };

    try {
      // Get API key directly
      const apiKey = getAPIKey();

      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Get the appropriate ReadableStream implementation for this environment
      const ReadableStreamImpl = getReadableStreamImpl();

      const prompt = stripIndents`
        I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

        IMPORTANT: Only respond with the improved prompt and nothing else!

        <original_prompt>
          ${message}
        </original_prompt>
      `;

      // Create a custom stream response that formats the data in a simpler way
      const stream = new ReadableStreamImpl({
        async start(controller: ReadableStreamController) {
          try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': apiKey,
                'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15'
              },
              body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: MAX_TOKENS,
                temperature: 0,
                system: getSystemPrompt(),
                messages: [{ role: 'user', content: prompt }],
                stream: true
              })
            });

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Anthropic API error: ${response.status} ${error}`);
            }

            if (!response.body) {
              throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            let accumulatedData = '';
            let result = '';

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // End the stream
                controller.close();
                break;
              }

              // Decode the chunk
              const chunk = decoder.decode(value, { stream: true });
              accumulatedData += chunk;

              // Process the SSE chunks
              const lines = accumulatedData.split('\n');
              accumulatedData = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);

                  if (data === '[DONE]') {
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);

                    if (parsed.type === 'content_block_delta' && parsed.delta.text) {
                      // For the enhancer, just return the raw text chunks
                      result += parsed.delta.text;
                      controller.enqueue(encoder.encode(parsed.delta.text));
                    }
                  } catch (e) {
                    console.error('Error parsing SSE message:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Stream processing error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (streamError) {
      console.error('Error streaming enhancer response:', streamError);

      const errorMessage = streamError instanceof Error
        ? streamError.message
        : 'Unknown streaming error';

      throw new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        statusText: 'Streaming Error',
      });
    }
  } catch (parseError) {
    console.error('Error parsing request:', parseError);

    throw new Response(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      statusText: 'Bad Request',
    });
  }
}

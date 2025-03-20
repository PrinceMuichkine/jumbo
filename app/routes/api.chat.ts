import { type ActionFunctionArgs } from '@remix-run/node';
import { getAPIKey } from '@/lib/.server/llm/api-key';
import { MAX_TOKENS } from '@/lib/.server/llm/constants';
import { getSystemPrompt } from '@/lib/.server/llm/prompts';
import { type Messages } from '@/lib/.server/llm/stream-text';
import { env } from 'node:process';

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
  return chatAction(args);
}

async function chatAction({ request }: ActionFunctionArgs) {
  try {
    const { messages } = await request.json() as { messages: Messages };

    try {
      // Get API key directly
      const apiKey = getAPIKey();

      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Get the appropriate ReadableStream implementation for this environment
      const ReadableStreamImpl = getReadableStreamImpl();

      // Create a custom stream response that formats the data in the way expected by the AI library client
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
                messages: messages.map(msg => ({
                  role: msg.role,
                  content: msg.content
                })),
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

            let accumulatedData = '';

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
                      // Format the message in a way that the ai library expects
                      const aiMessage = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: parsed.delta.text,
                        createdAt: new Date()
                      };

                      const chunk = new TextEncoder().encode('data: ' + JSON.stringify(aiMessage) + '\n\n');
                      controller.enqueue(chunk);
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
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (streamError) {
      console.error('Error streaming chat response:', streamError);

      // Return a more detailed error message for debugging
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

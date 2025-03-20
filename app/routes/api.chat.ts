import { type ActionFunctionArgs } from '@remix-run/node';
import { StreamingTextResponse } from 'ai';
import { MAX_TOKENS } from '@/lib/.server/llm/constants';
import { streamText, type Messages, type StreamingOptions } from '@/lib/.server/llm/stream-text';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ request }: ActionFunctionArgs) {
  try {
    const { messages } = await request.json() as { messages: Messages };

    try {
      const options: StreamingOptions = {
        toolChoice: 'none',
        onFinish: async ({ text: content, finishReason }) => {
          // Log but don't attempt to continue the message in production
          // This avoids using complex stream handling that might cause issues
          if (finishReason === 'length') {
            console.log(`Reached max token limit (${MAX_TOKENS}): Message truncated`);
          }
        },
      };

      const result = await streamText(messages, undefined, options);

      // Simply return the AI stream directly
      return new StreamingTextResponse(result.toAIStream());
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

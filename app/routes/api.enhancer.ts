import { type ActionFunctionArgs } from '@remix-run/node';
import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText } from '@/lib/.server/llm/stream-text';
import { stripIndents } from '@/utils/stripIndent';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

async function enhancerAction({ request }: ActionFunctionArgs) {
  const { message } = await request.json() as { message: string };

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content: stripIndents`
          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          IMPORTANT: Only respond with the improved prompt and nothing else!

          <original_prompt>
            ${message}
          </original_prompt>
        `,
        },
      ],
    );

    // Use a standard TransformStream construction that works consistently
    // in both development and production environments
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        try {
          const processedChunk = decoder
            .decode(chunk)
            .split('\n')
            .filter((line) => line !== '')
            .map(parseStreamPart)
            .map((part) => part.value)
            .join('');

          controller.enqueue(encoder.encode(processedChunk));
        } catch (error) {
          console.error('Error in transform stream:', error);
          controller.error(error);
        }
      },
    });

    // Ensure we have proper error handling for the stream piping
    try {
      const transformedStream = result.toAIStream().pipeThrough(transformStream);
      return new StreamingTextResponse(transformedStream);
    } catch (error) {
      console.error('Error in stream transformation:', error);
      throw new Response(null, {
        status: 500,
        statusText: 'Error transforming stream',
      });
    }
  } catch (error) {
    console.error('Error in enhancer action:', error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

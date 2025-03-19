// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Simple handler with no imports - pure JavaScript
export default async function handler(request) {
  // Add required headers for SharedArrayBuffer
  const corsHeaders = {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };

  try {
    // Dynamic import without type checking
    const { default: remix } = await import('../build/server/index.js');

    if (typeof remix === 'function') {
      // Call the handler and handle the response
      const response = await remix(request);

      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      // Create a new response with the added headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } else {
      // Return an error response
      return new Response('Server error: Remix handler not found', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Edge function error:', error.stack || error.message || error);

    // Return a more detailed error response
    return new Response(`Internal Server Error: ${error.message || error}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders
      }
    });
  }
}

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Simple handler with no imports - pure JavaScript
export default async function handler(request) {
  try {
    // Dynamic import without type checking
    const serverModule = await import('../build/server/index.js');
    const remix = serverModule.default;

    if (typeof remix === 'function') {
      // If the module exports a function, call it directly
      return remix(request);
    } else {
      // Return an error response
      return new Response('Server error: Invalid server build format', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

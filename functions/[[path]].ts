// This is a catch-all API handler for Cloudflare Pages

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle API routes
  if (path.startsWith('/api/')) {
    // Chat API
    if (path === '/api/chat' || path.startsWith('/api/chat/')) {
      return handleChatRequest(request, env);
    }

    // Enhancer API
    if (path === '/api/enhancer') {
      return handleEnhancerRequest(request, env);
    }

    // 404 for unknown API routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Serve static assets or SPA for client-side routes
  return new Response('Not Found', { status: 404 });
}

async function handleChatRequest(request: Request, _env: any) {
  // Implementation will vary based on your chat handling logic
  const url = new URL(request.url);
  const chatId = url.pathname.replace('/api/chat/', '');

  if (request.method === 'POST') {
    const body = await request.json();

    // Process chat message
    return new Response(
      JSON.stringify({
        message: 'Message received',
        data: body
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (chatId) {
    // Get chat by ID
    return new Response(
      JSON.stringify({
        id: chatId,
        messages: []
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Invalid request' }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

async function handleEnhancerRequest(request: Request, _env: any) {
  if (request.method === 'POST') {
    const body = await request.json();

    // Process enhancer request
    return new Response(
      JSON.stringify({
        enhanced: true,
        data: body
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Invalid request' }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

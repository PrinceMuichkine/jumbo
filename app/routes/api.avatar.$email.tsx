import type { LoaderFunctionArgs } from "@remix-run/node";

/**
 * This route acts as a proxy for Vercel's avatar service to avoid CORS issues
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
  const email = params.email;

  if (!email) {
    return new Response("Email parameter is required", { status: 400 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const rounded = url.searchParams.get('rounded') || 'true';

  try {
    // Fetch the avatar from Vercel's service
    const response = await fetch(
      `https://avatar.vercel.sh/${encodeURIComponent(email)}?rounded=${rounded}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Remix Avatar Proxy)'
        }
      }
    );

    // Return the image with appropriate headers
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return new Response("Failed to fetch avatar", { status: 500 });
  }
}

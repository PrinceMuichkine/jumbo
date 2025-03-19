// Edge Runtime config
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // List of variables to check
  const envVarsToCheck = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  // Build response with masked environment variable status
  const envStatus: Record<string, boolean | string> = {};

  for (const envVar of envVarsToCheck) {
    const value = process.env[envVar];

    if (value) {
      // Don't show the actual values for security, just show they exist
      if (envVar.includes('KEY') || envVar.includes('SECRET')) {
        envStatus[envVar] = value.substring(0, 3) + '...' + value.substring(value.length - 3);
      } else {
        envStatus[envVar] = value;
      }
    } else {
      envStatus[envVar] = false;
    }
  }

  // Also check for headers
  const headers: Record<string, string> = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }

  // Return formatted JSON response
  return new Response(
    JSON.stringify({
      message: 'Environment Variables Test',
      environmentVariables: envStatus,
      headers,
      timestamp: new Date().toISOString(),
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

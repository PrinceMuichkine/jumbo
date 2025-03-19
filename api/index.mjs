import { createRequestHandler } from '@remix-run/node';

export default async function handler(req, res) {
  // Import the server build dynamically
  const { default: serverBuild } = await import('../build/server/index.js');

  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
}

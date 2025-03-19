// Edge Runtime config
export const config = {
  runtime: 'edge',
};

import { createRequestHandler } from '@vercel/remix';

// This import will be generated at build time by the Vercel adapter
import * as build from '@remix-run/dev/server-build';

export default createRequestHandler(build);

import { createRequestHandler } from '@vercel/remix';
import express from 'express';
import * as build from '@remix-run/dev/server-build';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Handle Remix requests
app.all(
  '*',
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

// Serve static files
app.use(express.static('public', { maxAge: '1h' }));

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

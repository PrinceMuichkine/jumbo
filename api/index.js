import { createRequestHandler } from '@remix-run/node';
import * as serverBuild from '../build/server/index.js';

export default function (req, res) {
  if (process.env.NODE_ENV !== "production") {
    // In development, purge require cache to always get fresh server build
    purgeRequireCache();
  }

  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
}

function purgeRequireCache() {
  // Purge require cache on dev mode
  for (const key in import.meta.cache) {
    if (key.includes("build/server")) {
      delete import.meta.cache[key];
    }
  }
}

import { createRequestHandler } from '@remix-run/node';
import * as serverBuild from '../build/server/index.js';

export default function handler(req, res) {
  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
}

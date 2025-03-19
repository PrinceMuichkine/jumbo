const { createRequestHandler } = require('@remix-run/node');

module.exports = async function handler(req, res) {
  const serverBuild = await import('../build/server/index.js');

  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
}

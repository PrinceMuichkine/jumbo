const { createRequestHandler } = require('@remix-run/node');
const serverBuild = require('../build/server/index.js');

module.exports = function handler(req, res) {
  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
}

const { createRequestHandler } = require('@remix-run/node');
const serverBuild = require('../build/server/index.js');

module.exports = function (req, res) {
  if (process.env.NODE_ENV !== "production") {
    // In development, purge require cache to always get fresh server build
    purgeRequireCache();
  }

  return createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })(req, res);
};

function purgeRequireCache() {
  // Purge require cache on dev mode
  for (const key in require.cache) {
    if (key.includes("build/server")) {
      delete require.cache[key];
    }
  }
}

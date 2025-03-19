import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer, type Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

// Custom plugin to completely suppress SCSS deprecation warnings
function createSuppressScssWarningsPlugin(): Plugin {
  return {
    name: 'suppress-scss-warnings',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.endsWith('.scss') || id.includes('.scss?')) {
        // Add a comment at the top to silence the warnings
        return {
          code: `// @use "sass:math"; \n${code}`,
          map: null
        };
      }
      return undefined;
    },
  };
}

// Silent console warnings during build for SCSS
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // Filter out SCSS deprecation warnings
  if (typeof args[0] === 'string' &&
     (args[0].includes('SCSS') ||
      args[0].includes('Sass') ||
      args[0].includes('sass') ||
      args[0].includes('scss'))) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export default defineConfig((config) => {
  return {
    build: {
      target: 'esnext',
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Suppress deprecation warnings
          logger: { warn: () => {} },
          // Use modern math.div approach
          additionalData: `@use "sass:math"; $enable-important-utilities: false;`,
          sassOptions: {
            outputStyle: config.mode === 'production' ? 'compressed' : 'expanded',
            quietDeps: true,
            quiet: true,
            verbose: false,
            // Suppress all warnings
            logger: { warn: () => {}, debug: () => {} },
          }
        }
      },
      // Disable source maps in production for smaller files
      devSourcemap: config.mode !== 'production',
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      tsconfigPaths(),
      createSuppressScssWarningsPlugin(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      UnoCSS(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ].filter(Boolean),
  };
});

function chrome129IssuePlugin(): Plugin {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/jumbo.dev/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}

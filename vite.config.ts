import { vitePlugin as remix } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer, type Plugin } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import { vercelPreset } from '@vercel/remix/vite';

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

// Add COOP and COEP headers
function crossOriginIsolationPlugin(): Plugin {
  return {
    name: 'cross-origin-isolation',
    configureServer(server: ViteDevServer) {
      // Use middleware to add headers
      server.middlewares.use((req, res, next) => {
        // Add cross-origin isolation headers
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
      });
    }
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Create separate chunks for large modules
            if (id.includes('node_modules')) {
              // Split specific large node_modules into separate chunks
              if (id.includes('@codemirror')) return 'vendor-codemirror';
              if (id.includes('react')) return 'vendor-react';
              return 'vendor'; // Other node_modules
            }
          }
        }
      },
      // Fix duplicate React when using CJS output for server
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/]
      }
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
    server: {
      host: 'localhost', // Force localhost instead of IP
      port: 5173,
      strictPort: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    },
    plugins: [
      crossOriginIsolationPlugin(),
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      tsconfigPaths(),
      createSuppressScssWarningsPlugin(),
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
        presets: [vercelPreset()],
        serverModuleFormat: 'esm',
      }),
      UnoCSS(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
      chrome129IssuePlugin(),
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
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/jumbo.lomi.africa/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}

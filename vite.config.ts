import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import { vercelPreset } from '@vercel/remix/vite';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((config) => {
  return {
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', '@remix-run/react'],
            'vendor-codemirror': [
              '@codemirror/autocomplete',
              '@codemirror/commands',
              '@codemirror/lang-cpp',
              '@codemirror/lang-css',
              '@codemirror/lang-html',
              '@codemirror/lang-javascript',
              '@codemirror/lang-json',
              '@codemirror/lang-markdown',
              '@codemirror/lang-python',
              '@codemirror/lang-sass',
              '@codemirror/lang-wast',
              '@codemirror/language',
              '@codemirror/search',
              '@codemirror/state',
              '@codemirror/view'
            ],
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              'clsx',
              'framer-motion',
              'react-resizable-panels',
              'tailwind-merge'
            ],
            'vendor-supabase': [
              '@supabase/auth-helpers-remix',
              '@supabase/auth-ui-react',
              '@supabase/auth-ui-shared',
              '@supabase/supabase-js'
            ]
          }
        }
      }
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer'],
      }),
      config.mode !== 'test' && remixCloudflareDevProxy(),
      remixVitePlugin({
        presets: [vercelPreset()],
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
  };
});

function chrome129IssuePlugin() {
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

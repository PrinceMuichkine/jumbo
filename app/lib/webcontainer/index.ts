import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '@/utils/constants';
import { auth } from './auth.client';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        // initialize WebContainer API authentication
        const clientId = import.meta.env.VITE_WEBCONTAINER_CLIENT_ID;

        if (clientId) {
          try {
            auth.init({
              clientId,
              scope: '',
            });
          } catch (error) {
            console.error('Failed to initialize WebContainer API authentication:', error);

            // continue without authentication - API will be limited but might still work
          }
        }

        return WebContainer.boot({
          workdirName: WORK_DIR_NAME,

          // enable forwarding preview errors to improve debugging in production
          forwardPreviewErrors: true,
        });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;

        // register error event handler
        webcontainer.on('error', (error) => {
          console.error('WebContainer error:', error.message);
        });

        return webcontainer;
      })
      .catch((error) => {
        console.error('Failed to boot WebContainer:', error);

        // re-throw to allow error handling up the chain
        throw error;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}

import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

// Flag to track hydration status
let hasHydrated = false;

// Ensure React has time to initialize properly before hydration
function hydrate() {
  if (hasHydrated) return;

  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }

    startTransition(() => {
      try {
        // Mark as hydrated before actual hydration to prevent double hydration
        hasHydrated = true;

        hydrateRoot(
          rootElement,
          <StrictMode>
            <RemixBrowser />
          </StrictMode>
        );
      } catch (error) {
        console.error('Hydration error:', error);
        // If hydration fails, try one more time after a delay
        hasHydrated = false;
        setTimeout(hydrate, 500);
      }
    });
  } catch (error) {
    console.error('Error during hydration setup:', error);
  }
}

// Start hydration process after a short delay to ensure DOM is ready
function deferredHydration() {
  // First try with a very short timeout
  setTimeout(() => {
    if (!hasHydrated) {
      try {
        hydrate();
      } catch (e) {
        console.warn('Initial hydration failed, retrying...', e);
      }
    }
  }, 10);

  // Fallback with a longer timeout if the first attempt fails
  setTimeout(() => {
    if (!hasHydrated) {
      try {
        hydrate();
      } catch (e) {
        console.error('Hydration ultimately failed', e);
      }
    }
  }, 1000);
}

// Let DOM finish loading before initializing React
if (window.requestIdleCallback) {
  window.requestIdleCallback(deferredHydration);
} else {
  // Fallback for browsers without requestIdleCallback
  window.setTimeout(deferredHydration, 1);
}

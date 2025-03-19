import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Theme } from '@/lib/stores/theme';
import { createScopedLogger } from '@/utils/logger';
import { getTerminalTheme } from './theme';

const logger = createScopedLogger('Terminal');

export interface TerminalRef {
  reloadStyles: () => void;
  fitTerminal: () => void;
}

export interface TerminalProps {
  className?: string;
  theme: Theme;
  readonly?: boolean;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}

// Fixed minimum dimensions to ensure terminal has valid size
const MIN_WIDTH = 80;
const MIN_HEIGHT = 25;
const INIT_DELAY_MS = 150;

export const Terminal = memo(
  forwardRef<TerminalRef, TerminalProps>(({ className, theme, readonly, onTerminalReady, onTerminalResize }, ref) => {
    const terminalElementRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm>();
    const fitAddonRef = useRef<FitAddon>();
    const [isReady, setIsReady] = useState(false);
    const [terminalMounted, setTerminalMounted] = useState(false);

    // Safe check for dimensions before fitting
    const hasSufficientDimensions = () => {
      const element = terminalElementRef.current;
      if (!element) return false;

      // Ensure element has minimum dimensions required for proper rendering
      return element.offsetWidth >= MIN_WIDTH && element.offsetHeight >= MIN_HEIGHT;
    };

    // Safe fit function with extra dimension validation
    const safeFit = () => {
      try {
        if (!fitAddonRef.current || !terminalRef.current) return;
        if (!hasSufficientDimensions()) {
          logger.warn('Terminal container has insufficient dimensions for fitting');
          return;
        }

        // Perform the fit operation
        fitAddonRef.current.fit();

        // Update terminal dimensions
        const terminal = terminalRef.current;
        if (terminal) {
          onTerminalResize?.(terminal.cols, terminal.rows);
        }
      } catch (error) {
        logger.error('Error fitting terminal:', error);
      }
    };

    // Track container dimensions and set ready when sufficient
    useEffect(() => {
      if (terminalMounted) return;

      const checkDimensions = () => {
        if (hasSufficientDimensions()) {
          setIsReady(true);
        } else {
          // If dimensions aren't sufficient, check again after a delay
          setTimeout(checkDimensions, 50);
        }
      };

      // Start checking dimensions
      checkDimensions();
    }, [terminalMounted]);

    // Initialize terminal only after the DOM is fully loaded and element is visible with sufficient dimensions
    useEffect(() => {
      if (!isReady || terminalMounted) return;

      const element = terminalElementRef.current;
      if (!element || !hasSufficientDimensions()) {
        // If insufficient dimensions, try again later
        setTimeout(() => setIsReady(false), 50);
        return;
      }

      // Create addons
      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      const webLinksAddon = new WebLinksAddon();

      // Create terminal with custom settings
      const terminal = new XTerm({
        cursorBlink: true,
        convertEol: true,
        disableStdin: readonly,
        theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
        fontSize: 12,
        fontFamily: 'Menlo, courier-new, courier, monospace',
        // Set initial dimensions to avoid viewport issues
        cols: Math.max(Math.floor(element.offsetWidth / 10), 80),
        rows: Math.max(Math.floor(element.offsetHeight / 20), 24),
      });

      terminalRef.current = terminal;

      // Load addons before opening the terminal
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);

      // Delay opening to ensure DOM is fully ready
      setTimeout(() => {
        try {
          // Only proceed if dimensions are still sufficient
          if (!hasSufficientDimensions()) {
            logger.warn('Terminal container lost dimensions before opening');
            return;
          }

          // Open terminal
          terminal.open(element);
          setTerminalMounted(true);

          // Delay fitting to avoid dimension race conditions
          setTimeout(() => {
            if (hasSufficientDimensions()) {
              safeFit();
              logger.info('Terminal attached and fitted successfully');
              onTerminalReady?.(terminal);
            }
          }, INIT_DELAY_MS);

        } catch (err) {
          logger.error('Error initializing terminal:', err);
        }
      }, 50);

      // Set up resize observer with validation
      const resizeObserver = new ResizeObserver(() => {
        if (hasSufficientDimensions()) {
          // Delay fit slightly to allow layout to complete
          setTimeout(safeFit, 10);
        }
      });

      try {
        resizeObserver.observe(element);
      } catch (e) {
        logger.error('Error setting up resize observer:', e);
      }

      return () => {
        try {
          resizeObserver.disconnect();
          terminal.dispose();
          setTerminalMounted(false);
        } catch (e) {
          logger.error('Error cleaning up terminal:', e);
        }
      };
    }, [isReady, terminalMounted]);

    // Update terminal options when theme or readonly changes
    useEffect(() => {
      if (!terminalRef.current || !terminalMounted) return;

      try {
        const terminal = terminalRef.current;
        // Update theme with appropriate cursor
        terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
        terminal.options.disableStdin = readonly;
      } catch (e) {
        logger.error('Error updating terminal options:', e);
      }
    }, [theme, readonly, terminalMounted]);

    // Manual fit method for external control
    const fitTerminal = () => {
      if (!terminalMounted || !terminalRef.current) return;

      // Perform fit with validation and delay
      setTimeout(() => {
        if (hasSufficientDimensions()) {
          safeFit();
        }
      }, 10);
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => {
      return {
        reloadStyles: () => {
          if (!terminalRef.current || !terminalMounted) return;

          try {
            const terminal = terminalRef.current;
            terminal.options.theme = getTerminalTheme(readonly ? { cursor: '#00000000' } : {});
          } catch (e) {
            logger.error('Error reloading styles:', e);
          }
        },
        fitTerminal,
      };
    }, [terminalMounted]);

    return (
      <div
        className={className}
        ref={terminalElementRef}
        // Ensure minimum dimensions to prevent RenderService errors
        style={{
          minHeight: `${MIN_HEIGHT * 1.5}px`,
          minWidth: `${MIN_WIDTH * 1.1}px`,
          position: 'relative'
        }}
      />
    );
  }),
);

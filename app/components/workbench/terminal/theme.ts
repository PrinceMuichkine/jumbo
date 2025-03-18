import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--jumbo-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--jumbo-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--jumbo-elements-terminal-textColor'),
    background: cssVar('--jumbo-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--jumbo-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--jumbo-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--jumbo-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--jumbo-elements-terminal-color-black'),
    red: cssVar('--jumbo-elements-terminal-color-red'),
    green: cssVar('--jumbo-elements-terminal-color-green'),
    yellow: cssVar('--jumbo-elements-terminal-color-yellow'),
    blue: cssVar('--jumbo-elements-terminal-color-blue'),
    magenta: cssVar('--jumbo-elements-terminal-color-magenta'),
    cyan: cssVar('--jumbo-elements-terminal-color-cyan'),
    white: cssVar('--jumbo-elements-terminal-color-white'),
    brightBlack: cssVar('--jumbo-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--jumbo-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--jumbo-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--jumbo-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--jumbo-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--jumbo-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--jumbo-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--jumbo-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}

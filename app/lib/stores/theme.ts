import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

export const kTheme = 'jumbo_theme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME = 'light';

// Create a function to safely initialize the theme on both client and server
function safeInitTheme(): Theme {
  // Only access browser APIs if we're in the browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const persistedTheme = localStorage.getItem(kTheme) as Theme | undefined;
    const themeAttribute = document.querySelector('html')?.getAttribute('data-theme');
    return persistedTheme ?? (themeAttribute as Theme) ?? DEFAULT_THEME;
  }

  // Default for server-side rendering
  return DEFAULT_THEME;
}

// Initialize with a function that won't run browser code during SSR
export const themeStore = atom<Theme>(DEFAULT_THEME);

// Initialize the store with the actual theme value on client-side
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Run after the component has mounted
  setTimeout(() => {
    themeStore.set(safeInitTheme());
  }, 0);
}

export function toggleTheme() {
  const currentTheme = themeStore.get();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  themeStore.set(newTheme);

  if (typeof window !== 'undefined') {
    localStorage.setItem(kTheme, newTheme);
    document.querySelector('html')?.setAttribute('data-theme', newTheme);
  }
}

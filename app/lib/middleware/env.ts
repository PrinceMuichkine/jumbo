/**
 * Environment variable validation middleware
 */

// Helper function to safely get environment variables with fallbacks
export function getEnvVariable(key: string, fallback: string = ''): string {
  // Try different ways to access environment variables
  const value =
    // Vite environment variables
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] ||
    // Node.js environment variables
    typeof process !== 'undefined' && process.env && process.env[key] ||
    // Fallback value
    fallback;

  return value;
}

// Supabase configuration
export const SUPABASE_URL = getEnvVariable(
  'VITE_SUPABASE_URL',
  'https://adfpiwoqpqaruyxumzzo.supabase.co'
);

export const SUPABASE_ANON_KEY = getEnvVariable(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkZnBpd29xcHFhcnV5eHVtenpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMTUxNzAsImV4cCI6MjA1Nzg5MTE3MH0.ABb6WC8axnmObCGFfGU79QZAhR5ElEzvFX1_oyJ0gO0'
);

// Environment
export const NODE_ENV = getEnvVariable('NODE_ENV', 'development');
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

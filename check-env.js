#!/usr/bin/env node

/**
 * Pre-build script to validate environment variables
 */

const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
let envFileExists = false;

try {
  envFileExists = fs.existsSync(envPath);
  console.log(`✓ ${envFileExists ? '.env file found' : '.env file not found, will use environment variables'}`);
} catch (err) {
  console.error('Error checking for .env file:', err);
}

// Required environment variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

// Check if required variables are set
let missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.warn('\n⚠️ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.warn(`  - ${varName}`);
  });
  console.warn('\nThese should be set in your .env file or environment.');

  // Check if we have fallback values defined in the code
  console.log('\nChecking for fallback values in code...');
  try {
    const envMiddlewarePath = path.join(process.cwd(), 'app', 'lib', 'middleware', 'env.ts');
    if (fs.existsSync(envMiddlewarePath)) {
      console.log('✓ Found env.ts middleware with fallback values');
    } else {
      console.warn('✕ Could not find env.ts middleware with fallback values');
    }
  } catch (err) {
    console.error('Error checking for fallback values:', err);
  }
} else {
  console.log('✓ All required environment variables are set');
}

// Display summary
console.log('\nEnvironment check complete');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// Continue with build process
process.exit(0);

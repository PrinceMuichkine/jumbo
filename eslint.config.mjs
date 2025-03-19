/**
 * ESLint Configuration for Jumbo
 *
 * This is a minimal ESLint configuration focused on catching critical errors
 * while not being overly strict on formatting and style issues.
 *
 * - Most formatting rules are disabled
 * - TypeScript unused variable checks are set to warnings instead of errors
 * - Blitz plugin configuration has been simplified
 * - Only the most important code safety rules are kept
 *
 * This configuration prioritizes development speed over strict code style enforcement.
 */

import { jsFileExtensions } from '@blitz/eslint-plugin/dist/configs/javascript.js';
import { tsFileExtensions } from '@blitz/eslint-plugin/dist/configs/typescript.js';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/jumbo/build',
      '**/.cursor',
      '**/.cursor/**',
      '**/build',
      '**/*.min.js',
      '**/.cache',
      '**/data',
      '**/pnpm-lock.yaml',
      '**/*.d.ts',
      '**/data/**',
      '.eslintrc.cjs',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        browser: true,
        es2020: true,
        es6: true,
        node: true
      }
    },
    plugins: {
      'react-refresh': reactRefreshPlugin,
      'react': reactPlugin
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@blitz/catch-error-name': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@blitz/comment-syntax': 'off',
      'prettier/prettier': 'off',
      'react-refresh/only-export-components': 'off',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: [...tsFileExtensions, ...jsFileExtensions, '**/*.tsx'],
    ignores: ['functions/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../'],
              message: `Relative imports are not allowed. Please use '@/' instead.`,
            },
          ],
        },
      ],
    },
  },
];

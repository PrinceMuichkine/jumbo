import blitzPlugin from '@blitz/eslint-plugin';
import { jsFileExtensions } from '@blitz/eslint-plugin/dist/configs/javascript.js';
import { getNamingConventionRule, tsFileExtensions } from '@blitz/eslint-plugin/dist/configs/typescript.js';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';

export default [
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.wrangler',
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
  ...blitzPlugin.configs.recommended(),
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
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
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      ...getNamingConventionRule({}, true),
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

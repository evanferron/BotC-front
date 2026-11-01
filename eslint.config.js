// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintPluginReact from 'eslint-plugin-react'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // Ignorer les dossiers de build et dépendances
  {
    ignores: [
      '**/example/**',
      'dist',
      'node_modules',
      'build',
      'coverage',
      '.vite',
    ],
  },

  // Configuration de base JavaScript
  js.configs.recommended,

  // Configuration TypeScript
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Configuration React
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ==================== RÈGLES REACT ====================
      'react/react-in-jsx-scope': 'off',          // React 19 — import React non requis
      'react/prop-types': 'off',                  // TypeScript couvre ça
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-pascal-case': 'warn',
      'react/no-array-index-key': 'warn',         // Utiliser des IDs, pas les indices

      // ==================== RÈGLES REACT HOOKS ====================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ==================== RÈGLES REACT REFRESH ====================
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ==================== RÈGLES TYPESCRIPT ====================
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',        // Jamais de any dans le code
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      // ==================== RÈGLES GÉNÉRALES ====================
      'no-console': ['error', { allow: ['warn', 'error'] }], // Pas de console.log en prod
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'warn',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['warn', 'all'],
      'no-nested-ternary': 'warn',
    },
  },

  // Configuration spécifique pour les fichiers de test
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  eslintConfigPrettier,
  ...storybook.configs["flat/recommended"],
]

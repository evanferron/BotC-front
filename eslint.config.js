import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintReact from '@eslint-react/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'

// Interdit, par zone, les imports vers les couches du dessus. Un import relatif qui remonte de
// trois niveaux sort de sa zone : il doit passer par l'alias de la couche visée.
const layerRules = (zones) =>
  zones.map(({ files, forbidden, reason }) => ({
    files,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: forbidden.flatMap((alias) => [alias, `${alias}/*`]), message: `Import interdit : ${reason}.` },
            { group: ['../../../*'], message: "Import hors de la zone : utiliser l'alias de la couche (@common, @auth…)." },
          ],
        },
      ],
    },
  }))

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
      // Généré par `npm run gen:api` depuis openapi.json du back
      'src/common/api/schema.d.ts',
    ],
  },

  // Configuration de base JavaScript
  js.configs.recommended,

  // Configuration TypeScript
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Configuration React (@eslint-react : règles React et JSX, compatibles ESLint 10)
  {
    files: ['**/*.{ts,tsx}'],
    ...eslintReact.configs['recommended-typescript'],
  },
  // Les hooks restent vérifiés par le plugin officiel (react-hooks) : pas de doublon
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/exhaustive-deps': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
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
    rules: {
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

  // ==================== COUCHES (app → pages → features → common) ====================
  // Même règle que le back : une couche n'importe que les couches en dessous d'elle.
  // Entre features, un seul sens : auth ← scripts ← games.
  ...layerRules([
    { files: ['src/common/**'], forbidden: ['@app', '@pages', '@auth', '@scripts', '@games'],
      reason: 'common ne dépend d\'aucune feature ni de l\'application' },
    { files: ['src/features/auth/**'], forbidden: ['@app', '@pages', '@scripts', '@games'],
      reason: 'auth est la feature la plus basse' },
    { files: ['src/features/scripts/**'], forbidden: ['@app', '@pages', '@games'],
      reason: 'scripts peut utiliser auth, jamais games' },
    { files: ['src/features/games/**'], forbidden: ['@app', '@pages'],
      reason: 'une feature ne dépend ni des pages ni de l\'application' },
    { files: ['src/pages/**'], forbidden: ['@app'],
      reason: 'les pages ne dépendent pas de l\'assemblage (app/)' },
  ]),

  eslintConfigPrettier,
]

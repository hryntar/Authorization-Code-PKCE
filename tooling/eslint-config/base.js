import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  // 1. Базові конфіги (JS + TS)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 2. Конфіги плагінів
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      turbo: turboPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin, // Реєструємо плагін тут
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'turbo/no-undeclared-env-vars': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error', // Вмикаємо Prettier як правило
    },
    languageOptions: {
      ecmaVersion: 2020,
    },
  },

  // 3. ВИМКНЕННЯ КОНФЛІКТІВ (Обов'язково в кінці)
  eslintConfigPrettier,
]);

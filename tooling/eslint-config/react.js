import baseConfig from './base.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  ...baseConfig, // Базовий конфіг (включаючи Prettier, якщо він там в кінці)

  // Додаємо конфіг React Hooks
  reactHooks.configs.flat.recommended,

  // Додаємо налаштування для React Refresh та специфічні правила
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactRefresh.configs.vite.rules,
      'react-refresh/only-export-components': 'warn',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);

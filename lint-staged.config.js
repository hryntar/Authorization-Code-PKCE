module.exports = {
  '*.{ts,tsx,js,jsx}': ['pnpm format', 'pnpm lint -- --fix'],
  '*.{json,md}': ['pnpm format'],
};

module.exports = {
  // Format code with Prettier for all code and config files
  '*.{js,jsx,ts,tsx,json,md,css}': ['prettier --write --ignore-path .gitignore'],

  // Lint JavaScript and TypeScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
};

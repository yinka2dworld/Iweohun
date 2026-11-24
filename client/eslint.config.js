// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      'import/resolver': {
        typescript: {
          project: './jsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
    },
    rules: {
      // Data fetching commonly flips a loading flag inside an effect; this is
      // intentional across the app and not a correctness issue.
      'react-hooks/set-state-in-effect': 'warn',
      // Apostrophes in user-facing copy are fine.
      'react/no-unescaped-entities': 'off',
    },
  },
]);

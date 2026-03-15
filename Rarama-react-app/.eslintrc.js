module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true
      }
    }
  ]
};

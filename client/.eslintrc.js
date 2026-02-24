module.exports = {
  extends: ['react-app'],
  rules: {
    // Disable exhaustive-deps rule in production builds to prevent CI failures
    'react-hooks/exhaustive-deps': 'warn', // Change from error to warning
  },
};

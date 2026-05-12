module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-vector-icons)/)',
  ],
};

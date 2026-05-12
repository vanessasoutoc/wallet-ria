import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-screens', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    enableScreens: jest.fn(),
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    FullWindowOverlay: View,
  };
});
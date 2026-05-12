import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import Button from '../../src/components/Button';

describe('Button', () => {
  it('renders title when not loading', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Submit" onPress={() => {}} />,
      );
    });

    expect(tree!.root.findByProps({ children: 'Submit' })).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Pay" onPress={onPress} />,
      );
    });

    await ReactTestRenderer.act(() => {
      tree!.root.findByType(TouchableOpacity).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled is true', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Pay" onPress={() => {}} disabled />,
      );
    });

    expect(tree!.root.findByType(TouchableOpacity).props.disabled).toBe(true);
  });

  it('shows loader and disables press when loading is true', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Pay" onPress={() => {}} loading />,
      );
    });

    expect(tree!.root.findByType(ActivityIndicator)).toBeTruthy();
    expect(tree!.root.findByType(TouchableOpacity).props.disabled).toBe(true);
  });
});

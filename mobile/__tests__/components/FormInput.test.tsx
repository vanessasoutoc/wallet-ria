import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native';
import FormInput from '../../src/components/FormInput';

describe('FormInput', () => {
  it('renders label and placeholder', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FormInput
          label="Card number"
          placeholder="1234 5678 9012 3456"
          value=""
          onChangeText={() => {}}
        />,
      );
    });

    expect(tree!.root.findByProps({ children: 'Card number' })).toBeTruthy();
    expect(tree!.root.findByType(TextInput).props.placeholder).toBe('1234 5678 9012 3456');
  });

  it('renders error message when error is provided', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FormInput
          label="CVV"
          value=""
          onChangeText={() => {}}
          error="Invalid CVV"
        />,
      );
    });

    expect(tree!.root.findByProps({ children: 'Invalid CVV' })).toBeTruthy();
  });

  it('calls onChangeText from TextInput', async () => {
    const onChangeText = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FormInput
          label="Holder"
          value=""
          onChangeText={onChangeText}
        />,
      );
    });

    await ReactTestRenderer.act(() => {
      tree!.root.findByType(TextInput).props.onChangeText('John Doe');
    });

    expect(onChangeText).toHaveBeenCalledWith('John Doe');
  });
});

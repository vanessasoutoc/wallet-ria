import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, Alert } from 'react-native';
import NewPaymentScreen from '../../../src/screens/payments/new';
import { paymentService } from '../../../src/services/payments';

jest.mock('../../../src/services/payments', () => ({
  paymentService: {
    createPayment: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/components/payments/form', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return {
    PaymentForm: ({ isLoading, onSubmitPayment }: { isLoading: boolean; onSubmitPayment: (data: any, reset: () => void) => Promise<void> }) => {
      const reset = jest.fn();

      return (
        <View>
          <Text>{isLoading ? 'loading' : 'idle'}</Text>
          <TouchableOpacity
            testID="submit-button"
            onPress={() =>
              onSubmitPayment(
                {
                  cardNumber: '4111111111111111',
                  holderName: 'John Doe',
                  expirationDate: '12/34',
                  cvv: '123',
                  amount: 100,
                },
                reset,
              )
            }
          >
            <Text>submit</Text>
          </TouchableOpacity>
        </View>
      );
    },
  };
});

const mockedPaymentService = paymentService as jest.Mocked<typeof paymentService>;

describe('NewPaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('submits payment and shows success alert', async () => {
    mockedPaymentService.createPayment.mockResolvedValue({
      id: '1',
      cardNumber: '4111111111111111',
      holderName: 'John Doe',
      expirationDate: '12/34',
      amount: 100,
      createdAt: '2026-05-12T10:00:00.000Z',
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<NewPaymentScreen />);
    });

    await ReactTestRenderer.act(async () => {
      tree!.root.findByProps({ testID: 'submit-button' }).props.onPress();
      await Promise.resolve();
    });

    expect(mockedPaymentService.createPayment).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith('common.success', 'payments.new.successCreated');
  });

  it('shows error alert when create payment fails', async () => {
    mockedPaymentService.createPayment.mockRejectedValue(new Error('failure'));

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<NewPaymentScreen />);
    });

    await ReactTestRenderer.act(async () => {
      tree!.root.findByProps({ testID: 'submit-button' }).props.onPress();
      await Promise.resolve();
    });

    expect(Alert.alert).toHaveBeenCalledWith('common.error', 'payments.new.errorCreate');
  });

  it('renders payment form container', async () => {
    mockedPaymentService.createPayment.mockResolvedValue({
      id: '1',
      cardNumber: '4111111111111111',
      holderName: 'John Doe',
      expirationDate: '12/34',
      amount: 100,
      createdAt: '2026-05-12T10:00:00.000Z',
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<NewPaymentScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => String(node.props.children));

    expect(texts).toContain('idle');
  });
});

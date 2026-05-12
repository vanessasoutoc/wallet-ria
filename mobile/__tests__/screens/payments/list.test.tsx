import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import PaymentsListScreen from '../../../src/screens/payments/list';
import { paymentService } from '../../../src/services/payments';

jest.mock('../../../src/services/payments', () => ({
  paymentService: {
    listPayments: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = callback();
      return cleanup;
    }, []);
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    const t = (key: string) => {
      if (key === 'payments.currentMoneySymbol') {
        return '$';
      }
      return key;
    };

    return { t };
  },
}));

const mockedPaymentService = paymentService as jest.Mocked<typeof paymentService>;

const getTextContent = (children: unknown): string => {
  if (Array.isArray(children)) {
    return children.map(getTextContent).join('');
  }
  if (children === null || children === undefined) {
    return '';
  }
  return String(children);
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('PaymentsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment item when list request succeeds', async () => {
    mockedPaymentService.listPayments.mockResolvedValue({
      items: [
        {
          id: 1,
          transactionId: 'tx-1',
          cardNumberLast4: '4242',
          holderName: 'John Doe',
          expirationDate: '12/34',
          amount: 150.5,
          status: 'approved',
          totalTimeMs: 120,
          steps: 'created',
          createdAt: '2026-05-12T10:00:00.000Z',
        },
      ],
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<PaymentsListScreen />);
    });

    await ReactTestRenderer.act(async () => {
      await flushPromises();
    });

    const textValues = tree!.root.findAllByType(Text).map((node) => getTextContent(node.props.children));

    expect(mockedPaymentService.listPayments).toHaveBeenCalledWith(1, 10);
    expect(textValues.some((value) => value.includes('John Doe'))).toBe(true);
    expect(textValues.some((value) => value.includes('**** **** **** 4242'))).toBe(true);
    expect(textValues.some((value) => value.includes('payments.status.approved'))).toBe(true);

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows empty state when there are no payments', async () => {
    mockedPaymentService.listPayments.mockResolvedValue({
      items: [],
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<PaymentsListScreen />);
    });

    await ReactTestRenderer.act(async () => {
      await flushPromises();
    });

    const textValues = tree!.root.findAllByType(Text).map((node) => getTextContent(node.props.children));

    expect(textValues).toContain('payments.notFound');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows translated error when request fails', async () => {
    mockedPaymentService.listPayments.mockRejectedValue(new Error('network'));

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<PaymentsListScreen />);
    });

    await ReactTestRenderer.act(async () => {
      await flushPromises();
    });

    const textValues = tree!.root.findAllByType(Text).map((node) => getTextContent(node.props.children));

    expect(textValues).toContain('payments.errorCreate');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});

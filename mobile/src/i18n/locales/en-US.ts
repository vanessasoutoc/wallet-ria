const enUS = {
  common: {
    success: 'Success',
    error: 'Error',
  },
  payments: {
    new: {
      successCreated: 'Payment created with ID: {{id}}',
      errorCreate: 'Could not create payment.',
    },
    form: {
      fields: {
        cardNumber: {
          label: 'Card number',
          placeholder: '1234567891234567',
          brandLabel: 'Brand',
          brands: {
            amex: 'American Express',
            visa: 'Visa',
            mastercard: 'Mastercard',
            discover: 'Discover',
            jcb: 'JCB',
            unknown: 'Unknown',
          },
        },
        holderName: {
          label: 'Cardholder name',
          placeholder: 'John Doe',
        },
        expirationDate: {
          label: 'Expiration date',
          placeholder: 'MM/YY',
        },
        cvv: {
          label: 'CVV',
          placeholder: '123',
        },
        amount: {
          label: 'Amount',
          placeholder: '150.00',
        },
      },
      submit: {
        idle: 'Create payment',
        loading: 'Creating...',
      },
    },
    validation: {
      cardNumberRequired: 'Card number is required',
      cardNumberDigits: 'Card number must be 16 digits',
      holderNameRequired: 'Cardholder name is required',
      holderNameMin: 'Name must be at least 3 characters',
      expirationDateRequired: 'Expiration date is required',
      expirationDateFormat: 'Expiration date must be in MM/YY format',
      cvvRequired: 'CVV is required',
      cvvDigits: 'CVV must be 3 or 4 digits',
      amountMin: 'Amount must be greater than 0',
      amountDecimals: 'Amount must have up to 2 decimal places',
    },
  },
};

export default enUS;

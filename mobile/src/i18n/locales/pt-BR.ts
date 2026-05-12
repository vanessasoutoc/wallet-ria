const ptBR = {
  common: {
    success: 'Sucesso',
    error: 'Erro',
  },
  payments: {
    new: {
      successCreated: 'Pagamento criado com ID: {{id}}',
      errorCreate: 'Nao foi possivel criar o pagamento.',
    },
    form: {
      fields: {
        cardNumber: {
          label: 'Numero do cartao',
          placeholder: '1234567891234567',
          brandLabel: 'Bandeira',
          brands: {
            amex: 'American Express',
            visa: 'Visa',
            mastercard: 'Mastercard',
            discover: 'Discover',
            jcb: 'JCB',
            unknown: 'Desconhecida',
          },
        },
        holderName: {
          label: 'Nome no cartao',
          placeholder: 'John Doe',
        },
        expirationDate: {
          label: 'Data de validade',
          placeholder: 'MM/AA',
        },
        cvv: {
          label: 'CVV',
          placeholder: '123',
        },
        amount: {
          label: 'Valor',
          placeholder: '150.00',
        },
      },
      submit: {
        idle: 'Criar pagamento',
        loading: 'Criando...',
      },
    },
    validation: {
      cardNumberRequired: 'Numero do cartao obrigatorio',
      cardNumberDigits: 'Numero do cartao deve ter 16 digitos',
      holderNameRequired: 'Nome no cartao obrigatorio',
      holderNameMin: 'Nome deve ter pelo menos 3 caracteres',
      expirationDateRequired: 'Data de validade obrigatoria',
      expirationDateFormat: 'Data de validade deve estar no formato MM/AA',
      cvvRequired: 'CVV obrigatorio',
      cvvDigits: 'CVV deve ter 3 ou 4 digitos',
      amountMin: 'Valor deve ser maior que 0',
      amountDecimals: 'Valor deve ter no maximo 2 casas decimais',
    },
  },
};

export default ptBR;

import { create } from "react-test-renderer";

const ptBR = {
  common: {
    success: 'Sucesso',
    error: 'Erro',
  },
  payments: {
    currentMoneySymbol: 'R$',
    notFound: 'Nenhum pagamento encontrado.',
    status: {
      approved: 'Aprovado',
      declined: 'Recusado',
    },
    tabs: {
      list: 'Extrato',
      new: 'Pagar',
    },
    new: {
      successCreated: 'Pagamento realizado com sucesso!',
      errorCreate: 'Nao foi possivel criar o pagamento.',
    },
    form: {
      fields: {
        cardNumber: {
          label: 'Número do cartão',
          placeholder: '1234 5678 9123 4567',
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
          label: 'Titular do cartão',
          placeholder: 'Titular',
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
        payedAt: {
          label: 'Pago em',
        },
      },
      submit: {
        idle: 'Pagar',
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

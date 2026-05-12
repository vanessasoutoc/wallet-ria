export type CardBrand =
  | 'amex'
  | 'visa'
  | 'mastercard'
  | 'discover'
  | 'jcb'
  | 'unknown';

export function getCardBrand(number: string): CardBrand {
  const cc = number.replace(/\D/g, '');

  const patterns: Record<Exclude<CardBrand, 'unknown'>, RegExp> = {
    amex: /^3[47][0-9]{13}$/,
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^(5[1-5][0-9]{14}|2[2-7][0-9]{14})$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    jcb: /^(?:35[0-9]{14})$/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cc)) {
      return brand as Exclude<CardBrand, 'unknown'>;
    }
  }

  return 'unknown';
}

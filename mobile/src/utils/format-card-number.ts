const formatCardNumber = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  const groups = digitsOnly.match(/.{1,4}/g);

  return groups ? groups.join(' ') : '';
};

export default formatCardNumber;

const expirationDateValid = (value: string): boolean => {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (match === null) return false;

  const month = Number.parseInt(match[1], 10);
  const year = 2000 + Number.parseInt(match[2], 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

export default expirationDateValid;

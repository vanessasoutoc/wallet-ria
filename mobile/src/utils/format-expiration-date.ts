const formatExpirationDate = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length <= 2) {
        return digitsOnly;
    }
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
};

export default formatExpirationDate;
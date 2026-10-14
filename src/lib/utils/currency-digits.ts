const currencyDigits = (currency: string): number => {
  return (
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
};

export default currencyDigits;

/** Formats a stored decimal exactly, including values beyond safe fractional Number precision. */
const formatMoney = (
  amount: string,
  currency: string,
  locale: string,
  currencyDigits?: number,
) => {
  const negative = amount.startsWith('-');
  const [whole, fraction = ''] = amount.replace(/^-/, '').split('.');
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    ...(currencyDigits === undefined
      ? {}
      : {
          minimumFractionDigits: currencyDigits,
          maximumFractionDigits: currencyDigits,
        }),
  });
  const digits = formatter.resolvedOptions().maximumFractionDigits!;
  const integer = BigInt(whole!);
  // A negative fractional amount still needs its locale-specific negative sign.
  const parts = formatter.formatToParts(negative ? -(integer || 1n) : integer);
  const numeral = new Intl.NumberFormat(locale, { useGrouping: false });
  return parts
    .map((part) => {
      if (part.type === 'fraction')
        return [...fraction.padEnd(digits, '0').slice(0, digits)]
          .map((digit) => numeral.format(Number(digit)))
          .join('');
      if (negative && integer === 0n && part.type === 'integer')
        return numeral.format(0);
      return part.value;
    })
    .join('');
};
export default formatMoney;

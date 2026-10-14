export const formatPercent = (value: number, locale = 'en-US') =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);

export default formatPercent;

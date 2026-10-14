import type { Money } from '@/types/money';
import currencyDigits from './currency-digits';

const parseMoney = (value: string, currency: string): Money => {
  const digits = currencyDigits(currency);
  if (!/^-?\d+(\.\d+)?$/.test(value))
    throw new Error('Enter a decimal amount without separators.');
  const negative = value.startsWith('-');
  const [whole = '0', fraction = ''] = value.replace(/^-/, '').split('.');
  if (fraction.length > digits)
    throw new Error(`This currency supports ${digits} decimal places.`);
  const minorUnits =
    BigInt(whole) * 10n ** BigInt(digits) +
    BigInt(fraction.padEnd(digits, '0') || '0');
  return { minorUnits: negative ? -minorUnits : minorUnits, currency };
};

export default parseMoney;

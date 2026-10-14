import type { Money } from '@/types/money';

const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency)
    throw new Error('Cannot add different currencies.');
  return { currency: a.currency, minorUnits: a.minorUnits + b.minorUnits };
};

export default addMoney;

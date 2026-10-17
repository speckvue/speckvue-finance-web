import formatMoney from '@/features/accounts/format-money';
import { moneyUnits } from '@/features/transactions/contracts';
import type { Transfer } from '../contracts';

/** Renders each movement in its own currency and distinguishes the fee from transferred principal. */
const TransferDetails = ({
  transfer,
  locale,
  currencyDigits,
}: {
  transfer: Transfer;
  locale: string;
  currencyDigits: Record<string, number>;
}) => {
  const money = (amount: string, currency: string) =>
    formatMoney(amount, currency, locale, currencyDigits[currency]);
  return (
    <div className="space-y-3 [overflow-wrap:anywhere]">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-text-sub-600">
            From · {transfer.sourceAccountName}
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">
            −{money(transfer.sentAmount, transfer.sourceCurrency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-sub-600">
            To · {transfer.destinationAccountName}
          </dt>
          <dd className="mt-1 text-lg font-medium tabular-nums">
            +{money(transfer.receivedAmount, transfer.destinationCurrency)}
          </dd>
        </div>
      </dl>
      {transfer.sourceCurrency !== transfer.destinationCurrency && (
        <p className="text-xs text-text-sub-600">
          Effective rate: 1 {transfer.sourceCurrency} ={' '}
          {transfer.exchangeRate.replace(/\.?0+$/, '')}{' '}
          {transfer.destinationCurrency}
        </p>
      )}
      {moneyUnits(transfer.feeAmount)! > 0n && transfer.feeCurrency && (
        <p className="text-sm">
          Fee expense: {money(transfer.feeAmount, transfer.feeCurrency)} ·{' '}
          {transfer.feeAccountName} ·{' '}
          {transfer.feeCategoryName ?? 'Uncategorized'}
        </p>
      )}
      {transfer.notes && (
        <p className="text-sm whitespace-pre-wrap text-text-sub-600">
          {transfer.notes}
        </p>
      )}
    </div>
  );
};
export default TransferDetails;

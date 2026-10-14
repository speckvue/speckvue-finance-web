import mockTransactions, {
  transactionSchema,
} from '@/features/dashboard/data/transactions';
import queryKeys from '@/lib/query/keys';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

export const demoTransactionsOptions = queryOptions({
  queryKey: queryKeys.demo.transactions(),
  queryFn: async ({ signal }) => {
    signal.throwIfAborted();
    return z.array(transactionSchema).parse(mockTransactions);
  },
});

export default demoTransactionsOptions;

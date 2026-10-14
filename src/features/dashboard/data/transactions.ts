import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  category: z.string(),
  date: z.iso.date(),
  amountMinor: z.number().int().safe(),
  currency: z.string().length(3),
  status: z.enum(['Completed', 'Pending']),
});

export type Transaction = z.infer<typeof transactionSchema>;

const mockTransactions: Transaction[] = [
  {
    id: 'demo-1',
    merchant: 'Monthly salary',
    category: 'Income',
    date: '2026-10-01',
    amountMinor: 520000,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'demo-2',
    merchant: 'Green Market',
    category: 'Groceries',
    date: '2026-10-02',
    amountMinor: -8425,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'demo-3',
    merchant: 'Studio rent',
    category: 'Housing',
    date: '2026-10-03',
    amountMinor: -145000,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'demo-4',
    merchant: 'Corner Coffee',
    category: 'Food & drink',
    date: '2026-10-04',
    amountMinor: -650,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'demo-5',
    merchant: 'City transit',
    category: 'Transport',
    date: '2026-10-05',
    amountMinor: -4800,
    currency: 'USD',
    status: 'Completed',
  },
  {
    id: 'demo-6',
    merchant: 'Design project',
    category: 'Income',
    date: '2026-10-06',
    amountMinor: 85000,
    currency: 'USD',
    status: 'Pending',
  },
  {
    id: 'demo-7',
    merchant: 'Bookshop',
    category: 'Shopping',
    date: '2026-10-07',
    amountMinor: -3200,
    currency: 'USD',
    status: 'Completed',
  },
];

export default mockTransactions;

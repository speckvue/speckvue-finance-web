'use client';

import { useQuery } from '@tanstack/react-query';
import demoTransactionsOptions from '../data/demo-query-options';

const useDemoTransactions = () => {
  return useQuery(demoTransactionsOptions);
};

export default useDemoTransactions;

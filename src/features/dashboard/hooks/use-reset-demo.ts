'use client';

import mockTransactions from '@/features/dashboard/data/transactions';
import queryKeys from '@/lib/query/keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useResetDemo = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      client.setQueryData(queryKeys.demo.transactions(), mockTransactions);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.demo.all }),
  });
};

export default useResetDemo;

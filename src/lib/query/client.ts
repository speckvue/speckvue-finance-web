import ApiError from '@/lib/api/api-error';
import { QueryClient } from '@tanstack/react-query';

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        gcTime: 5 * 60000,
        refetchOnWindowFocus: false,
        retry: (count, error) =>
          count < 2 &&
          (!(error instanceof ApiError) ||
            error.code === 'network' ||
            error.code === 'timeout' ||
            error.status >= 500),
      },
      mutations: { retry: false },
    },
  });
};

export default createQueryClient;

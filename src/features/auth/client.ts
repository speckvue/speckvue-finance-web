import apiRequest from '@/lib/api/client';
import { csrfSchema } from '@/lib/auth/contracts';
import { z } from 'zod';

export default async function authenticatedRequest<T>(
  path: string,
  options: { schema: z.ZodType<T>; method?: string; body?: unknown },
) {
  const { csrfToken } = await apiRequest('/auth/csrf', { schema: csrfSchema });
  return apiRequest(path, { ...options, csrfToken });
}

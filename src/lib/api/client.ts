import publicEnv from '@/lib/config/public-env';
import type { z } from 'zod';
import ApiError from './api-error';

type RequestOptions<T> = Omit<RequestInit, 'body'> & {
  schema: z.ZodType<T>;
  body?: unknown;
  timeoutMs?: number;
  csrfToken?: string;
};

const apiRequest = async <T>(
  path: string,
  {
    schema,
    body,
    timeoutMs = 15000,
    signal,
    csrfToken,
    ...options
  }: RequestOptions<T>,
): Promise<T> => {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
    throw new Error('API paths must be relative to the configured API origin.');
  const base = new URL(publicEnv.NEXT_PUBLIC_API_URL);
  const url = new URL(path, base);
  if (url.origin !== base.origin) throw new Error('Invalid API origin.');
  const timeout = AbortSignal.timeout(timeoutMs);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok) {
      // Do not reflect arbitrary backend messages or sensitive payloads into UI.
      throw new ApiError(
        response.status,
        response.status === 401
          ? 'unauthorized'
          : response.status === 403
            ? 'forbidden'
            : response.status === 422
              ? 'validation'
              : 'http',
      );
    }
    const result = schema.safeParse(
      response.status === 204 ? undefined : await response.json(),
    );
    if (!result.success) throw new ApiError(response.status, 'contract');
    return result.data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, timeout.aborted ? 'timeout' : 'network');
  }
};

export default apiRequest;

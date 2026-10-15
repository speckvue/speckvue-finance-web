import { cookies } from 'next/headers';
import 'server-only';
import { z } from 'zod';

const configSchema = z.object({
  API_INTERNAL_URL: z.url().refine((value) => /^https?:/.test(value)),
  API_BASE_PATH: z.string().regex(/^\/[a-z][a-z0-9-]*\/v[1-9][0-9]*$/),
  SESSION_COOKIE_NAME: z.string().regex(/^[A-Za-z0-9_-]+$/),
});
export const backendConfig = () =>
  configSchema.parse({
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
    API_BASE_PATH: process.env.API_BASE_PATH,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  });

export const sessionCookie = async () => {
  const jar = await cookies();
  const name = backendConfig().SESSION_COOKIE_NAME;
  const token = jar.get(name)?.value;
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? name + '=' + token : '';
};

export default async function backendFetch(
  path: string,
  init: RequestInit = {},
) {
  const config = backendConfig();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const cookie = await sessionCookie();
  if (cookie) headers.set('Cookie', cookie);
  return fetch(new URL(config.API_BASE_PATH + path, config.API_INTERNAL_URL), {
    ...init,
    headers,
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
}

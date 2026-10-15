import backendFetch from '@/lib/auth/backend';
import publicEnv from '@/lib/config/public-env';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const routes: Record<string, readonly string[]> = {
  'auth/signup': ['POST'],
  'auth/signin': ['POST'],
  'auth/signout': ['POST'],
  'auth/signout-all': ['POST'],
  'auth/password': ['POST'],
  'auth/csrf': ['GET'],
  'auth/sessions': ['GET'],
  'users/me': ['GET'],
  'users/me/onboarding': ['POST'],
  'users/me/preferences': ['PATCH'],
};

const handler = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const path = (await context.params).path.join('/');
  const methods =
    routes[path] ??
    (/^auth\/sessions\/[0-9a-f-]{36}$/i.test(path) ? ['DELETE'] : undefined);
  const reply = (status: number) =>
    Response.json(
      { message: 'Request unavailable' },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  if (!methods) return reply(404);
  if (!methods.includes(request.method)) return reply(405);
  const headers = new Headers();
  if (!['GET', 'HEAD'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin !== new URL(publicEnv.NEXT_PUBLIC_APP_URL).origin)
      return reply(403);
    if (!request.headers.get('content-type')?.startsWith('application/json'))
      return reply(415);
    headers.set('Origin', origin);
    headers.set('Content-Type', 'application/json');
    const csrf = request.headers.get('x-csrf-token');
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }
  try {
    let body: string | undefined;
    if (!['GET', 'HEAD'].includes(request.method)) {
      if (Number(request.headers.get('content-length')) > 16384)
        return reply(413);
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > 16384) {
            await reader.cancel();
            return reply(413);
          }
          chunks.push(chunk.value);
        }
      }
      body = Buffer.concat(chunks).toString('utf8');
    }
    const upstream = await backendFetch('/' + path, {
      method: request.method,
      headers,
      body,
    });
    const responseHeaders = new Headers({
      'Cache-Control': 'no-store',
      Vary: 'Cookie',
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
    });
    // The browser-facing session covers pages so Server Components can verify it.
    for (const cookie of upstream.headers.getSetCookie())
      responseHeaders.append(
        'Set-Cookie',
        cookie.replace(/;\s*Path=[^;]*/i, '; Path=/'),
      );
    return new Response(
      upstream.status === 204 ? null : await upstream.text(),
      { status: upstream.status, headers: responseHeaders },
    );
  } catch {
    return reply(503);
  }
};

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST };

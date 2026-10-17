// @vitest-environment node
import { NextRequest } from 'next/server';
import { beforeEach, expect, test, vi } from 'vitest';
import { DELETE, GET, POST } from './route';

const backend = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/backend', () => ({ default: backend }));
beforeEach(() => vi.clearAllMocks());
const context = (path: string) => ({
  params: Promise.resolve({ path: path.split('/') }),
});
const origin = process.env.NEXT_PUBLIC_APP_URL!;

test('rejects untrusted mutations without contacting the API', async () => {
  const response = await POST(
    new NextRequest(origin + '/api/backend/auth/signin', {
      method: 'POST',
      headers: {
        Origin: 'https://evil.invalid',
        'Content-Type': 'application/json',
      },
      body: '{}',
    }),
    context('auth/signin'),
  );
  expect(response.status).toBe(403);
  expect(backend).not.toHaveBeenCalled();
});

test('only exposes explicitly allowed backend routes', async () => {
  const response = await GET(
    new NextRequest(origin + '/api/backend/admin'),
    context('admin'),
  );
  expect(response.status).toBe(404);
  expect(backend).not.toHaveBeenCalled();
});

test('preserves financial account filters and pagination when forwarding', async () => {
  backend.mockResolvedValue(new Response('{}'));
  const search = '?status=archived&after=d07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6';
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/accounts' + search),
        context('accounts'),
      )
    ).status,
  ).toBe(200);
  expect(backend).toHaveBeenCalledWith('/accounts' + search, expect.anything());
});

test('forwards category actions but exposes no category delete or arbitrary actions', async () => {
  backend.mockResolvedValue(new Response('{}'));
  const id = 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6';
  const response = await POST(
    new NextRequest(origin + '/api/backend/categories/' + id + '/move', {
      method: 'POST',
      headers: {
        Origin: new URL(origin).origin,
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'token',
      },
      body: JSON.stringify({ direction: 'up' }),
    }),
    context('categories/' + id + '/move'),
  );
  expect(response.status).toBe(200);
  expect(backend).toHaveBeenCalledWith(
    '/categories/' + id + '/move',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/categories/' + id + '/delete'),
        context('categories/' + id + '/delete'),
      )
    ).status,
  ).toBe(404);
});

test('forwards payee search and explicitly allows the merge action', async () => {
  backend.mockImplementation(() => Promise.resolve(new Response('{}')));
  const id = 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6';
  const query = '?status=merged&q=A%26B&kind=person';
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/payees' + query),
        context('payees'),
      )
    ).status,
  ).toBe(200);
  expect(backend).toHaveBeenCalledWith('/payees' + query, expect.anything());
  expect(
    (
      await POST(
        new NextRequest(origin + '/api/backend/payees/' + id + '/merge', {
          method: 'POST',
          headers: {
            Origin: new URL(origin).origin,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ targetId: id }),
        }),
        context('payees/' + id + '/merge'),
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/payees/' + id + '/delete'),
        context('payees/' + id + '/delete'),
      )
    ).status,
  ).toBe(404);
});

test('forwards origin and CSRF and makes HttpOnly cookies available to server pages', async () => {
  backend.mockResolvedValue(
    new Response('{}', {
      headers: {
        'Set-Cookie': 'session=value; Path=/api; HttpOnly; SameSite=Lax',
      },
    }),
  );
  const response = await POST(
    new NextRequest(origin + '/api/backend/auth/signin', {
      method: 'POST',
      headers: {
        Origin: new URL(origin).origin,
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'token',
      },
      body: '{}',
    }),
    context('auth/signin'),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get('set-cookie')).toContain('Path=/; HttpOnly');
  expect(response.headers.get('cache-control')).toBe('no-store');
  const headers = backend.mock.calls[0]?.[1].headers as Headers;
  expect(headers.get('origin')).toBe(new URL(origin).origin);
  expect(headers.get('x-csrf-token')).toBe('token');
});

test('bounds payloads and fails safely during API outages', async () => {
  const response = await POST(
    new NextRequest(origin + '/api/backend/auth/signup', {
      method: 'POST',
      headers: {
        Origin: new URL(origin).origin,
        'Content-Type': 'application/json',
      },
      body: 'x'.repeat(16385),
    }),
    context('auth/signup'),
  );
  expect(response.status).toBe(413);
  expect(backend).not.toHaveBeenCalled();
  backend.mockRejectedValue(new Error('private connection data'));
  const failed = await GET(
    new NextRequest(origin + '/api/backend/users/me'),
    context('users/me'),
  );
  expect(failed.status).toBe(503);
  expect(await failed.text()).not.toContain('private connection');
});

test('allows owned ledger history and revision-checked deletion through the protected gateway', async () => {
  backend.mockImplementation(() => Promise.resolve(new Response('{}')));
  const id = 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6';
  const history = 'transactions/' + id + '/history';
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/' + history + '?before=5'),
        context(history),
      )
    ).status,
  ).toBe(200);
  expect(backend).toHaveBeenCalledWith(
    '/' + history + '?before=5',
    expect.anything(),
  );
  const path = 'transactions/' + id;
  expect(
    (
      await DELETE(
        new NextRequest(origin + '/api/backend/' + path, {
          method: 'DELETE',
          headers: {
            Origin: new URL(origin).origin,
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'token',
          },
          body: JSON.stringify({ revision: 2 }),
        }),
        context(path),
      )
    ).status,
  ).toBe(200);
  expect(
    (backend.mock.calls[1]![1].headers as Headers).get('x-csrf-token'),
  ).toBe('token');
  expect(
    (
      await POST(
        new NextRequest(origin + '/api/backend/' + history, {
          method: 'POST',
          headers: {
            Origin: new URL(origin).origin,
            'Content-Type': 'application/json',
          },
          body: '{}',
        }),
        context(history),
      )
    ).status,
  ).toBe(405);
});

test('allowlists aggregate transfers and history while refusing individual-leg mutations', async () => {
  backend.mockImplementation(() => Promise.resolve(new Response('{}')));
  const id = 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6';
  const history = 'transfers/' + id + '/history';
  expect(
    (
      await GET(
        new NextRequest(origin + '/api/backend/' + history + '?before=7'),
        context(history),
      )
    ).status,
  ).toBe(200);
  expect(backend).toHaveBeenCalledWith(
    '/' + history + '?before=7',
    expect.anything(),
  );
  const path = 'transfers/' + id;
  expect(
    (
      await DELETE(
        new NextRequest(origin + '/api/backend/' + path, {
          method: 'DELETE',
          headers: {
            Origin: new URL(origin).origin,
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'token',
          },
          body: JSON.stringify({ revision: 1 }),
        }),
        context(path),
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await POST(
        new NextRequest(origin + '/api/backend/' + path + '/outgoing', {
          method: 'POST',
          headers: {
            Origin: new URL(origin).origin,
            'Content-Type': 'application/json',
          },
          body: '{}',
        }),
        context(path + '/outgoing'),
      )
    ).status,
  ).toBe(404);
});

import { redirect } from 'next/navigation';
import { cache } from 'react';
import 'server-only';
import backendFetch, { sessionCookie } from './backend';
import { userSchema } from './contracts';

export const getUser = cache(async () => {
  if (!(await sessionCookie())) return null;
  const response = await backendFetch('/users/me');
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Account service temporarily unavailable');
  return userSchema.parse(await response.json());
});

export default async function requireUser(onboarded = true) {
  const user = await getUser();
  if (!user) redirect('/signin');
  if (onboarded && !user.onboardedAt) redirect('/onboarding');
  return user;
}

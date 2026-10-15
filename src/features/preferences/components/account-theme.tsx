'use client';

import type { User } from '@/lib/auth/contracts';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/** Applies the saved account appearance; selection and persistence live in Settings. */
export default function AccountTheme({ user }: { user: User }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(user.theme);
  }, [setTheme, user.id, user.theme]);
  return null;
}

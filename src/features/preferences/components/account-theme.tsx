'use client';

import ThemeSwitcher from '@/components/shared/theme-switcher';
import authenticatedRequest from '@/features/auth/client';
import apiRequest from '@/lib/api/client';
import { userSchema, type User } from '@/lib/auth/contracts';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

export default function AccountTheme({ user }: { user: User }) {
  const { setTheme } = useTheme();
  const [error, setError] = useState('');
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    setTheme(user.theme);
  }, [setTheme, user.id, user.theme]);
  return (
    <div>
      <ThemeSwitcher
        onThemeChange={(theme) => {
          if (!user.onboardedAt) return;
          setError('');
          // Serialize rapid selections so an older request cannot overwrite the latest choice.
          queue.current = queue.current
            .catch(() => {})
            .then(async () => {
              try {
                const current = await apiRequest('/users/me', {
                  schema: userSchema,
                });
                await authenticatedRequest('/users/me/preferences', {
                  method: 'PATCH',
                  schema: userSchema,
                  body: {
                    displayName: current.displayName,
                    baseCurrency: current.baseCurrency,
                    locale: current.locale,
                    timezone: current.timezone,
                    weekStartsOn: current.weekStartsOn,
                    theme,
                  },
                });
              } catch {
                setError(
                  'Appearance changed on this device; account preference could not be saved.',
                );
              }
            });
        }}
      />
      {error && (
        <p role="alert" className="max-w-48 text-xs text-error-base">
          {error}
        </p>
      )}
    </div>
  );
}

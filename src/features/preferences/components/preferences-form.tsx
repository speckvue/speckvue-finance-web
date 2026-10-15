'use client';
import FormField from '@/components/shared/form-field';
import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import { preferencesSchema, userSchema, type User } from '@/lib/auth/contracts';
import { useForm } from '@tanstack/react-form';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const selectClass =
  'h-10 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm text-text-strong-950';
const currencies = Intl.supportedValuesOf('currency');
const timezones = Array.from(
  new Set(['UTC', ...Intl.supportedValuesOf('timeZone')]),
);
const languages = [
  'en-US',
  'en-GB',
  'en-IN',
  'hi-IN',
  'fr-FR',
  'de-DE',
  'es-ES',
  'pt-BR',
  'ja-JP',
  'zh-CN',
  'ar-SA',
  'ko-KR',
  'it-IT',
  'nl-NL',
];

export default function PreferencesForm({
  user,
  onboarding = false,
}: {
  user: User;
  onboarding?: boolean;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const form = useForm({
    defaultValues: {
      displayName: user.displayName ?? '',
      baseCurrency: user.baseCurrency ?? 'USD',
      locale: user.locale ?? 'en-US',
      timezone: user.timezone ?? 'UTC',
      theme: user.theme,
      weekStartsOn: user.weekStartsOn,
    },
    validators: { onSubmit: preferencesSchema },
    onSubmit: async ({ value }) => {
      setMessage('');
      setFailed(false);
      try {
        const saved = await authenticatedRequest(
          onboarding ? '/users/me/onboarding' : '/users/me/preferences',
          {
            method: onboarding ? 'POST' : 'PATCH',
            body: value,
            schema: userSchema,
          },
        );
        setTheme(saved.theme);
        setMessage('Preferences saved.');
        router.replace(onboarding ? '/workspace' : '/settings');
        router.refresh();
      } catch (error) {
        setFailed(true);
        if (error instanceof ApiError && error.status === 401) {
          router.replace('/signin');
          router.refresh();
          return;
        }
        setMessage(
          'Could not save your preferences. Check the values and try again.',
        );
      }
    },
  });
  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {onboarding && (
        <Button.Root
          variant="neutral"
          mode="stroke"
          type="button"
          onClick={() => {
            const resolved = new Intl.DateTimeFormat().resolvedOptions();
            form.setFieldValue('timezone', resolved.timeZone);
            if (languages.includes(resolved.locale))
              form.setFieldValue('locale', resolved.locale);
          }}
        >
          Use device language and timezone
        </Button.Root>
      )}
      <form.Field name="displayName">
        {(field) => (
          <TextField
            id="displayName"
            label="Your name"
            autoComplete="name"
            maxLength={80}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            errors={field.state.meta.errors
              .map((error) => error?.message ?? '')
              .filter(Boolean)}
          />
        )}
      </form.Field>
      <form.Field name="baseCurrency">
        {(field) => (
          <FormField
            id="baseCurrency"
            label="Base currency"
            hint="Used for your financial summaries."
          >
            <select
              id="baseCurrency"
              className={selectClass}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </form.Field>
      <form.Field name="locale">
        {(field) => (
          <FormField id="locale" label="Language and number format">
            <select
              id="locale"
              className={selectClass}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              {Array.from(new Set([...languages, field.state.value])).map(
                (locale) => (
                  <option key={locale} value={locale}>
                    {new Intl.DisplayNames(['en'], { type: 'language' }).of(
                      locale,
                    )}{' '}
                    ({locale})
                  </option>
                ),
              )}
            </select>
          </FormField>
        )}
      </form.Field>
      <p className="text-xs text-text-sub-600">
        Interface text is currently in English. This preference controls dates
        and number formatting.
      </p>
      <form.Field name="timezone">
        {(field) => (
          <FormField id="timezone" label="Timezone">
            <select
              id="timezone"
              className={selectClass}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              {Array.from(new Set([...timezones, field.state.value])).map(
                (timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone.replaceAll('_', ' ')}
                  </option>
                ),
              )}
            </select>
          </FormField>
        )}
      </form.Field>
      <form.Field name="weekStartsOn">
        {(field) => (
          <FormField id="weekStartsOn" label="First day of the week">
            <select
              id="weekStartsOn"
              className={selectClass}
              value={field.state.value}
              onChange={(event) =>
                field.handleChange(Number(event.target.value))
              }
            >
              {[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ].map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </form.Field>
      <form.Field name="theme">
        {(field) => (
          <FormField id="appearance" label="Appearance">
            <select
              id="appearance"
              className={selectClass}
              value={field.state.value}
              onChange={(event) =>
                field.handleChange(
                  event.target.value as 'light' | 'dark' | 'system',
                )
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </FormField>
        )}
      </form.Field>
      {message && (
        <p role={failed ? 'alert' : 'status'} className="text-sm">
          {message}
        </p>
      )}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(pending) => (
          <Button.Root type="submit" disabled={pending}>
            {pending
              ? 'Saving…'
              : onboarding
                ? 'Finish setup'
                : 'Save preferences'}
          </Button.Root>
        )}
      </form.Subscribe>
    </form>
  );
}

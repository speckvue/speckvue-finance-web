'use client';

import TextField from '@/components/shared/text-field';
import * as Alert from '@/components/ui/alert';
import * as Button from '@/components/ui/button';
import signUpSchema, {
  emailSchema,
  passwordSchema,
  signInSchema,
} from '@/lib/validations/auth';
import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';

export type AuthMode =
  'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password';

const labels = {
  'sign-in': {
    title: 'Welcome back',
    description: 'A clearer picture of your finances awaits.',
    action: 'Validate sign-in form',
  },
  'sign-up': {
    title: 'Start with a little clarity',
    description: 'Create your future finance workspace.',
    action: 'Validate registration form',
  },
  'forgot-password': {
    title: 'Forgot your password?',
    description: 'Prepare a password reset request.',
    action: 'Validate reset request',
  },
  'reset-password': {
    title: 'Choose a new password',
    description: 'Use a long, unique password.',
    action: 'Validate new password',
  },
};

const AuthForm = ({ mode }: { mode: AuthMode }) => {
  const [message, setMessage] = useState('');
  const needsEmail = mode !== 'reset-password';
  const needsPassword = mode !== 'forgot-password';
  const schema: z.ZodType<
    {
      email: string;
      password: string;
    },
    {
      email: string;
      password: string;
    }
  > =
    mode === 'sign-in'
      ? signInSchema
      : mode === 'sign-up'
        ? signUpSchema
        : mode === 'forgot-password'
          ? z.object({ email: emailSchema, password: z.string() })
          : z.object({ email: z.string(), password: passwordSchema });
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: schema },
    onSubmit: async () => {
      setMessage(
        'Validation successful. Authentication is not connected yet; no credentials were sent or saved.',
      );
    },
  });
  const content = labels[mode];
  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1>
      <p className="mt-3 text-sm text-text-sub-600">{content.description}</p>
      <Alert.Root
        variant="lighter"
        status="information"
        className="mt-6"
        size="small"
      >
        Frontend example · Authentication is not connected.
      </Alert.Root>
      <form
        className="mt-7 space-y-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setMessage('');
          void form.handleSubmit();
        }}
      >
        {needsEmail && (
          <form.Field name="email">
            {(field) => (
              <TextField
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                errors={field.state.meta.errors.map((error) =>
                  typeof error === 'string'
                    ? error
                    : (error?.message ?? 'Invalid email'),
                )}
              />
            )}
          </form.Field>
        )}
        {needsPassword && (
          <form.Field name="password">
            {(field) => (
              <TextField
                id="password"
                label="Password"
                type="password"
                autoComplete={
                  mode === 'sign-in' ? 'current-password' : 'new-password'
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                hint={
                  mode === 'sign-in' ? undefined : 'Use at least 12 characters.'
                }
                errors={field.state.meta.errors.map((error) =>
                  typeof error === 'string'
                    ? error
                    : (error?.message ?? 'Invalid password'),
                )}
              />
            )}
          </form.Field>
        )}
        {mode === 'sign-in' && (
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-base underline"
            >
              Forgot password?
            </Link>
          </div>
        )}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button.Root
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Validating…' : content.action}
            </Button.Root>
          )}
        </form.Subscribe>
        {message && (
          <Alert.Root
            role="status"
            variant="lighter"
            status="success"
            size="small"
          >
            {message}
          </Alert.Root>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-text-sub-600">
        {mode === 'sign-in' ? (
          <>
            New to Speckvue?{' '}
            <Link href="/sign-up" className="text-primary-base underline">
              Create an account
            </Link>
          </>
        ) : (
          <Link href="/sign-in" className="text-primary-base underline">
            Back to sign in
          </Link>
        )}
      </p>
      <Button.Root
        asChild
        variant="neutral"
        mode="stroke"
        className="mt-4 w-full"
      >
        <Link href="/dashboard">Explore the sample workspace</Link>
      </Button.Root>
      <p className="mt-7 text-center text-xs leading-5 text-text-sub-600">
        Legal policies are pending review.{' '}
        <Link href="/terms-of-service" className="underline">
          View placeholders
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;

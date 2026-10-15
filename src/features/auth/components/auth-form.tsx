'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import { csrfSchema } from '@/lib/auth/contracts';
import signupSchema, { signInSchema } from '@/lib/validations/auth';
import {
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
} from '@remixicon/react';
import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const AuthForm = ({ mode }: { mode: 'signup' | 'signin' }) => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: mode === 'signup' ? signupSchema : signInSchema },
    onSubmit: async ({ value }) => {
      setMessage('');
      try {
        if (mode === 'signup') {
          await apiRequest('/auth/signup', {
            method: 'POST',
            body: value,
            schema: z.object({ message: z.string() }),
          });
          setSuccess(true);
          form.reset();
        } else {
          await apiRequest('/auth/signin', {
            method: 'POST',
            body: value,
            schema: csrfSchema,
          });
          router.replace('/workspace');
          router.refresh();
        }
      } catch (error) {
        setMessage(
          error instanceof ApiError && error.status === 401
            ? 'Email or password is incorrect.'
            : error instanceof ApiError && error.status === 429
              ? 'Too many attempts. Please wait a minute and try again.'
              : 'Unable to continue. Please try again shortly.',
        );
      }
    },
  });
  if (success)
    return (
      <div className="space-y-4" role="status">
        <h1 className="text-2xl font-semibold">Signup request accepted</h1>
        <p className="text-sm text-text-sub-600">
          If this address is new, your account is ready. Signin with your email
          and password. Existing accounts keep their current password.
        </p>
        <Link href="/signin" className="text-primary-base underline">
          Continue to signin
        </Link>
      </div>
    );
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(pending) => (
        <form
          className="auth-form"
          aria-busy={pending}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.state.isSubmitting) void form.handleSubmit();
          }}
        >
          <fieldset className="auth-form min-w-0" disabled={pending}>
            <div className="auth-form-heading">
              <h1>
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p>
                {mode === 'signup'
                  ? 'A clearer view of your money starts here.'
                  : 'A familiar place for your finances. Signin to continue.'}
              </p>
            </div>
            {message && (
              <p
                role="alert"
                className="rounded-lg bg-bg-weak-50 p-3 text-sm text-error-base"
              >
                {message}
              </p>
            )}
            <form.Field name="email">
              {(field) => (
                <TextField
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  errors={field.state.meta.errors
                    .map((error) => error?.message ?? '')
                    .filter(Boolean)}
                />
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <TextField
                  id="password"
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                  maxLength={128}
                  trailing={
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      aria-label={
                        passwordVisible ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={passwordVisible}
                    >
                      {passwordVisible ? (
                        <RiEyeOffLine size={19} aria-hidden="true" />
                      ) : (
                        <RiEyeLine size={19} aria-hidden="true" />
                      )}
                    </button>
                  }
                  hint={
                    mode === 'signup'
                      ? 'Use 12–128 characters. A passphrase works well.'
                      : undefined
                  }
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  errors={field.state.meta.errors
                    .map((error) => error?.message ?? '')
                    .filter(Boolean)}
                />
              )}
            </form.Field>
            <Button.Root
              type="submit"
              disabled={pending}
              className="auth-submit"
            >
              {pending
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Signin'}
              {pending ? (
                <RiLoader4Line
                  size={20}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <RiArrowRightLine size={19} aria-hidden="true" />
              )}
            </Button.Root>
          </fieldset>
          <div className="auth-form-secondary" inert={pending}>
            <p className="auth-alternative">
              {mode === 'signup'
                ? 'Already have an account? '
                : 'New to Speckvue? '}
              <Link
                className="text-primary-base underline"
                href={mode === 'signup' ? '/signin' : '/signup'}
              >
                {mode === 'signup' ? 'Signin' : 'Create an account'}
              </Link>
            </p>
            <details className="auth-help">
              <summary>Need help accessing your account?</summary>
              <p>
                Email verification and password recovery are not available yet.
                Keep your password somewhere secure.
              </p>
            </details>
          </div>
          <span className="sr-only" role="status">
            {pending
              ? mode === 'signup'
                ? 'Creating your account. Please wait.'
                : 'Signing in. Please wait.'
              : ''}
          </span>
        </form>
      )}
    </form.Subscribe>
  );
};
export default AuthForm;

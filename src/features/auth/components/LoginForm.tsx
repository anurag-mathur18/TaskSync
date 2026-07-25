import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import { sanitizeReturnUrl } from '@/app/router/returnUrl';
import { useLoginMutation } from '@/features/auth/api/authApi';
import { cn } from '@/shared/lib/cn';
import { getHomePath } from '@/shared/lib/roles';
import { Button } from '@/shared/ui/atoms/Button';
import { TextInput } from '@/shared/ui/atoms/TextInput';
import { loginSchema, type LoginInput } from '@/shared-kernel';

const INVALID_CREDENTIALS = 'Invalid credentials';

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
      />
    </svg>
  );
}

function AzureMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path fill="#00A4EF" d="M13.05 3.5 4.5 20.5h5.05l8.55-17H13.05Z" />
      <path fill="#0078D4" d="m11.4 14.25 2.7 5.25H19.5L13.8 9.1l-2.4 5.15Z" />
    </svg>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    setAuthError(null);
    try {
      const result = await login(values).unwrap();
      const safeReturn = sanitizeReturnUrl(searchParams.get('returnUrl'));
      const destination = safeReturn ?? getHomePath(result.user.roles);
      void navigate(destination, { replace: true });
    } catch {
      setAuthError(INVALID_CREDENTIALS);
      setValue('password', '');
    }
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-modal">
      <header className="mb-lg">
        <h2 className="text-headline-md text-on-surface">Welcome back</h2>
        <p className="mt-xs text-body-sm text-on-surface-variant">
          Enter your credentials to access your dashboard
        </p>
      </header>

      <form
        className="flex flex-col gap-md"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        noValidate
      >
        {authError ? (
          <p
            role="alert"
            className="rounded-md border border-error-container bg-error-container px-md py-sm text-body-sm text-on-error-container"
          >
            {authError}
          </p>
        ) : null}

        <div className="flex flex-col gap-xs">
          <label
            htmlFor="login-email"
            className="text-label-md uppercase tracking-wider text-on-surface-variant"
          >
            Work Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-md top-1/2 size-5 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <TextInput
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              disabled={isLoading}
              hasError={Boolean(errors.email)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className="h-12 rounded-lg bg-surface-bright py-md pl-12 pr-md"
              {...register('email', {
                onChange: () => {
                  if (authError) setAuthError(null);
                },
              })}
            />
          </div>
          {errors.email ? (
            <p
              id="login-email-error"
              role="alert"
              className="text-body-sm text-error"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-xs">
          <div className="flex items-center justify-between gap-sm">
            <label
              htmlFor="login-password"
              className="text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              Password
            </label>
            <span
              className="text-label-md text-outline"
              title="Coming soon"
            >
              Forgot Password?
            </span>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-md top-1/2 size-5 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <TextInput
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              hasError={Boolean(errors.password) || Boolean(authError)}
              aria-invalid={
                errors.password || authError ? true : undefined
              }
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              className="h-12 rounded-lg bg-surface-bright py-md pl-12 pr-12"
              {...register('password', {
                onChange: () => {
                  if (authError) setAuthError(null);
                },
              })}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-outline transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? (
                <EyeOff className="size-5" aria-hidden />
              ) : (
                <Eye className="size-5" aria-hidden />
              )}
            </button>
          </div>
          {errors.password ? (
            <p
              id="login-password-error"
              role="alert"
              className="text-body-sm text-error"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-sm">
          <input
            type="checkbox"
            className={cn(
              'size-4 shrink-0 appearance-none rounded-sm border-2 border-outline bg-surface-container-lowest',
              'checked:border-primary checked:bg-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            disabled={isLoading}
          />
          <span className="select-none text-body-sm text-on-surface-variant">
            Remember this device for 30 days
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="mt-lg h-12 w-full rounded-lg uppercase tracking-widest"
        >
          <span>Sign in</span>
          {!isLoading ? <ArrowRight className="size-4" aria-hidden /> : null}
        </Button>
      </form>

      <div className="relative my-xl">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface-container-lowest px-md text-label-sm uppercase text-outline">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <button
          type="button"
          disabled
          title="Coming soon"
          aria-label="Google sign-in (Coming soon)"
          className="flex min-h-11 items-center justify-center gap-sm rounded-lg border border-outline-variant px-md py-sm opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <GoogleMark className="size-5" />
          <span className="text-label-md text-on-surface">Google</span>
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          aria-label="Azure AD sign-in (Coming soon)"
          className="flex min-h-11 items-center justify-center gap-sm rounded-lg border border-outline-variant px-md py-sm opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <AzureMark className="size-5" />
          <span className="text-label-md text-on-surface">Azure AD</span>
        </button>
      </div>
      <p className="mt-sm text-center text-label-sm text-outline">Coming soon</p>
    </div>
  );
}

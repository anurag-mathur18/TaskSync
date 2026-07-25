import { LoginForm } from '@/features/auth/components/LoginForm';

/**
 * Login screen — Design `login_desktop` + FE PRD §6.1.
 */
export function LoginPage() {
  return (
    <>
      <LoginForm />

      <p className="mt-xl text-center text-body-md text-on-surface-variant">
        New to TaskSync?{' '}
        <span className="font-semibold text-outline" title="Coming soon">
          Create an account
        </span>
      </p>

      <footer className="mt-xl flex flex-wrap justify-center gap-x-lg gap-y-sm">
        <span className="text-label-sm text-outline">Privacy Policy</span>
        <span className="text-label-sm text-outline">Terms of Service</span>
        <span className="text-label-sm text-outline">Contact Support</span>
      </footer>
    </>
  );
}

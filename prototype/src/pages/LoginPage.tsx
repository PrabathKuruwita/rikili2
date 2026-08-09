import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthField } from '../components/auth/AuthField';
import { AuthFormMessage } from '../components/auth/AuthFormMessage';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input, PrimaryButton } from '../components/ui/primitives';
import { supabase } from '../lib/supabase';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as LocationState | null)?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your vehicle management dashboard."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <AuthFormMessage tone="error" message={error} />}

        <AuthField label="Email" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </AuthField>

        <AuthField label="Password" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </AuthField>

        <PrimaryButton
          type="submit"
          disabled={loading}
          className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Log In'}
        </PrimaryButton>
      </form>

      <p className="auth-link text-sm text-slate-300">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-sky-300 hover:text-sky-200">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}

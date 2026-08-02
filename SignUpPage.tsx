import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthField } from '../components/auth/AuthField';
import { AuthFormMessage } from '../components/auth/AuthFormMessage';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input, PrimaryButton } from '../components/ui/primitives';
import { supabase } from '../lib/supabase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess('Check your email to confirm your account.');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to track and manage your vehicles with ease."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <AuthFormMessage tone="error" message={error} />}
        {success && <AuthFormMessage tone="success" message={success} />}

        <AuthField label="Email" htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </AuthField>

        <AuthField label="Password" htmlFor="signup-password">
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </AuthField>

        <AuthField label="Confirm Password" htmlFor="signup-confirm-password">
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </AuthField>

        <PrimaryButton
          type="submit"
          disabled={loading}
          className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </PrimaryButton>
      </form>

      <p className="auth-link text-sm text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-sky-300 hover:text-sky-200">
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}

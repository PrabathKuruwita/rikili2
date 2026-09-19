import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import UserRoleToggle, { USER_ROLES } from '../components/UserRoleToggle';
import { useApp } from '../context/AppContext';

const SIGNUP_COPY = {
  [USER_ROLES.VEHICLE_OWNER]: {
    title: 'Create Account',
    subtitle: 'Track and manage your vehicles with ease.',
  },
  [USER_ROLES.GARAGE_OWNER]: {
    title: 'Register Garage',
    subtitle: 'Set up your garage account and start managing services.',
  },
};

function getInitialRole(searchParams) {
  const role = searchParams.get('role');
  return role === USER_ROLES.GARAGE_OWNER ? USER_ROLES.GARAGE_OWNER : USER_ROLES.VEHICLE_OWNER;
}

function SignupPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(() => getInitialRole(searchParams));
  const copy = SIGNUP_COPY[role];
  const navigate = useNavigate();
  const { setRole: setAppRole } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    const appRole = role === USER_ROLES.GARAGE_OWNER ? 'station' : 'owner';
    setAppRole(appRole);
    navigate(appRole === 'station' ? '/station' : '/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <div className="auth-card">
          <UserRoleToggle role={role} onRoleChange={setRole} />

          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input type="hidden" name="role" value={role} />

            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" required />

            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />

            <label>Password</label>
            <input type="password" placeholder="Create a password" required />

            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm your password" required />

            <button type="submit">Sign Up</button>
          </form>

          <p className="auth-link">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`}>Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignupPage;

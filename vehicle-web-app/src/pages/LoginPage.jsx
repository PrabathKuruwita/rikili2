import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import UserRoleToggle, { USER_ROLES } from '../components/UserRoleToggle';
import { useApp } from '../context/AppContext';

const LOGIN_COPY = {
  [USER_ROLES.VEHICLE_OWNER]: {
    title: 'Welcome Back',
    subtitle: 'Access your vehicle management dashboard.',
  },
  [USER_ROLES.GARAGE_OWNER]: {
    title: 'Garage Login',
    subtitle: 'Manage your garage, bookings, and customer vehicles.',
  },
};

function getInitialRole(searchParams) {
  const role = searchParams.get('role');
  return role === USER_ROLES.GARAGE_OWNER ? USER_ROLES.GARAGE_OWNER : USER_ROLES.VEHICLE_OWNER;
}

function LoginPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(() => getInitialRole(searchParams));
  const copy = LOGIN_COPY[role];
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

            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />

            <label>Password</label>
            <input type="password" placeholder="Enter your password" required />

            <button type="submit">Login</button>
          </form>

          <p className="auth-link">
            Don&apos;t have an account?{' '}
            <Link to={`/signup?role=${role}`}>Sign up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;

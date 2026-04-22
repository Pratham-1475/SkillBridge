import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false, children }) {
  const location = useLocation();
  const { authStatus, isAuthenticated, user } = useAuth();

  if (authStatus === 'loading') {
    return (
      <div className="glass-panel flex min-h-72 items-center justify-center rounded-[2rem]">
        <div className="flex items-center gap-2">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (adminOnly && !user?.isAdmin) {
    return (
      <div className="glass-panel rounded-[2rem] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Restricted</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Admin access required</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">
          This dashboard is limited to the configured SkillBridge admin email.
        </p>
      </div>
    );
  }

  return children;
}

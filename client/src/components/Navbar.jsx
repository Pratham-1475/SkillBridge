import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Contact', to: '/contact' },
];

function navLinkClass({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-accent text-white shadow-glow' : 'text-slate-200 hover:bg-white/5 hover:text-white'
  }`;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink className="flex items-center gap-3" to="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-glow">
            SB
          </div>
          <div>
            <p className="font-display text-xl tracking-tight text-ink">SkillBridge</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Freelance marketplace</p>
          </div>
        </NavLink>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} className={navLinkClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink className={navLinkClass} to="/my-freelancer-profile">
                My profile
              </NavLink>
              <NavLink className={navLinkClass} to="/chats">
                Chats
              </NavLink>
            </>
          ) : null}
          {user?.isAdmin ? (
            <NavLink className={navLinkClass} to="/admin">
              Admin
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <>
              <div className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
                <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
              </div>
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
                onClick={logout}
                type="button"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                to="/login"
              >
                Log in
              </NavLink>
              <NavLink
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-plum"
                to="/signup"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {isOpen ? (
        <nav className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                className={navLinkClass}
                onClick={() => setIsOpen(false)}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/my-freelancer-profile">
                  My profile
                </NavLink>
                <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/chats">
                  Chats
                </NavLink>
                {user?.isAdmin ? (
                  <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/admin">
                    Admin
                  </NavLink>
                ) : null}
                <div className="rounded-[1.5rem] border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Signed in as <span className="font-semibold text-slate-100">{user?.email}</span>
                </div>
                <button
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
                  onClick={async () => {
                    await logout();
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink className={navLinkClass} onClick={() => setIsOpen(false)} to="/login">
                  Log in
                </NavLink>
                <NavLink
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-plum"
                  onClick={() => setIsOpen(false)}
                  to="/signup"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

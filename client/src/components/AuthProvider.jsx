import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { api, tokenStore } from '../lib/api';

// Restores the session from a saved token, and exposes login/register/logout.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'ready'));

  useEffect(() => {
    if (status !== 'loading') return;
    api('/auth/me')
      .then(({ user: me }) => setUser(me))
      .catch(() => tokenStore.set(null))
      .finally(() => setStatus('ready'));
  }, [status]);

  const value = useMemo(() => {
    const signIn = ({ token, user: next }) => {
      tokenStore.set(token);
      setUser(next);
      setLoggedOut(false);
      return next;
    };
    return {
      user,
      status,
      loggedOut,
      login: (body) => api('/auth/login', { method: 'POST', body }).then(signIn),
      register: (body) => api('/auth/register', { method: 'POST', body }).then(signIn),
      logout: () => {
        tokenStore.set(null);
        setUser(null);
        setLoggedOut(true);
      },
    };
  }, [user, status, loggedOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

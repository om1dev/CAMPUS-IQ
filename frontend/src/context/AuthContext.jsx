import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

function roleToPath(role) {
  if (role === 'student') return '/student';
  if (role === 'faculty') return '/faculty';
  if (role === 'hod') return '/hod';
  if (role === 'admin' || role === 'superadmin') return '/admin';
  return '/login';
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('rdms_access_token'));
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  async function refreshMe() {
    if (!localStorage.getItem('rdms_access_token')) {
      setProfile(null);
      setAuthUser(null);
      return null;
    }

    setLoading(true);
    try {
      const response = await getMe();
      setProfile(response.profile);
      setAuthUser(response.user);
      return response;
    } catch (error) {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }

  function saveSession(session, profileFromResponse = null) {
    const accessToken = session?.access_token || session?.access_token;
    localStorage.setItem('rdms_access_token', accessToken);
    if (session?.refresh_token) localStorage.setItem('rdms_refresh_token', session.refresh_token);
    setToken(accessToken);
    if (profileFromResponse) setProfile(profileFromResponse);
  }

  function logout() {
    localStorage.removeItem('rdms_access_token');
    localStorage.removeItem('rdms_refresh_token');
    setToken(null);
    setProfile(null);
    setAuthUser(null);
  }

  useEffect(() => {
    if (token) {
      refreshMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const value = useMemo(() => ({
    token,
    profile,
    authUser,
    loading,
    saveSession,
    refreshMe,
    logout,
    roleToPath
  }), [token, profile, authUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

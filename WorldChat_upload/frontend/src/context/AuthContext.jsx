import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase.js';
import { authService } from '../services/authService.js';
import { TOKEN_KEY, ROLES } from '../config/constants.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Bootstrap: if we have a token, fetch the profile to confirm it is still valid.
  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: profile } = await authService.getProfile();
        if (active) setUser(profile);
      } catch {
        if (active) clear();
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginAsGuest = useCallback(
    async (name) => {
      const { token: t, user: u } = await authService.createGuest(name);
      persist(t, u);
      return u;
    },
    [persist]
  );

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Google sign-in is not configured. Add Firebase env variables.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const { token: t, user: u } = await authService.loginWithGoogle(idToken);
    persist(t, u);
    return u;
  }, [persist]);

  const updateProfile = useCallback(async (payload) => {
    const { user: updated } = await authService.updateProfile(payload);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await signOut(auth).catch(() => {});
    }
    clear();
  }, [clear]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isGuest: user?.role === ROLES.GUEST,
    isUser: user?.role === ROLES.USER,
    loginAsGuest,
    loginWithGoogle,
    updateProfile,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

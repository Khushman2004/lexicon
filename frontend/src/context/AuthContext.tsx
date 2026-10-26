import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type User } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; fullName?: string; bio?: string }) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lexicon_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lexicon_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or auth service unavailable', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await authApi.login(usernameOrEmail, password);
      if (res.success && res.data) {
        localStorage.setItem('lexicon_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      } else {
        setError(res.message || 'Login failed.');
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to authenticate. Verify credentials.';
      setError(msg);
      return false;
    }
  };

  const register = async (data: { username: string; email: string; password: string; fullName?: string; bio?: string }): Promise<boolean> => {
    setError(null);
    try {
      const res = await authApi.register(data);
      if (res.success && res.data) {
        localStorage.setItem('lexicon_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return true;
      } else {
        setError(res.message || 'Registration failed.');
        return false;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Username or email may already exist.';
      setError(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('lexicon_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

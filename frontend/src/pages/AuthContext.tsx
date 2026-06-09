import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, ApiError } from '../api/client';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get<{ user: User }>('/users/me')
      .then((res) => {
        setUser(res.user);
      })
      .catch((err) => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/login', { email, password });
    setUser(res.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/register', { email, username, password });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Failed to logout cleanly on server', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
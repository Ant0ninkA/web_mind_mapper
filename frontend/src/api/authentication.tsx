import React, { useState, useEffect, useContext } from 'react';
import { api } from './client';
import { AuthResponse, User } from './types';


/** Standalone API Network Calls */

/** `POST /auth/register` — Create a new user account. Sets a secure HTTP-only cookie. */
export function registerUserApi(dto: Record<string, string>): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', dto);
}

/** `POST /auth/login` — Sign in an existing user. Sets a secure HTTP-only cookie. */
export function loginUserApi(dto: Record<string, string>): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', dto);
}

/** `POST /auth/logout` — Destroys the active session and clears the browser cookie. */
export function logoutUserApi(): Promise<void> {
  return api.post<void>('/auth/logout');
}

/** `GET /users/me` — Fetch the current authenticated user's session data. */
export function getCurrentUser(): Promise<AuthResponse> {
  return api.get<AuthResponse>('/users/me');
}


/** React Context & State Layer */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on application mount / page reload
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        // 401 Unauthenticated error means no active session cookie exists
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    // Calls the uniquely named API function to prevent the infinite loop recursion
    const res = await loginUserApi({ email, password });
    setUser(res.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const res = await registerUserApi({ email, username, password });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (err) {
      console.error('Failed to logout cleanly on server', err);
    } finally {
      // Always wipe local state even if server network request fails
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';
import { socketService } from '../services/socket';

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await auth.getCurrentUser();
          setUser(response.data);
          socketService.connect();
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login({ email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      socketService.connect();
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await auth.register({ email, password, name });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      socketService.connect();
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock credentials — TODO: Replace with real API call
const MOCK_USERS: (AuthUser & { senha: string })[] = [
  { id: '1', nome: 'Ana Carolina Silva', email: 'admin@maisquesocial.org', cargo: 'Administrador', senha: 'admin123' },
  { id: '2', nome: 'Carlos Eduardo Santos', email: 'func@maisquesocial.org', cargo: 'Funcionário', senha: 'func123' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('mqs_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with real API call
    await new Promise(r => setTimeout(r, 500));
    const found = MOCK_USERS.find(u => u.email === email && u.senha === password);
    if (found) {
      const { senha: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem('mqs_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mqs_user');
  }, []);

  const isAdmin = user?.cargo === 'Administrador';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

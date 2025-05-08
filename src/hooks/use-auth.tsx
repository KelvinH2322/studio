// src/hooks/use-auth.tsx
"use client";

import type { User } from '@/types';
import { UserRole, MOCK_USERS } from '@/types';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage (simulate session)
    const storedUserRole = localStorage.getItem('mockUserRole') as UserRole | null;
    if (storedUserRole) {
      const foundUser = MOCK_USERS.find(u => u.role === storedUserRole);
      setUser(foundUser || MOCK_USERS.find(u => u.role === UserRole.NORMAL)!);
    } else {
      // Default to normal user if no role stored
      setUser(MOCK_USERS.find(u => u.role === UserRole.NORMAL)!);
    }
    setLoading(false);
  }, []);

  const loginAs = (role: UserRole) => {
    const foundUser = MOCK_USERS.find(u => u.role === role);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('mockUserRole', role);
    } else {
      // Fallback to normal user if role not found in MOCK_USERS (should not happen with current setup)
      const normalUser = MOCK_USERS.find(u => u.role === UserRole.NORMAL)!;
      setUser(normalUser);
      localStorage.setItem('mockUserRole', UserRole.NORMAL);
    }
  };

  const logout = () => {
    // For mock purposes, "logout" means reverting to Normal user or null
    const normalUser = MOCK_USERS.find(u => u.role === UserRole.NORMAL)!;
    setUser(normalUser); // Or setUser(null) if you want a logged-out state
    localStorage.removeItem('mockUserRole');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

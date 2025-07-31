// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Patient {
  id: string;
  email: string;
  name: string;
  profilePicture?: string | null;
}

interface AuthContextType {
  patient: Patient | null;
  login: (patient: Patient) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<Patient | null>(null);

  const login = (patient: Patient) => {
    setPatient(patient);
    localStorage.setItem('patient', JSON.stringify(patient));
  };

  const logout = () => {
    setPatient(null);
    localStorage.removeItem('patient');
  };

  useEffect(() => {
    const stored = localStorage.getItem('patient');
    if (stored) {
      try {
        setPatient(JSON.parse(stored));
      } catch {
        localStorage.removeItem('patient');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ patient, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Doctor {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

interface DoctorAuthContextType {
  doctor: Doctor | null;
  login: (doctor: Doctor) => void;
  logout: () => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('doctor');
    if (stored) {
      setDoctor(JSON.parse(stored));
    }
  }, []);

  const login = (doctor: Doctor) => {
    localStorage.setItem('doctor', JSON.stringify(doctor));
    setDoctor(doctor);
  };

  const logout = () => {
    localStorage.removeItem('doctor');
    setDoctor(null);
  };

  return (
    <DoctorAuthContext.Provider value={{ doctor, login, logout }}>
      {children}
    </DoctorAuthContext.Provider>
  );
}

export function useDoctorAuth() {
  const context = useContext(DoctorAuthContext);
  if (!context) {
    throw new Error('useDoctorAuth must be used within a DoctorAuthProvider');
  }
  return context;
}

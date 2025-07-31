'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const DoctorAuthContext = createContext<any>(null);

export const DoctorAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctor');
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    }
  }, []);

  const login = (doctorData: any) => {
    setDoctor(doctorData);
    localStorage.setItem('doctor', JSON.stringify(doctorData));
  };

  const logout = () => {
    setDoctor(null);
    localStorage.removeItem('doctor');
  };

  return (
    <DoctorAuthContext.Provider value={{ doctor, login, logout }}>
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => useContext(DoctorAuthContext);

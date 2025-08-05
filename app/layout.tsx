// app/layout.tsx
'use client';
import { DoctorAuthProvider } from '@/contexts/DoctorAuthContext';
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ Patient context
 // ✅ Doctor context

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Modern healthcare portal for booking appointments and managing medical visits" />
        <title>HealthCare Portal - Your Health, Our Priority</title>
      </head>
      <body className="font-['Inter',sans-serif] antialiased">
        <AuthProvider>
          <DoctorAuthProvider>
            {children}
          </DoctorAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

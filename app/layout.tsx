// app/layout.tsx
'use client';
import { DoctorAuthProvider } from '@/contexts/DoctorAuthContext';
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ Patient context
 // ✅ Doctor context

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DoctorAuthProvider>
            {children}
          </DoctorAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

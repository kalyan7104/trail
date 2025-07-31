// app/layout.tsx
'use client';

import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ Import the context provider

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* ✅ Wrap the entire app */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

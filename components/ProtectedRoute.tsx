'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { patient } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!patient) {
      router.replace('/patient-login');
    }
  }, [patient, router]);

  if (!patient) return null;

  return <>{children}</>;
}

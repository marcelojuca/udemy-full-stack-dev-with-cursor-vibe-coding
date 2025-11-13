'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}

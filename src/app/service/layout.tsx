// src/app/service/layout.tsx
"use client";

import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';
import AccessDenied from '@/components/shared/access-denied';
import { Loader2 } from 'lucide-react';

export default function ServiceLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  if (!user || user.role !== UserRole.SERVICE) {
    return <AccessDenied requiredRole={UserRole.SERVICE} />;
  }

  return <>{children}</>;
}

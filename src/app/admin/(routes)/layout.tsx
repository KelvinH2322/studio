// src/app/admin/(routes)/layout.tsx
"use client";
// This layout can be used for styling or components specific to the admin sub-pages.
// For now, it just passes children through.
// It will inherit the protection from /admin/layout.tsx

import type { ReactNode } from 'react';

export default function AdminSubPagesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

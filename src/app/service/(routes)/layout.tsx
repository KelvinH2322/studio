// src/app/service/(routes)/layout.tsx
"use client";
// This layout can be used for styling or components specific to the service sub-pages.
// For now, it just passes children through.
// It will inherit the protection from /service/layout.tsx

import type { ReactNode } from 'react';

export default function ServiceSubPagesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

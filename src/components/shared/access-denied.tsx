// src/components/shared/access-denied.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, HomeIcon } from 'lucide-react';

interface AccessDeniedProps {
  requiredRole?: string;
}

export default function AccessDenied({ requiredRole }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">Access Denied</CardTitle>
          <CardDescription className="text-muted-foreground">
            You do not have permission to view this page.
            {requiredRole && ` This page requires the "${requiredRole}" role.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your administrator.
          </p>
        </CardContent>
        <div className="p-6 border-t">
          <Button asChild>
            <Link href="/">
              <HomeIcon className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// src/app/error.tsx
"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Coffee, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">Something Went Wrong</CardTitle>
          <CardDescription className="text-muted-foreground">
            We&apos;ve encountered an unexpected issue. Please try again or contact support if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <details className="bg-muted p-3 rounded-md text-left text-sm">
              <summary className="font-medium cursor-pointer">Error Details (Development)</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">{error.message}</pre>
              {error.digest && <pre className="mt-2 whitespace-pre-wrap break-all">Digest: {error.digest}</pre>}
            </details>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Coffee className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4">
      <AlertTriangle className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-5xl font-bold text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t seem to exist. Maybe it was brewed away?
      </p>
      <div className="flex space-x-4">
        <Button asChild size="lg">
          <Link href="/">
            <Coffee className="mr-2 h-5 w-5" />
            Go to Homepage
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/instructions">
            Browse Guides
          </Link>
        </Button>
      </div>
    </div>
  );
}

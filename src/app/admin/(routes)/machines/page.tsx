// src/app/admin/(routes)/machines/page.tsx
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function AdminMachinesPage() {
  return (
    <div>
      <PageHeader title="Manage Coffee Machines" description="Add, update, or remove coffee machine models from the system." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-6 w-6 text-primary" />
            Machine Management
          </CardTitle>
          <CardDescription>
            This section is under construction. Functionality to manage coffee machines will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future features will include:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Adding new machine brands and models.</li>
            <li>Editing existing machine details.</li>
            <li>Deleting machines from the system.</li>
            <li>Associating machines with specific guides or troubleshooting flows.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/admin/(routes)/iot-config/page.tsx
"use client";

import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';

export default function AdminIotConfigPage() {
  return (
    <div>
      <PageHeader title="Configure IoT Monitor" description="Set up and manage connections for smart plug monitoring." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Thermometer className="mr-2 h-6 w-6 text-primary" />
            IoT Smart Plug Configuration
          </CardTitle>
          <CardDescription>
            This section is under construction. Functionality to configure smart plug API endpoints and device IDs will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future features will include:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground">
            <li>Adding and managing smart plug device IDs.</li>
            <li>Configuring API endpoints for smart plug services.</li>
            <li>Setting default notification thresholds.</li>
            <li>Testing smart plug connections.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

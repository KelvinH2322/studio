// src/app/iot-monitor/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/page-header';
import { MOCK_MONITORED_MACHINES } from '@/lib/data';
import type { MonitoredCoffeeMachine } from '@/types';
import { MachineConnectionStatus, MachinePowerStatus } from '@/types';
import { Wifi, WifiOff, Power, AlertTriangle, Coffee } from 'lucide-react';

export default function IotMonitorDashboardPage() {
  const machines = MOCK_MONITORED_MACHINES;

  const getStatusBadgeVariant = (status: MachineConnectionStatus | MachinePowerStatus) => {
    switch (status) {
      case MachineConnectionStatus.CONNECTED:
      case MachinePowerStatus.ON:
        return 'bg-green-500 hover:bg-green-600'; // Custom green
      case MachineConnectionStatus.DISCONNECTED:
        return 'bg-gray-500 hover:bg-gray-600'; // Custom gray
      case MachinePowerStatus.OFF:
        return 'bg-slate-500 hover:bg-slate-600'; // Custom slate
      case MachinePowerStatus.ERROR:
        return 'destructive'; // Uses destructive variant from Badge
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (machine: MonitoredCoffeeMachine) => {
    if (machine.connectionStatus === MachineConnectionStatus.DISCONNECTED || machine.powerStatus === MachinePowerStatus.ERROR) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (machine.powerStatus === MachinePowerStatus.ON) {
      return <Power className="h-4 w-4 text-green-500" />;
    }
    return <Power className="h-4 w-4 text-slate-500" />; // OFF state
  };


  return (
    <div>
      <PageHeader
        title="IoT Devices Dashboard"
        description="Monitor the status of your connected coffee machines."
      />

      {machines.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
              <Coffee className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No Monitored Machines</p>
              <p>Please configure machines in the admin panel to monitor them here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {machines.map((machine) => (
            <Link key={machine.id} href={`/iot-monitor/${machine.id}`} passHref>
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <CardHeader className="p-4 pb-2 text-center">
                  <CardTitle className="text-lg truncate">{machine.brand} {machine.model}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden shadow-md border-2 border-border">
                    <Image
                      src={machine.imageUrl}
                      alt={`${machine.brand} ${machine.model}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={`${machine.brand} coffee machine`}
                    />
                  </div>
                  <div className="flex flex-col items-center space-y-1 text-xs">
                     <Badge variant="outline" className={`border-transparent text-white ${getStatusBadgeVariant(machine.connectionStatus)}`}>
                      {machine.connectionStatus === MachineConnectionStatus.CONNECTED ? 
                        <Wifi className="mr-1 h-3 w-3" /> : 
                        <WifiOff className="mr-1 h-3 w-3" />}
                      {machine.connectionStatus}
                    </Badge>
                    <Badge variant="outline" className={`border-transparent text-white ${getStatusBadgeVariant(machine.powerStatus)}`}>
                       {getStatusIcon(machine)}
                       <span className="ml-1">{machine.powerStatus}</span>
                    </Badge>
                  </div>
                </CardContent>
                 <CardDescription className="text-center text-xs text-muted-foreground p-2 border-t">
                    Click to view details
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// src/app/iot-monitor/[machineId]/page.tsx
import React from 'react';
import { MOCK_MONITORED_MACHINES } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/page-header';
import { formatDuration } from '@/lib/utils';
import {
  ChevronLeft,
  Wifi,
  WifiOff,
  Power,
  AlertTriangle,
  Thermometer,
  Droplets,
  Coffee,
  Clock,
  Settings2, // For Pump
  Loader, // For Grinder (could also use Bean icon)
} from 'lucide-react';
import type { MonitoredCoffeeMachine } from '@/types';
import { MachineConnectionStatus, MachinePowerStatus, MachineComponentStatus, WaterLevelStatus } from '@/types';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

interface MachineDetailPageProps {
  params: {
    machineId: string;
  };
}

export async function generateStaticParams() {
  return MOCK_MONITORED_MACHINES.map((machine) => ({
    machineId: machine.id,
  }));
}

function getStatusColor(status: MachineComponentStatus | WaterLevelStatus | MachinePowerStatus | MachineConnectionStatus): string {
  switch (status) {
    case MachineComponentStatus.OK:
    case MachineComponentStatus.ON:
    case MachineComponentStatus.OPERATING:
    case WaterLevelStatus.FULL:
    case WaterLevelStatus.MEDIUM:
    case MachinePowerStatus.ON:
    case MachineConnectionStatus.CONNECTED:
      return 'text-green-600 dark:text-green-400';
    case MachineComponentStatus.NEEDS_ATTENTION:
    case WaterLevelStatus.LOW:
      return 'text-yellow-600 dark:text-yellow-400';
    case MachineComponentStatus.ERROR:
    case WaterLevelStatus.EMPTY:
    case MachinePowerStatus.ERROR:
    case MachineConnectionStatus.DISCONNECTED:
      return 'text-red-600 dark:text-red-400';
    case MachineComponentStatus.OFF:
    case MachinePowerStatus.OFF:
    default:
      return 'text-muted-foreground';
  }
}

function StatusItem({ label, value, status, icon }: { label: string; value: string; status: MachineComponentStatus | WaterLevelStatus | MachinePowerStatus | MachineConnectionStatus; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        {React.cloneElement(icon as React.ReactElement, { className: `mr-3 h-5 w-5 ${getStatusColor(status)}` })}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <Badge variant={status === MachinePowerStatus.ERROR || status === MachineConnectionStatus.DISCONNECTED || status === MachineComponentStatus.ERROR || status === WaterLevelStatus.EMPTY ? "destructive" : (status === MachineComponentStatus.NEEDS_ATTENTION || status === WaterLevelStatus.LOW ? "secondary" : "default")} 
             className={`${status === MachinePowerStatus.ON || status === MachineConnectionStatus.CONNECTED || status === MachineComponentStatus.OK || status === WaterLevelStatus.FULL || status === WaterLevelStatus.MEDIUM ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''} ${status === MachineComponentStatus.NEEDS_ATTENTION || status === WaterLevelStatus.LOW ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}`}>
        {value}
      </Badge>
    </div>
  );
}


export default function MachineDetailPage({ params }: MachineDetailPageProps) {
  const machine = MOCK_MONITORED_MACHINES.find((m) => m.id === params.machineId);

  if (!machine) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`${machine.brand} ${machine.model}`}
        description="Detailed IoT status and usage information for this machine."
        actions={
          <Button asChild variant="outline">
            <Link href="/iot-monitor">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4 rounded-lg overflow-hidden shadow-md border">
              <Image
                src={machine.imageUrl}
                alt={`${machine.brand} ${machine.model}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint={`${machine.brand} ${machine.model}`}
              />
            </div>
            <h3 className="text-xl font-semibold text-primary">{machine.brand} {machine.model}</h3>
            <p className="text-sm text-muted-foreground">ID: {machine.id}</p>
            {machine.lastSync && (
                 <p className="text-xs text-muted-foreground mt-2">
                    Last sync: {formatDistanceToNow(machine.lastSync, { addSuffix: true })}
                </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Connection & Power Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusItem label="Connection" value={machine.connectionStatus} status={machine.connectionStatus} icon={machine.connectionStatus === MachineConnectionStatus.CONNECTED ? <Wifi /> : <WifiOff />} />
            <Separator />
            <StatusItem label="Power" value={machine.powerStatus} status={machine.powerStatus} icon={machine.powerStatus === MachinePowerStatus.ERROR ? <AlertTriangle /> : <Power />} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <StatusItem label="Pump" value={machine.pumpStatus} status={machine.pumpStatus} icon={<Settings2 />} />
            <StatusItem label="Heater" value={machine.heaterStatus} status={machine.heaterStatus} icon={<Thermometer />} />
            <StatusItem label="Grinder" value={machine.grinderStatus} status={machine.grinderStatus} icon={<Loader />} />
            <StatusItem label="Water Level" value={machine.waterLevel} status={machine.waterLevel} icon={<Droplets />} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Usage Statistics (Today)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Total ON Time</span>
                </div>
                <span className="text-sm text-foreground font-semibold">{formatDuration(machine.onTimeSecondsToday)}</span>
            </div>
             <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                    <Coffee className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Cups Made</span>
                </div>
                 <span className="text-sm text-foreground font-semibold">{machine.cupsMadeToday}</span>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Data is mock and for demonstration purposes only.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: MachineDetailPageProps) {
  const machine = MOCK_MONITORED_MACHINES.find((m) => m.id === params.machineId);
  if (!machine) {
    return {
      title: "Machine Not Found"
    }
  }
  return {
    title: `IoT: ${machine.brand} ${machine.model} | CoffeeHelper`,
    description: `Detailed IoT status for ${machine.brand} ${machine.model}.`,
  };
}

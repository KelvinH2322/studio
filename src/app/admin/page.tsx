// src/app/admin/page.tsx
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/page-header';
import { BookOpenText, ListChecks, Settings, Thermometer, Package, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';

const adminFeatures = [
  {
    title: "Manage Instruction Guides",
    description: "Create, edit, and delete instruction guides for coffee machines.",
    href: "/admin/instructions",
    icon: <BookOpenText className="h-6 w-6 text-primary" />,
    roles: [UserRole.ADMIN, UserRole.SERVICE],
  },
  {
    title: "Manage Coffee Machines",
    description: "Add, update, or remove coffee machine models.",
    href: "/admin/machines",
    icon: <Package className="h-6 w-6 text-primary" />,
    roles: [UserRole.ADMIN, UserRole.SERVICE],
  },
  {
    title: "Manage Troubleshooting Content",
    description: "Update diagnostic steps and solutions.",
    href: "/admin/troubleshooting",
    icon: <ListChecks className="h-6 w-6 text-primary" />,
    roles: [UserRole.ADMIN, UserRole.SERVICE],
  },
  {
    title: "Configure IoT Monitor",
    description: "Set up connections for smart plug monitoring.",
    href: "/admin/iot-config",
    icon: <Thermometer className="h-6 w-6 text-primary" />,
    roles: [UserRole.ADMIN, UserRole.SERVICE],
  },
    {
    title: "User Management (Service)",
    description: "Manage admin and normal users (Service role only).",
    href: "/service/users",
    icon: <Users className="h-6 w-6 text-primary" />,
    roles: [UserRole.SERVICE],
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  const availableFeatures = adminFeatures.filter(feature => user && feature.roles.includes(user.role));

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Manage application content and configurations." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableFeatures.map((feature) => (
          <Card key={feature.href} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {feature.icon}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" /> {/* Spacer */}
            <div className="p-4 pt-0 mt-auto">
              <Button asChild className="w-full">
                <Link href={feature.href}>Go to {feature.title.split(' ')[1]}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

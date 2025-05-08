// src/app/service/page.tsx
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/page-header';
import { Users, ShieldCheck } from 'lucide-react';

const serviceFeatures = [
  {
    title: "User Management",
    description: "Manage all users, including Admins and Normal users.",
    href: "/service/users",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "Admin Access (via Admin Dashboard)",
    description: "Access all Admin functionalities.",
    href: "/admin",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
  },
  // Add more service-specific features here if needed in the future
];

export default function ServiceDashboardPage() {
  return (
    <div>
      <PageHeader title="Service Panel" description="Manage users and access administrative functions." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceFeatures.map((feature) => (
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
                <Link href={feature.href}>Go to {feature.title.split(' ')[0]}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

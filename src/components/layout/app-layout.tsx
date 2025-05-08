// src/components/layout/app-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Coffee, BookOpen, Wrench, RouterIcon, Settings, HomeIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_NAME, NAV_LINKS } from '@/constants';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger as DesktopSidebarTrigger,
} from '@/components/ui/sidebar';

const navIcons: { [key: string]: React.ElementType } = {
  Home: HomeIcon,
  Instructions: BookOpen,
  Troubleshoot: Wrench,
  'IoT Monitor': RouterIcon,
  Settings: Settings,
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const sidebarContent = (isMobile = false) => (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_LINKS.map((link) => {
            const Icon = navIcons[link.label] || HomeIcon;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  className="justify-start"
                  tooltip={isMobile ? undefined : link.label}
                >
                  <Link href={link.href}>
                    <Icon className="h-5 w-5" />
                    <span className={isMobile ? "" : "group-data-[collapsible=icon]:hidden"}>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon">
          {sidebarContent()}
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:justify-end">
            <div className="md:hidden">
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-72 bg-sidebar">
                  {sidebarContent(true)}
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:block">
              <DesktopSidebarTrigger />
            </div>
            {/* Add User Profile / Settings Icon here if needed */}
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

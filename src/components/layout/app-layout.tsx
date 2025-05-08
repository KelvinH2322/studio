// src/components/layout/app-layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Coffee, BookOpen, Wrench, RouterIcon, Settings, HomeIcon, Menu, ShieldCheck, Users, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_NAME, NAV_LINKS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  SidebarFooter,
} from '@/components/ui/sidebar';

const navIcons: { [key: string]: React.ElementType } = {
  Home: HomeIcon,
  Instructions: BookOpen,
  Troubleshoot: Wrench,
  'IoT Monitor': RouterIcon,
  Settings: Settings,
  'Admin Dashboard': ShieldCheck,
  'Service Panel': Users,
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, loginAs, logout } = useAuth();

  const filteredNavLinks = NAV_LINKS.filter(link => 
    !link.roles || (user && link.roles.includes(user.role))
  );

  // Role switcher for development/testing
  const handleRoleChange = (roleValue: string) => {
    loginAs(roleValue as UserRole);
  };

  const sidebarContent = (isMobile = false) => (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-sidebar-foreground">{APP_NAME}</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavLinks.map((link) => {
            const Icon = navIcons[link.label] || HomeIcon;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))}
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
      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
         {user && (
            <div className={`p-2 rounded-md ${isMobile ? '' : 'group-data-[collapsible=icon]:hidden'}`}>
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-6 w-6 text-sidebar-foreground" />
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
                  <p className="text-xs text-sidebar-foreground/70">{user.role}</p>
                </div>
              </div>
               <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          )}
      </SidebarFooter>
    </>
  );

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading application...</div>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
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
                <SheetContent side="left" className="flex flex-col p-0 w-72 bg-sidebar text-sidebar-foreground">
                  {sidebarContent(true)}
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-4">
              {/* Role switcher for dev - consider removing for production */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Simulate Role:</span>
                <Select value={user?.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map(role => (
                      <SelectItem key={role} value={role} className="text-xs">{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:block">
                <DesktopSidebarTrigger />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// src/constants/index.ts
import type { UserRole } from '@/types';

export const APP_NAME = "CoffeeHelper";

export const USER_ROLES = {
  NORMAL: "Normal" as UserRole.NORMAL,
  ADMIN: "Admin" as UserRole.ADMIN,
  SERVICE: "Service" as UserRole.SERVICE,
};

export const NAV_LINKS = [
  { href: "/", label: "Home", roles: [USER_ROLES.NORMAL, USER_ROLES.ADMIN, USER_ROLES.SERVICE] },
  { href: "/instructions", label: "Instructions", roles: [USER_ROLES.NORMAL, USER_ROLES.ADMIN, USER_ROLES.SERVICE] },
  { href: "/troubleshoot", label: "Troubleshoot", roles: [USER_ROLES.NORMAL, USER_ROLES.ADMIN, USER_ROLES.SERVICE] },
  { href: "/iot-monitor", label: "IoT Monitor", roles: [USER_ROLES.NORMAL, USER_ROLES.ADMIN, USER_ROLES.SERVICE] },
  { href: "/admin", label: "Admin Dashboard", roles: [USER_ROLES.ADMIN, USER_ROLES.SERVICE] },
  { href: "/service", label: "Service Panel", roles: [USER_ROLES.SERVICE] },
];

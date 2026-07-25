import {
  ClipboardList,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react';

import {
  canAccessAdmin,
  canAccessTasks,
  canAccessTeam,
} from '@/shared/lib/roles';
import type { Role } from '@/shared-kernel';

export type AppNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  isVisible: (roles: readonly Role[]) => boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    to: '/tasks',
    label: 'My Tasks',
    icon: ClipboardList,
    isVisible: canAccessTasks,
  },
  {
    to: '/team',
    label: 'Team',
    icon: Users,
    isVisible: canAccessTeam,
  },
  {
    to: '/admin',
    label: 'Admin',
    icon: Shield,
    isVisible: canAccessAdmin,
  },
];

export function getVisibleNavItems(roles: readonly Role[]): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.isVisible(roles));
}

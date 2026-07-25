import { Shield, UserRound, Users } from 'lucide-react';

import type { AdminUserDto } from '@/shared-kernel';
import { Roles } from '@/shared-kernel';

export type RoleSummaryCardsProps = {
  users: AdminUserDto[];
};

export function RoleSummaryCards({ users }: RoleSummaryCardsProps) {
  const adminCount = users.filter((u) => u.roles.includes(Roles.ADMIN)).length;
  const managerCount = users.filter((u) =>
    u.roles.includes(Roles.MANAGER),
  ).length;
  const employeeCount = users.filter((u) =>
    u.roles.includes(Roles.EMPLOYEE),
  ).length;

  const cards = [
    {
      key: 'admin',
      label: 'Admin',
      badge: 'System',
      description: 'RBAC and hierarchy only — no global task override in MVP.',
      count: adminCount,
      icon: Shield,
    },
    {
      key: 'manager',
      label: 'Manager',
      badge: 'Team',
      description: 'Own tasks plus oversight of direct reports, including Close.',
      count: managerCount,
      icon: Users,
    },
    {
      key: 'employee',
      label: 'Employee',
      badge: 'Member',
      description: 'Personal task CRUD through In Progress and Done.',
      count: employeeCount,
      icon: UserRound,
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-md md:grid-cols-3">
      {cards.map(({ key, label, badge, description, count, icon: Icon }) => (
        <article
          key={key}
          className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg"
        >
          <div className="flex items-start justify-between gap-md">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
              <Icon className="size-5" aria-hidden />
            </div>
            <span className="text-label-sm uppercase tracking-wider text-outline">
              {badge}
            </span>
          </div>
          <h2 className="mt-md text-headline-md text-on-surface">{label}</h2>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            {description}
          </p>
          <p className="mt-md text-label-md text-on-surface-variant">
            {count} active member{count === 1 ? '' : 's'}
          </p>
        </article>
      ))}
    </section>
  );
}

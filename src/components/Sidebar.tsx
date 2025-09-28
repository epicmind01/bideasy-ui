import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type NavItemProps = { label: string; icon?: ReactNode; to?: string };

const baseClasses = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium';
const inactive = 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';
const active = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';

const NavItem = ({ label, icon, to }: NavItemProps) => {
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }: { isActive: boolean }) => [baseClasses, isActive ? active : inactive].join(' ')}
        end
      >
        <span className="h-4 w-4 text-current">{icon}</span>
        <span>{label}</span>
      </NavLink>
    );
  }
  return (
    <div className={[baseClasses, inactive].join(' ')}>
      <span className="h-4 w-4 text-current">{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 gap-2">
      <div className="mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Overview</div>
      <NavItem label="Dashboard" to="/" />
      <NavItem label="Analytics" />
      <NavItem label="Orders" />
      <NavItem label="Customers" />

      <div className="mt-6 mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Settings</div>
      <NavItem label="Profile" to="/profile" />
      <NavItem label="Billing" />
      <NavItem label="Team" />
    </aside>
  );
}

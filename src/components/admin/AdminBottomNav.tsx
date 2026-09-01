'use client';
import { LayoutDashboard, Package, ShoppingCart, Users, UserCheck } from 'lucide-react';

export default function AdminBottomNav({ pathname }: { pathname: string }) {
  const active = 'bg-primary text-on-primary scale-95';
  const inactive = 'text-on-surface-variant hover:bg-surface-container-high';

  const items = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, active: pathname === '/admin' },
    { href: '/admin/products', label: 'Products', icon: Package, active: pathname.startsWith('/admin/products') },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, active: pathname.startsWith('/admin/orders') },
    { href: '/admin/referrals', label: 'Referrals', icon: UserCheck, active: pathname.startsWith('/admin/referrals') },
    { href: '/admin/customers', label: 'Customers', icon: Users, active: pathname.startsWith('/admin/customers') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-low shadow-[0_-4px_30px_rgba(24,35,26,0.05)] border-t border-outline-variant/10 pb-safe">
      <div className="flex justify-around items-center px-4 py-3">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`touch-target flex flex-col items-center justify-center p-3 rounded-full transition-colors ${item.active ? active : inactive}`}
          >
            <item.icon className="w-6 h-6 mb-1" aria-hidden="true" />
            <span className="font-label-sm text-label-sm">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

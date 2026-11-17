'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cx, Logo } from './ui';

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [w, setW] = useState<{ balance: string; held: string } | null>(null);

  useEffect(() => { api('/wallet').then(setW).catch(() => {}); }, [path]);   // يتحدث الرصيد مع كل تنقّل

  const links = [
    { href: '/projects', label: 'المشاريع' },
    { href: '/dashboard', label: user?.role === 'FREELANCER' ? 'عروضي' : user?.role === 'OWNER' ? 'مشاريعي' : 'لوحتي' },
    { href: '/wallet', label: 'المحفظة' },
    ...(user?.role === 'OWNER' ? [{ href: '/projects/new', label: 'مشروع جديد' }] : []),
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'الإدارة' }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/projects"><Logo /></Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="التنقّل">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={cx('rounded-lg px-3 py-2 text-sm font-medium', path === l.href ? 'bg-sky text-brand-dark' : 'text-ink hover:bg-mist')}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-3">
          {w && <Link href="/wallet" className="rounded-lg bg-sky px-3 py-1.5 text-sm font-semibold text-ink" title="الرصيد المتاح">
            <span className="num">{money(w.balance)}</span></Link>}
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-mist">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white">{user?.name?.[0]}</span>
              <span className="hidden sm:inline">{user?.name}</span>
            </summary>
            <div className="absolute end-0 mt-2 w-48 rounded-xl border border-line bg-white p-1 text-sm shadow-lg">
              {user?.role === 'FREELANCER' && <Link className="block rounded-lg px-3 py-2 hover:bg-mist" href="/profile">ملفي الشخصي</Link>}
              <Link className="block rounded-lg px-3 py-2 hover:bg-mist" href="/sessions">أجهزتي وجلساتي</Link>
              <button className="block w-full rounded-lg px-3 py-2 text-start text-red-700 hover:bg-red-50"
                onClick={async () => { await logout(); router.replace('/login'); }}>تسجيل الخروج</button>
            </div>
          </details>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden" aria-label="التنقّل">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', path === l.href ? 'bg-sky text-brand-dark' : 'text-ink')}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

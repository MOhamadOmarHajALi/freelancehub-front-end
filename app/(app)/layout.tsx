'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace('/login'); }, [ready, user, router]);
  if (!ready || !user) return <Spinner />;
  return (<><Navbar /><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></>);
}

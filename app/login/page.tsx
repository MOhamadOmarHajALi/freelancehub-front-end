'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, Input, Logo } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const u = await login(email, password);
      router.replace(u.role === 'ADMIN' ? '/admin' : '/projects');
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex justify-center"><Logo /></Link>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
          <h1 className="text-xl font-bold">تسجيل الدخول</h1>
          <Alert>{err}</Alert>
          <Field label="البريد الإلكتروني"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" /></Field>
          <Field label="كلمة السر"><Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" /></Field>
          <Button type="submit" loading={busy} className="w-full">دخول</Button>
        </form>
        <p className="mt-4 text-center text-sm text-mute">ليس لديك حساب؟ <Link href="/register" className="font-semibold text-brand">أنشئ حساباً</Link></p>
      </div>
    </main>
  );
}

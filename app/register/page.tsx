'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, cx, Field, Input, Logo } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'OWNER' | 'FREELANCER'>('OWNER');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('role');
    if (r === 'FREELANCER' || r === 'OWNER') setRole(r);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await register({ ...f, role }); router.replace(role === 'OWNER' ? '/projects/new' : '/profile'); }
    catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  const opt = (r: 'OWNER' | 'FREELANCER', t: string, d: string) => (
    <button type="button" onClick={() => setRole(r)} aria-pressed={role === r}
      className={cx('rounded-xl border p-4 text-start transition-colors', role === r ? 'border-brand bg-sky' : 'border-line hover:bg-mist')}>
      <span className="block font-bold">{t}</span><span className="mt-1 block text-xs text-mute">{d}</span>
    </button>
  );
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center"><Logo /></Link>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
          <h1 className="text-xl font-bold">إنشاء حساب</h1>
          <div className="grid grid-cols-2 gap-3">
            {opt('OWNER', 'صاحب مشروع', 'أنشر مشاريع وأختار مستقلاً')}
            {opt('FREELANCER', 'مستقل', 'أقدّم عروضاً وأنفّذ العمل')}
          </div>
          <Alert>{err}</Alert>
          <Field label="الاسم"><Input required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="البريد الإلكتروني"><Input type="email" required dir="ltr" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="كلمة السر" hint="8 أحرف على الأقل"><Input type="password" required minLength={8} dir="ltr" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          <Button type="submit" loading={busy} className="w-full">إنشاء الحساب</Button>
        </form>
        <p className="mt-4 text-center text-sm text-mute">لديك حساب؟ <Link href="/login" className="font-semibold text-brand">سجّل الدخول</Link></p>
      </div>
    </main>
  );
}

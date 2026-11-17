'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Field, Input, PageTitle, Select, Textarea } from '@/components/ui';
import { api, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

export default function NewProject() {
  const { user } = useAuth();
  const router = useRouter();
  const cats = useApi<{ id: number; name: string }[]>('/categories');
  const wallet = useApi<{ balance: string }>('/wallet');
  const [f, setF] = useState({ title: '', description: '', categoryId: '', budget: '' });
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // الميزانية أكبر من الرصيد المتاح: نمنع الإرسال وننبّه قبله (والخادم يتحقق أيضاً)
  const short = Number(f.budget) > Number(wallet.data?.balance ?? 0);

  if (user?.role !== 'OWNER') return <Alert>نشر المشاريع متاح لأصحاب المشاريع فقط.</Alert>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      const p = await api('/projects', { method: 'POST', form: fd });
      router.replace(`/projects/${p.id}`);
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="مشروع جديد" sub="سيظهر للمستقلين مباشرة بعد النشر." />
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-white p-6">
        <Alert>{err}</Alert>
        <Field label="عنوان المشروع"><Input required minLength={3} maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="الوصف" hint="اشرح المطلوب بالتفصيل (10 أحرف على الأقل)">
          <Textarea required minLength={10} rows={6} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="التصنيف">
            <Select required value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
              <option value="" disabled>اختر التصنيف</option>
              {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="الميزانية ($)" hint={wallet.data ? `رصيدك المتاح ${money(wallet.data.balance)}` : undefined}>
            <Input type="number" required min={1} step="0.01" dir="ltr" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} />
          </Field>
        </div>
        {short && (
          <Alert>
            رصيدك المتاح <span className="num">{money(wallet.data?.balance ?? 0)}</span> أقل من ميزانية المشروع.{' '}
            <Link href="/wallet" className="font-semibold underline">اشحن محفظتك</Link> أولاً.
          </Alert>
        )}
        <Field label="ملف مرفق (اختياري)" hint="صورة أو PDF، حتى 5 ميغابايت">
          <Input type="file" accept="image/png,image/jpeg,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="submit" loading={busy} disabled={short}>نشر المشروع</Button>
      </form>
    </div>
  );
}
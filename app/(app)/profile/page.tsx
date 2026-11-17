'use client';
import { useEffect, useState } from 'react';
import { Alert, Button, Field, Input, PageTitle, Spinner, Textarea } from '@/components/ui';
import { api, fileUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

export default function Profile() {
  const { user } = useAuth();
  const me = useApi<any>(user?.role === 'FREELANCER' ? `/freelancers/${user.id}` : null);
  const [bio, setBio] = useState('');
  const [rate, setRate] = useState('');
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState('');

  useEffect(() => { if (me.data) { setBio(me.data.bio ?? ''); setRate(me.data.hourlyRate ?? ''); } }, [me.data]);

  if (user?.role !== 'FREELANCER') return <Alert>الملف الشخصي للمستقلين فقط.</Alert>;
  if (me.loading && !me.data) return <Spinner />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy('s'); setMsg(null);
    try { await api('/profile', { method: 'PATCH', body: { bio, ...(rate !== '' ? { hourlyRate: Number(rate) } : {}) } }); setMsg({ kind: 'ok', text: 'حُفظ ملفك الشخصي.' }); me.reload(); }
    catch (x: any) { setMsg({ kind: 'error', text: x.message }); } finally { setBusy(''); }
  };
  const avatar = async (f: File | null) => {
    if (!f) return;
    setBusy('a'); setMsg(null);
    try { const fd = new FormData(); fd.append('file', f); await api('/profile/avatar', { method: 'POST', form: fd }); setMsg({ kind: 'ok', text: 'تغيّرت صورتك.' }); me.reload(); }
    catch (x: any) { setMsg({ kind: 'error', text: x.message }); } finally { setBusy(''); }
  };
  const img = fileUrl(me.data?.avatar);
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="ملفي الشخصي" sub="يراه كل من يفتح صفحتك، فاجعله يعرّف بك." />
      <div className="space-y-5 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center gap-4">
          {img ? <img src={img} alt="صورتك الشخصية" className="h-20 w-20 rounded-full border border-line object-cover" />
            : <span className="grid h-20 w-20 place-items-center rounded-full bg-sky text-2xl font-bold text-brand">{user.name[0]}</span>}
          <Field label="الصورة الشخصية" hint="صورة فقط، حتى 2 ميغابايت">
            <Input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy === 'a'} onChange={(e) => avatar(e.target.files?.[0] ?? null)} />
          </Field>
        </div>
        <form onSubmit={save} className="space-y-4">
          <Alert kind={msg?.kind}>{msg?.text}</Alert>
          <Field label="نبذة تعريفية"><Textarea rows={5} maxLength={1000} value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
          <Field label="السعر بالساعة ($)"><Input type="number" min={0} step="0.01" dir="ltr" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
          <Button type="submit" loading={busy === 's'}>حفظ</Button>
        </form>
      </div>
    </div>
  );
}

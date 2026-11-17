'use client';
import Link from 'next/link';
import { use, useState } from 'react';
import { Alert, Badge, Button, Field, Input, Spinner, Textarea } from '@/components/ui';
import { api, dateAr, downloadDelivery, fileUrl, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const proj = useApi<any>(`/projects/${id}`);
  const p = proj.data;
  const isOwner = !!p && user?.id === p.ownerId;
  const isFree = user?.role === 'FREELANCER';
  const props = useApi<any[]>(isOwner ? `/projects/${id}/proposals` : null);
  const mine = useApi<any[]>(isFree ? '/proposals/mine' : null);
  const myProp = mine.data?.find((x) => x.projectId === Number(id));

  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState({ price: '', days: '', message: '' });
  const [file, setFile] = useState<File | null>(null);

  const refresh = () => { proj.reload(); props.reload(); mine.reload(); };
  const run = async (key: string, fn: () => Promise<string | void>) => {
    setBusy(key); setMsg(null);
    try { const t = await fn(); if (t) setMsg({ kind: 'ok', text: t }); refresh(); }
    catch (e: any) { setMsg({ kind: 'error', text: e.message }); } finally { setBusy(''); }
  };

  if (proj.loading && !p) return <Spinner />;
  if (!p) return <Alert>{proj.error || 'المشروع غير موجود.'}</Alert>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-mute">
          <Badge s={p.status} /><span>{p.category?.name}</span><span>{dateAr(p.createdAt)}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-snug">{p.title}</h1>
        <p className="mt-1 text-sm text-mute">بواسطة {p.owner?.name}</p>
        <p className="mt-6 whitespace-pre-wrap leading-loose">{p.description}</p>
        {p.attachment && <a href={fileUrl(p.attachment)!} target="_blank" rel="noreferrer" className="mt-5 inline-block font-semibold text-brand hover:underline">فتح الملف المرفق</a>}
        <div className="mt-6"><Alert kind={msg?.kind}>{msg?.text}</Alert></div>

        {isOwner && (
          <section className="mt-10">
            <h2 className="text-xl font-bold">العروض على مشروعك</h2>
            {props.loading && !props.data ? <Spinner /> : !props.data?.length ? (
              <p className="mt-3 text-mute">لم تصل عروض بعد. سيظهر كل عرض هنا فور تقديمه.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                {props.data.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <Link href={`/freelancers/${o.freelancer.id}`} className="font-bold hover:text-brand">{o.freelancer.name}</Link>
                        <Badge s={o.status} />
                      </div>
                      <p className="mt-1 text-sm text-mute">{o.message}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold"><span className="num">{money(o.price)}</span></p>
                      <p className="text-sm text-mute">{o.days} يوماً</p>
                      {p.status === 'OPEN' && (
                        <Button className="mt-2" loading={busy === 'a' + o.id}
                          onClick={() => run('a' + o.id, async () => { await api(`/proposals/${o.id}/accept`, { method: 'POST' }); return `قبلت عرض ${o.freelancer.name} وحُجز ${money(o.price)} من رصيدك.`; })}>
                          اقبل العرض
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-line bg-sky p-5">
          <p className="text-sm text-mute">الميزانية</p>
          <p className="mt-1 text-3xl font-bold"><span className="num">{money(p.budget)}</span></p>
        </div>

        {isOwner && p.status === 'IN_PROGRESS' && (
          <div className="space-y-3 rounded-xl border border-line p-5">
            <h2 className="font-bold">المراجعة والدفع</h2>
            <p className="text-sm text-mute">حمّل التسليم وراجعه، ثم وافق ليصل المبلغ إلى المستقل (90%) والمنصة (10%).</p>
            <Button variant="soft" className="w-full" loading={busy === 'd'} onClick={() => run('d', async () => { await downloadDelivery(p.id); })}>تنزيل التسليم</Button>
            <Button className="w-full" loading={busy === 'ap'} onClick={() => run('ap', async () => {
              const r = await api('/projects/' + p.id + '/approve', { method: 'POST' });
              return `اكتمل المشروع. وصل ${money(r.freelancerReceived)} إلى المستقل و${money(r.commission)} عمولة للمنصة.`;
            })}>موافقة ودفع</Button>
          </div>
        )}
        {isOwner && p.status === 'COMPLETED' && (
          <div className="rounded-xl border border-line p-5 text-sm text-mute">اكتمل هذا المشروع وتمّ الدفع. <button className="mt-2 block font-semibold text-brand" onClick={() => run('d2', async () => { await downloadDelivery(p.id); })}>تنزيل التسليم</button></div>
        )}

        {isFree && p.status === 'OPEN' && !myProp && (
          <form className="space-y-3 rounded-xl border border-line p-5" onSubmit={(e) => {
            e.preventDefault();
            run('s', async () => {
              await api(`/projects/${id}/proposals`, { method: 'POST', body: { price: Number(form.price), days: Number(form.days), message: form.message } });
              return 'وصل عرضك إلى صاحب المشروع.';
            });
          }}>
            <h2 className="font-bold">قدّم عرضك</h2>
            <Field label="السعر ($)"><Input type="number" required min={1} step="0.01" dir="ltr" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="المدة (أيام)"><Input type="number" required min={1} max={365} dir="ltr" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} /></Field>
            <Field label="رسالة قصيرة"><Textarea required minLength={5} rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
            <Button type="submit" className="w-full" loading={busy === 's'}>إرسال العرض</Button>
          </form>
        )}
        {isFree && myProp && (
          <div className="space-y-2 rounded-xl border border-line p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold">عرضك</h2><Badge s={myProp.status} /></div>
            <p className="text-sm text-mute"><span className="num">{money(myProp.price)}</span> خلال {myProp.days} أيام</p>
            {myProp.status === 'ACCEPTED' && p.status === 'IN_PROGRESS' && (
              <form className="space-y-3 border-t border-line pt-3" onSubmit={(e) => {
                e.preventDefault();
                if (!file) { setMsg({ kind: 'error', text: 'اختر ملف التسليم أولاً.' }); return; }
                run('del', async () => { const fd = new FormData(); fd.append('file', file); await api(`/projects/${id}/delivery`, { method: 'POST', form: fd }); return 'رُفع التسليم. بانتظار موافقة صاحب المشروع.'; });
              }}>
                <Field label="ملف التسليم" hint="PDF أو ملف مضغوط (zip)، حتى 20 ميغابايت">
                  <Input type="file" accept="application/pdf,application/zip,.zip" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </Field>
                <Button type="submit" className="w-full" loading={busy === 'del'}>رفع التسليم</Button>
              </form>
            )}
            {myProp.status === 'ACCEPTED' && p.status === 'COMPLETED' && <p className="text-sm font-semibold text-emerald-700">اكتمل العمل ووصلتك أرباحك في المحفظة.</p>}
          </div>
        )}
      </aside>
    </div>
  );
}

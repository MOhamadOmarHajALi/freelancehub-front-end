'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Badge, Button, PageTitle, Spinner } from '@/components/ui';
import { api, dateAr } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

const device = (ua?: string) => {
  if (!ua) return 'جهاز غير معروف';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'نظام غير معروف';
  const br = /Edg/.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : /PostmanRuntime/.test(ua) ? 'Postman' : 'متصفح';
  return `${br} على ${os}`;
};

export default function Sessions() {
  const { logoutAll } = useAuth();
  const router = useRouter();
  const s = useApi<any[]>('/auth/sessions');
  const [err, setErr] = useState('');

  const revoke = async (id: string) => { try { await api(`/auth/sessions/${id}`, { method: 'DELETE' }); s.reload(); } catch (e: any) { setErr(e.message); } };
  return (
    <>
      <PageTitle title="أجهزتي وجلساتي" sub="الأجهزة التي سجّلت الدخول منها. أنهِ أي جلسة لا تعرفها."
        action={<Button variant="danger" onClick={async () => { if (confirm('الخروج من كل الأجهزة، ومنها هذا الجهاز؟')) { await logoutAll(); router.replace('/login'); } }}>الخروج من كل الأجهزة</Button>} />
      <Alert>{err}</Alert>
      {s.loading && !s.data ? <Spinner /> : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {s.data?.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-bold">{device(x.userAgent)} {x.current && <span className="ms-2 rounded-full bg-sky px-2 py-0.5 text-xs text-brand-dark">هذا الجهاز</span>}</p>
                <p className="mt-0.5 text-sm text-mute"><span className="num">{x.ip}</span> · آخر استخدام {dateAr(x.lastUsedAt)}</p>
              </div>
              {!x.current && <Button variant="danger" onClick={() => revoke(x.id)}>إنهاء الجلسة</Button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

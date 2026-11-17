'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, Empty, LinkButton, PageTitle, Spinner } from '@/components/ui';
import { api, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

export default function Dashboard() {
  const { user } = useAuth();
  const owner = user?.role === 'OWNER';
  const free = user?.role === 'FREELANCER';
  const list = useApi<any[]>(owner ? '/projects/mine' : free ? '/proposals/mine' : null);
  const [err, setErr] = useState('');

  if (user?.role === 'ADMIN') return <Empty title="حساب الأدمن" hint="إدارة المستخدمين والتصنيفات من صفحة الإدارة." action={<LinkButton href="/admin">فتح الإدارة</LinkButton>} />;
  if (list.loading && !list.data) return <Spinner />;

  const del = async (id: number) => {
    if (!confirm('حذف هذا المشروع نهائياً؟')) return;
    try { await api(`/projects/${id}`, { method: 'DELETE' }); list.reload(); } catch (e: any) { setErr(e.message); }
  };
  return (
    <>
      <PageTitle title={owner ? 'مشاريعي' : 'عروضي'} sub={owner ? 'كل مشاريعك وحالة كل واحد منها' : 'العروض التي قدّمتها وحالة كل عرض'}
        action={owner ? <LinkButton href="/projects/new">مشروع جديد</LinkButton> : <LinkButton href="/projects" variant="soft">تصفّح المشاريع</LinkButton>} />
      <Alert>{err}</Alert>
      {!list.data?.length ? (
        <Empty title={owner ? 'لم تنشر أي مشروع بعد' : 'لم تقدّم أي عرض بعد'}
          hint={owner ? 'انشر أول مشروع ليصلك عروض المستقلين.' : 'تصفّح المشاريع المفتوحة وقدّم عرضك الأول.'}
          action={owner ? <LinkButton href="/projects/new">انشر مشروعاً</LinkButton> : <LinkButton href="/projects">تصفّح المشاريع</LinkButton>} />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {list.data.map((x) => {
            const title = owner ? x.title : x.project?.title;
            const pid = owner ? x.id : x.projectId;
            return (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/projects/${pid}`} className="font-bold hover:text-brand">{title}</Link>
                  <p className="mt-0.5 text-sm text-mute"><span className="num">{money(owner ? x.budget : x.price)}</span>{!owner && ` · ${x.days} أيام`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge s={owner ? x.status : x.status} />
                  {!owner && x.project?.status && <span className="text-xs text-mute">المشروع: <Badge s={x.project.status} /></span>}
                  {owner && x.status === 'OPEN' && <Button variant="danger" onClick={() => del(x.id)}>حذف</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

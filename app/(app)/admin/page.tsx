'use client';
import { useState } from 'react';
import { Alert, Button, Empty, Input, PageTitle, Pagination, Spinner } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

const ROLE: Record<string, string> = { OWNER: 'صاحب مشروع', FREELANCER: 'مستقل', ADMIN: 'مدير' };

export default function Admin() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const users = useApi<{ data: any[]; meta: any }>(user?.role === 'ADMIN' ? `/admin/users?page=${page}&limit=10` : null);
  const cats = useApi<{ id: number; name: string }[]>(user?.role === 'ADMIN' ? '/categories' : null);
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<{ id: number; name: string } | null>(null);
  const [err, setErr] = useState('');

  if (user?.role !== 'ADMIN') return <Alert>هذه الصفحة للمدير فقط.</Alert>;
  const act = async (fn: () => Promise<unknown>, after: () => void) => { setErr(''); try { await fn(); after(); } catch (e: any) { setErr(e.message); } };

  return (
    <>
      <PageTitle title="الإدارة" />
      <Alert>{err}</Alert>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-xl font-bold">المستخدمون</h2>
          {users.loading && !users.data ? <Spinner /> : !users.data?.data.length ? <Empty title="لا يوجد مستخدمون" /> : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-mist text-mute"><tr><th className="p-3 text-start font-medium">الاسم</th><th className="p-3 text-start font-medium">الدور</th><th className="p-3 text-start font-medium">الحالة</th><th /></tr></thead>
                <tbody className="divide-y divide-line">
                  {users.data.data.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3"><p className="font-medium">{u.name}</p><p className="num text-xs text-mute">{u.email}</p></td>
                      <td className="p-3">{ROLE[u.role]}</td>
                      <td className="p-3">{u.isBanned ? <span className="font-semibold text-red-700">محظور</span> : 'نشط'}</td>
                      <td className="p-3 text-end">
                        {u.role !== 'ADMIN' && <Button variant={u.isBanned ? 'soft' : 'danger'}
                          onClick={() => act(() => api(`/admin/users/${u.id}/ban`, { method: 'PATCH', body: { banned: !u.isBanned } }), users.reload)}>
                          {u.isBanned ? 'فك الحظر' : 'حظر'}</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination meta={users.data?.meta} onPage={setPage} />
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">التصنيفات</h2>
          <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); act(() => api('/categories', { method: 'POST', body: { name } }), () => { setName(''); cats.reload(); }); }}>
            <Input required minLength={2} placeholder="تصنيف جديد" value={name} onChange={(e) => setName(e.target.value)} aria-label="اسم التصنيف" />
            <Button type="submit">إضافة</Button>
          </form>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {cats.data?.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 p-3">
                {edit?.id === c.id ? (
                  <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); act(() => api(`/categories/${c.id}`, { method: 'PATCH', body: { name: edit.name } }), () => { setEdit(null); cats.reload(); }); }}>
                    <Input value={edit.name} onChange={(e) => setEdit({ id: c.id, name: e.target.value })} aria-label="الاسم الجديد" />
                    <Button type="submit">حفظ</Button>
                  </form>
                ) : (<>
                  <span className="font-medium">{c.name}</span>
                  <span className="flex gap-1">
                    <Button variant="ghost" onClick={() => setEdit({ id: c.id, name: c.name })}>تعديل</Button>
                    <Button variant="danger" onClick={() => confirm(`حذف تصنيف ${c.name}؟`) && act(() => api(`/categories/${c.id}`, { method: 'DELETE' }), cats.reload)}>حذف</Button>
                  </span>
                </>)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

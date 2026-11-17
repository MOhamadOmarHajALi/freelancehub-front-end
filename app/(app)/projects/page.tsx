'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Badge, Empty, Input, PageTitle, Pagination, Select, Spinner } from '@/components/ui';
import { dateAr, money } from '@/lib/api';
import { useApi, useDebounced } from '@/lib/hooks';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const cats = useApi<{ id: number; name: string }[]>('/categories');
  const qs = new URLSearchParams({ page: String(page), limit: '9', sort });
  if (q) qs.set('search', q);
  if (cat) qs.set('categoryId', cat);
  const { data, loading, error } = useApi<{ data: any[]; meta: any }>('/projects?' + qs);

  return (
    <>
      <PageTitle title="تصفّح المشاريع" sub="المشاريع المفتوحة فقط" />
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <Input placeholder="ابحث في عناوين المشاريع" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="بحث" />
        <Select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} aria-label="التصنيف">
          <option value="">كل التصنيفات</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="الترتيب">
          <option value="newest">الأحدث</option>
          <option value="budget_desc">الميزانية: الأعلى</option>
          <option value="budget_asc">الميزانية: الأقل</option>
        </Select>
      </div>
      {error && <p className="text-red-700">{error}</p>}
      {loading && !data ? <Spinner /> : !data?.data.length ? (
        <Empty title="لا توجد مشاريع مطابقة" hint="جرّب كلمة بحث أخرى أو أزل التصفية." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-colors hover:border-brand">
                <div className="flex items-center justify-between text-xs text-mute"><span>{p.category?.name}</span><Badge s={p.status} /></div>
                <h2 className="mt-3 line-clamp-2 text-lg font-bold">{p.title}</h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-mute">{p.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                  <span className="font-bold text-brand"><span className="num">{money(p.budget)}</span></span>
                  <span className="text-mute">{dateAr(p.createdAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination meta={data?.meta} onPage={setPage} />
    </>
  );
}

'use client';
import { use } from 'react';
import { Alert, Spinner } from '@/components/ui';
import { fileUrl, money } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function Freelancer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useApi<any>(`/freelancers/${id}`);
  if (loading && !data) return <Spinner />;
  if (!data) return <Alert>{error || 'لم نجد هذا المستقل.'}</Alert>;
  const img = fileUrl(data.avatar);
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8">
      <div className="flex items-center gap-5">
        {img ? <img src={img} alt={data.user.name} className="h-24 w-24 rounded-full border border-line object-cover" />
          : <span className="grid h-24 w-24 place-items-center rounded-full bg-sky text-3xl font-bold text-brand">{data.user.name[0]}</span>}
        <div>
          <h1 className="text-2xl font-bold">{data.user.name}</h1>
          <p className="mt-1 text-mute">{data.hourlyRate ? <><span className="num font-bold text-ink">{money(data.hourlyRate)}</span> في الساعة</> : 'لم يحدد سعراً بالساعة بعد'}</p>
        </div>
      </div>
      <h2 className="mt-8 font-bold">نبذة</h2>
      <p className="mt-2 whitespace-pre-wrap leading-loose text-mute">{data.bio || 'لم يكتب نبذة بعد.'}</p>
    </div>
  );
}

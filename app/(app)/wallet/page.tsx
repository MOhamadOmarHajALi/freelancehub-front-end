'use client';
import { useState } from 'react';
import { Alert, Badge, Button, Empty, Field, Input, PageTitle, Pagination, Spinner } from '@/components/ui';
import { api, dateAr, money } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApi } from '@/lib/hooks';

const TYPE: Record<string, string> = { TOPUP: 'شحن رصيد', HOLD: 'حجز لمشروع', PAYOUT: 'أرباح مشروع', COMMISSION: 'عمولة المنصة' };

export default function Wallet() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const w = useApi<{ balance: string; held: string }>('/wallet');
  const tx = useApi<{ data: any[]; meta: any }>(`/wallet/transactions?page=${page}&limit=10`);
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const topup = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await api('/wallet/topup', { method: 'POST', body: { amount: Number(amount) } }); setMsg({ kind: 'ok', text: `أُضيف ${money(amount)} إلى رصيدك.` }); setAmount(''); w.reload(); tx.reload(); setPage(1); }
    catch (x: any) { setMsg({ kind: 'error', text: x.message }); } finally { setBusy(false); }
  };

  return (
    <>
      <PageTitle title="المحفظة" />
      {w.loading && !w.data ? <Spinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr]">
          <div className="rounded-xl border border-line bg-sky p-5"><p className="text-sm text-mute">الرصيد المتاح</p><p className="mt-1 text-3xl font-bold"><span className="num">{money(w.data?.balance ?? 0)}</span></p></div>
          <div className="rounded-xl border border-line p-5"><p className="text-sm text-mute">محجوز لمشاريع جارية</p><p className="mt-1 text-3xl font-bold"><span className="num">{money(w.data?.held ?? 0)}</span></p></div>
          {user?.role === 'OWNER' && (
            <form onSubmit={topup} className="space-y-3 rounded-xl border border-line p-5 sm:col-span-2 lg:col-span-1">
              <Field label="شحن الرصيد ($)" hint="نسخة تجريبية بلا بوابة دفع: يُضاف المبلغ مباشرة.">
                <Input type="number" min={1} max={100000} step="0.01" required dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <Button type="submit" loading={busy}>شحن</Button>
            </form>
          )}
        </div>
      )}
      <div className="mt-4"><Alert kind={msg?.kind}>{msg?.text}</Alert></div>
      <h2 className="mb-3 mt-8 text-xl font-bold">الحركات المالية</h2>
      {tx.loading && !tx.data ? <Spinner /> : !tx.data?.data.length ? <Empty title="لا توجد حركات بعد" /> : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-mist text-start text-mute"><tr><th className="p-3 text-start font-medium">النوع</th><th className="p-3 text-start font-medium">المبلغ</th><th className="p-3 text-start font-medium">التاريخ</th></tr></thead>
            <tbody className="divide-y divide-line">
              {tx.data.data.map((t) => (
                <tr key={t.id}>
                  <td className="p-3 font-medium">{TYPE[t.type] ?? t.type}</td>
                  <td className="p-3"><span className={`num font-bold ${t.type === 'HOLD' ? 'text-amber-700' : 'text-ink'}`}>{money(t.amount)}</span></td>
                  <td className="p-3 text-mute">{dateAr(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={tx.data?.meta} onPage={setPage} />
    </>
  );
}

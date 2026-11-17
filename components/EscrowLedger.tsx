'use client';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// قصة سارة وأحمد من وصف المشروع: 300 → حجز 200 → تسليم وموافقة → 180 + 20
const STEPS = [
  { cap: 'سارة تفتح حسابها ولم تشحن بعد', sara: [0, 0], ahmad: 0, hub: 0 },
  { cap: 'سارة تشحن محفظتها بـ $300', sara: [300, 0], ahmad: 0, hub: 0 },
  { cap: 'تقبل عرض أحمد بـ $200: يُحجز المبلغ ولا يصل إليه بعد', sara: [100, 200], ahmad: 0, hub: 0 },
  { cap: 'أحمد يسلّم الشعار وسارة توافق: يُفرج عن المحجوز', sara: [100, 0], ahmad: 180, hub: 20 },
];

function Count({ to }: { to: number }) {
  const [v, setV] = useState(to);
  const from = useRef(to);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setV(to); from.current = to; return; }
    const c = animate(from.current, to, { duration: 0.9, ease: 'easeOut', onUpdate: (x) => { setV(x); from.current = x; } });
    return () => c.stop();
  }, [to, reduce]);
  return <span className="num">${Math.round(v)}</span>;
}

function Row({ name, sub, main, held, changed }: { name: string; sub: string; main: number; held?: number; changed: string }) {
  return (
    <motion.div key={changed} initial={{ backgroundColor: '#E8F0FF' }} animate={{ backgroundColor: 'rgba(232,240,255,0)' }}
      transition={{ duration: 1.4 }} className="flex items-center justify-between gap-4 px-5 py-4">
      <div><p className="font-semibold text-ink">{name}</p><p className="text-xs text-mute">{sub}</p></div>
      <div className="text-end">
        <p className="text-xl font-bold text-ink"><Count to={main} /></p>
        {held !== undefined && <p className="text-xs text-mute">محجوز <Count to={held} /></p>}
      </div>
    </motion.div>
  );
}

export default function EscrowLedger() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce) { setI(STEPS.length - 1); return; }
    setI(0);
    const timers = STEPS.slice(1).map((_, k) => setTimeout(() => setI(k + 1), 900 + k * 2300));
    return () => timers.forEach(clearTimeout);
  }, [run, reduce]);

  const s = STEPS[i];
  return (
    <div className="w-full max-w-md" aria-label="مثال متحرك على مسار المال في المنصة">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_60px_-30px_rgba(29,91,255,0.35)]">
        <div className="flex items-center justify-between border-b border-line bg-sky px-5 py-3 text-sm font-semibold text-ink">
          <span>مشروع: تصميم شعار</span><span className="num text-mute">$200</span>
        </div>
        <div className="divide-y divide-line">
          <Row name="محفظة سارة" sub="صاحبة المشروع" main={s.sara[0]} held={s.sara[1]} changed={`s${s.sara}`} />
          <Row name="محفظة أحمد" sub="المستقل" main={s.ahmad} changed={`a${s.ahmad}`} />
          <Row name="المنصة" sub="عمولة 10%" main={s.hub} changed={`h${s.hub}`} />
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex gap-1.5" aria-hidden>
            {STEPS.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= i ? 'bg-brand' : 'bg-line'}`} />)}
          </div>
          <p className="min-h-[2.75rem] text-sm leading-relaxed text-ink" aria-live="polite">{s.cap}</p>
        </div>
      </div>
      {i === STEPS.length - 1 && !reduce && (
        <button onClick={() => setRun((r) => r + 1)} className="mt-3 text-sm font-medium text-brand hover:underline">أعد العرض</button>
      )}
    </div>
  );
}

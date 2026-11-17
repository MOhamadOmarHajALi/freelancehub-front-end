'use client';
import Link from 'next/link';
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

type V = 'primary' | 'soft' | 'ghost' | 'danger';
export const btn = (v: V = 'primary', extra = '') => cx(
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
  v === 'primary' && 'bg-brand text-white hover:bg-brand-dark',
  v === 'soft' && 'bg-sky text-ink hover:bg-line',
  v === 'ghost' && 'text-ink hover:bg-sky',
  v === 'danger' && 'bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50',
  extra,
);
export function Button({ variant = 'primary', loading, className, children, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V; loading?: boolean }) {
  return <button {...p} disabled={p.disabled || loading} className={btn(variant, className)}>{loading ? 'جارٍ التنفيذ…' : children}</button>;
}
export function LinkButton({ href, variant = 'primary', className, children }:
  { href: string; variant?: V; className?: string; children: ReactNode }) {
  return <Link href={href} className={btn(variant, className)}>{children}</Link>;
}

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-mute/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(field, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={cx(field, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(field, p.className)} />;
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'ok'; children: ReactNode }) {
  if (!children) return null;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'}
      className={cx('rounded-lg px-3 py-2.5 text-sm', kind === 'error' ? 'bg-red-50 text-red-800 ring-1 ring-red-100' : 'bg-sky text-ink ring-1 ring-line')}>
      {children}
    </div>
  );
}

const TONE: Record<string, string> = {
  OPEN: 'bg-sky text-brand-dark', IN_PROGRESS: 'bg-amber-50 text-amber-800', COMPLETED: 'bg-emerald-50 text-emerald-800',
  PENDING: 'bg-sky text-brand-dark', ACCEPTED: 'bg-emerald-50 text-emerald-800', REJECTED: 'bg-slate-100 text-slate-600',
};
const LABEL: Record<string, string> = {
  OPEN: 'مفتوح', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل',
  PENDING: 'بانتظار القرار', ACCEPTED: 'مقبول', REJECTED: 'مرفوض',
};
export const Badge = ({ s }: { s: string }) =>
  <span className={cx('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', TONE[s])}>{LABEL[s] ?? s}</span>;

export const Spinner = () => <div className="py-16 text-center text-sm text-mute" aria-busy="true">جارٍ التحميل…</div>;
export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
    <p className="font-semibold text-ink">{title}</p>
    {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export function Pagination({ meta, onPage }: { meta?: { page: number; totalPages: number; total: number }; onPage: (p: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="الصفحات">
      <Button variant="soft" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>السابق</Button>
      <span className="text-mute">صفحة <span className="num">{meta.page}</span> من <span className="num">{meta.totalPages}</span> ({meta.total} نتيجة)</span>
      <Button variant="soft" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>التالي</Button>
    </nav>
  );
}

export const PageTitle = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold text-ink">{title}</h1>{sub && <p className="mt-1 text-sm text-mute">{sub}</p>}</div>
    {action}
  </div>
);

export const Logo = ({ light }: { light?: boolean }) => (
  <span className={cx('inline-flex items-center gap-2 text-lg font-bold', light ? 'text-white' : 'text-ink')}>
    <span className={cx('grid h-7 w-7 place-items-center rounded-md text-sm font-bold', light ? 'bg-white text-brand' : 'bg-brand text-white')}>F</span>
    FreelanceHub
  </span>
);

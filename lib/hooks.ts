'use client';
import { useEffect, useState } from 'react';
import { api } from './api';

/** جلب بيانات GET. مرّر null لتعطيل الجلب. */
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!path);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!path) { setData(null); setLoading(false); return; }
    let on = true;
    setLoading(true);
    api<T>(path)
      .then((d) => { if (on) { setData(d); setError(''); } })
      .catch((e) => on && setError(e.message))
      .finally(() => on && setLoading(false));
    return () => { on = false; };
  }, [path, n]);
  return { data, error, loading, reload: () => setN((x) => x + 1) };
}

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

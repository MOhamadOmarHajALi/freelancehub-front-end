export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const KEY = 'fh_auth';

export type Role = 'OWNER' | 'FREELANCER' | 'ADMIN';
export type User = { id: number; name: string; email: string; role: Role };
type Session = { accessToken: string; refreshToken: string; user: User };

export const getSession = (): Session | null => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
};
export const setSession = (s: Session | null) => {
  if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY);
};

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

// رسائل الخادم بالعربية
const MSG: Record<string, string> = {
  'Email already used': 'هذا البريد مسجّل مسبقاً.',
  'Invalid credentials': 'البريد أو كلمة السر غير صحيحة.',
  'Account banned': 'هذا الحساب محظور.',
  'Insufficient balance': 'رصيدك لا يكفي. اشحن محفظتك ثم أعد المحاولة.',
  'Project is not open': 'المشروع لم يعد مفتوحاً.',
  'Project is no longer open': 'المشروع لم يعد مفتوحاً.',
  'Only open projects can be changed': 'لا يمكن تعديل مشروع بدأ تنفيذه.',
  'Proposal is not pending': 'هذا العرض لم يعد قيد الانتظار.',
  'Proposal can no longer be edited': 'لا يمكن تعديل هذا العرض الآن.',
  'You already submitted a proposal': 'قدّمت عرضاً على هذا المشروع من قبل.',
  'Not your active project': 'هذا ليس مشروعك الجاري.',
  'Already delivered': 'سلّمت هذا المشروع من قبل.',
  'Nothing to approve': 'لا يوجد تسليم للموافقة عليه بعد.',
  'Already completed': 'المشروع مكتمل مسبقاً.',
  'Category has projects': 'لا يمكن حذف تصنيف عليه مشاريع.',
  'Name already exists': 'هذا الاسم موجود مسبقاً.',
  'Unknown category': 'التصنيف غير موجود.',
  'Invalid file type': 'نوع الملف غير مسموح.',
  'file is required': 'اختر ملفاً أولاً.',
  'File too large': 'حجم الملف أكبر من المسموح.',
  'Forbidden resource': 'ليس لديك صلاحية لهذا الإجراء.',
  'Unauthorized': 'انتهت الجلسة، سجّل الدخول من جديد.',
    'Insufficient balance for budget': 'رصيدك أقل من ميزانية المشروع. اشحن محفظتك أولاً.',
};
export const arabic = (m: string) => MSG[m] ?? m;

let refreshing: Promise<boolean> | null = null;
function refreshTokens() {
  if (!refreshing) {                       // طلب تجديد واحد فقط حتى لو فشلت طلبات كثيرة معاً
    refreshing = (async () => {
      const s = getSession();
      if (!s) return false;
      try {
        const r = await fetch(API + '/auth/refresh', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: s.refreshToken }),
        });
        if (!r.ok) return false;
        const j = await r.json();
        setSession({ accessToken: j.accessToken, refreshToken: j.refreshToken, user: j.user });
        return true;
      } catch { return false; }
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

type Opts = { method?: string; body?: unknown; form?: FormData; auth?: boolean };

export async function raw(path: string, opts: Opts = {}, retry = true): Promise<Response> {
  const s = getSession();
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false && s) headers.Authorization = 'Bearer ' + s.accessToken;
  const res = await fetch(API + path, {
    method: opts.method || 'GET', headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
  if (res.status === 401 && opts.auth !== false && retry && s) {
    if (await refreshTokens()) return raw(path, opts, false);   // تجديد صامت ثم إعادة الطلب مرة واحدة
    setSession(null);
    window.dispatchEvent(new Event('fh:logout'));
  }
  return res;
}

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const res = await raw(path, opts);
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not json */ }
  if (!res.ok) {
    if (res.status === 429) throw new ApiError(429, 'محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.');
    const m = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(res.status, arabic(m || 'تعذّر تنفيذ الطلب. حاول مرة أخرى.'));
  }
  return data as T;
}

/** تنزيل ملف التسليم (يحتاج توكن، لذلك لا يصلح رابط عادي) */
export async function downloadDelivery(projectId: number) {
  const res = await raw(`/projects/${projectId}/delivery`);
  if (res.status === 404) throw new ApiError(404, 'لم يرفع المستقل التسليم بعد.');
  if (!res.ok) throw new ApiError(res.status, 'لا يمكنك تنزيل هذا الملف.');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const ext = blob.type.includes('zip') ? '.zip' : '.pdf';
  a.download = `delivery-${projectId}${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const fileUrl = (p?: string | null) => (p ? API + p : null);
export const money = (n: number | string) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const dateAr = (d: string) => new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });

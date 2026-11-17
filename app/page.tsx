'use client';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';
import EscrowLedger from '@/components/EscrowLedger';
import { LinkButton, Logo } from '@/components/ui';

const FLOW = [
  { t: 'تنشر مشروعك', d: 'اكتب ما تحتاجه، وحدّد التصنيف والميزانية، وأرفق ملفاً إن أردت.' },
  { t: 'تختار العرض وأموالك محجوزة', d: 'عند قبول العرض يُخصم المبلغ من رصيدك ويُحجز. لا يصل إلى المستقل بعد.' },
  { t: 'المستقل يسلّم العمل', d: 'يرفع ملف التسليم (PDF أو ملف مضغوط) وتراجعه على راحتك.' },
  { t: 'توافق فيصل المبلغ', d: '90% للمستقل و10% عمولة للمنصة، ويكتمل المشروع.' },
];

function Flow() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] });
  const y = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <ol ref={ref} className="relative mt-10 space-y-10 ps-10">
      <span className="absolute start-[11px] top-2 h-[calc(100%-1rem)] w-0.5 bg-line" aria-hidden />
      <motion.span className="absolute start-[11px] top-2 h-[calc(100%-1rem)] w-0.5 origin-top bg-brand" aria-hidden
        style={{ scaleY: reduce ? 1 : y }} />
      {FLOW.map((f, i) => (
        <li key={f.t} className="relative">
          <span className="absolute -start-10 top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-brand bg-white text-xs font-bold text-brand">{i + 1}</span>
          <h3 className="text-lg font-bold">{f.t}</h3>
          <p className="mt-1 max-w-md text-mute">{f.d}</p>
        </li>
      ))}
    </ol>
  );
}

export default function Landing() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex" aria-label="الصفحة الرئيسية">
          <a href="#how" className="hover:text-brand">كيف يعمل الدفع</a>
          <a href="#roles" className="hover:text-brand">لمن المنصة</a>
          <a href="#rules" className="hover:text-brand">الضمانات</a>
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost">دخول</LinkButton>
          <LinkButton href="/register">إنشاء حساب</LinkButton>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="ledger-lines absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.35] text-ink sm:text-5xl sm:leading-[1.3]">
              اعمل مع مستقلين محترفين،<br />ولا تدفع إلا بعد أن تستلم العمل.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-mute">
              FreelanceHub يحجز مبلغ المشروع في محفظتك، ولا يحوّله إلى المستقل إلا بعد أن توافق على التسليم. وإن كنت مستقلاً فحقك محفوظ من لحظة قبول عرضك.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/register?role=OWNER" className="px-6 py-3 text-base">انشر مشروعك</LinkButton>
              <LinkButton href="/register?role=FREELANCER" variant="soft" className="px-6 py-3 text-base">ابدأ كمستقل</LinkButton>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end"><EscrowLedger /></div>
        </div>
      </section>

      <section id="how" className="border-t border-line bg-mist py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-3xl font-bold leading-snug">أين يذهب مالك في كل خطوة</h2>
            <p className="mt-3 max-w-sm text-mute">المبلغ لا يخرج من الحجز إلا إلى المستقل، وبموافقتك أنت فقط. إما أن تتم كل الخطوات أو لا يتم منها شيء.</p>
          </div>
          <Flow />
        </div>
      </section>

      <section id="roles" className="py-20">
        <div className="mx-auto grid max-w-6xl gap-0 px-4 md:grid-cols-2">
          <div className="border-line py-4 md:border-e md:pe-12">
            <h2 className="text-2xl font-bold">إن كنت صاحب مشروع</h2>
            <ul className="mt-5 space-y-3 text-mute">
              <li>تنشر المشاريع وتعدّلها ما دامت مفتوحة.</li>
              <li>ترى العروض على مشاريعك أنت فقط، وتقبل واحداً منها.</li>
              <li>تشحن محفظتك وترى كل حركة مالية فيها.</li>
              <li>تراجع التسليم قبل أن يصل المبلغ لأي أحد.</li>
            </ul>
          </div>
          <div className="py-4 md:ps-12">
            <h2 className="text-2xl font-bold">إن كنت مستقلاً</h2>
            <ul className="mt-5 space-y-3 text-mute">
              <li>تتصفح الآلاف من المشاريع بحسب التصنيف والبحث والميزانية.</li>
              <li>تقدّم عرضاً واحداً لكل مشروع بسعرك ومدتك.</li>
              <li>ملفك الشخصي يراه الجميع: صورتك ونبذتك وسعرك بالساعة.</li>
              <li>تستلم أرباحك في محفظتك فور موافقة العميل.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="rules" className="border-t border-line bg-mist py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">ما نلتزم به</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {[
              ['المال لا يتحرك نصف حركة', 'يُخصم المبلغ ويُقبل العرض معاً، أو لا يحدث أيٌّ منهما. وكذلك عند الدفع للمستقل.'],
              ['بياناتك لا يصل إليها غيرك', 'لا يعدّل أحد مشروعك أو عرضك، حتى لو غيّر الرقم في الرابط.'],
              ['العمولة معروفة مسبقاً', '10% فقط، وتُخصم عند اكتمال العمل، وتظهر في سجل حركاتك.'],
              ['جلساتك بيدك', 'ترى الأجهزة التي سجّلت منها، وتخرج من أي جهاز أو من كلها بضغطة.'],
            ].map(([t, d]) => (
              <div key={t} className="grid gap-1 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
                <dt className="font-bold">{t}</dt><dd className="text-mute">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">أعمال تجدها على المنصة</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {['برمجة', 'تصميم', 'ترجمة', 'تسويق'].map((c) => (
              <Link key={c} href="/register" className="rounded-full border border-line px-5 py-2.5 font-medium transition-colors hover:border-brand hover:bg-sky">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4">
          <h2 className="max-w-xl text-3xl font-bold leading-snug">عندك عمل يحتاج إنجازاً؟ ابدأ بنشره اليوم.</h2>
          <div className="flex gap-3">
            <Link href="/register?role=OWNER" className="rounded-lg bg-white px-6 py-3 font-semibold text-brand hover:bg-sky">إنشاء حساب</Link>
            <Link href="/login" className="rounded-lg px-6 py-3 font-semibold text-white ring-1 ring-white/50 hover:bg-white/10">لدي حساب</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-mute">FreelanceHub — مشروع التخرج، مسار تطوير الـ Back-End</footer>
    </div>
  );
}

# FreelanceHub Web (Next.js 15 + Tailwind + Framer Motion)

واجهات عربية (RTL) بالأبيض والأزرق لمنصة FreelanceHub، مع صفحة هبوط متحركة.

## التشغيل
```bash
npm install
copy .env.example .env.local      # (Linux/Mac: cp)  ثم عدّل NEXT_PUBLIC_API_URL إن لزم
npm run dev                        # http://localhost:3001
```
شغّل الـ API أولاً على http://localhost:3000.

## مطلوب في الـ API (src/main.ts): CORS
```ts
app.enableCors({ origin: ['http://localhost:3001'] });
```

## الصفحات
| المسار | الوصف |
|---|---|
| / | صفحة الهبوط (دفتر حسابات متحرك + خط زمني يُرسم مع التمرير) |
| /login /register | الدخول والتسجيل (اختيار الدور) |
| /projects | تصفّح بالبحث والتصنيف والترتيب وتقسيم صفحات |
| /projects/new | نشر مشروع مع مرفق (صاحب مشروع) |
| /projects/[id] | التفاصيل، العروض، القبول، التسليم، الموافقة والدفع |
| /dashboard | مشاريعي (صاحب مشروع) أو عروضي (مستقل) |
| /wallet | الرصيد والمحجوز والشحن وسجل الحركات |
| /profile, /freelancers/[id] | ملف المستقل وصورته |
| /sessions | الأجهزة، إنهاء جلسة، الخروج من كل الأجهزة |
| /admin | حظر المستخدمين وإدارة التصنيفات |

## ملاحظات تقنية
- التوكن يُحفظ في localStorage ويجدَّد تلقائياً عند 401 (طلب تجديد واحد فقط حتى لو فشلت طلبات كثيرة معاً).
- للإنتاج الأفضل نقل الـ refresh token إلى cookie من نوع httpOnly.
- الخط IBM Plex Sans Arabic يُحمَّل من Google Fonts (يحتاج إنترنت) وله بدائل نظامية.

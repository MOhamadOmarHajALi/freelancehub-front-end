import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'FreelanceHub — اعمل مع مستقلين محترفين وادفع عند الاستلام',
  description: 'منصة تجمع أصحاب المشاريع بالمستقلين، والمال محجوز حتى توافق على التسليم.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}

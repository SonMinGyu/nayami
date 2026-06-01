import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: '나야미 — 익명 고민 공유',
  description: '익명으로 고민을 나누고, 따뜻한 답장을 받아보세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full bg-surface font-body-md text-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

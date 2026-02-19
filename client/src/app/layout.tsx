import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-provider';
import { Toaster } from 'sonner';
import I18nProvider from '@/providers/i18n-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import AuthInitializer from '@/components/providers/auth-initializer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Atomecom | Modern E-commerce Solution',
  description:
    'Modern E-commerce Solution with Clean Architecture and Domain-Driven Design. Built with Next.js 15, TypeScript, and high-performance technologies.',
  keywords: [
    'E-commerce',
    'Clean Architecture',
    'Domain-Driven Design',
    'Next.js 15',
    'TypeScript',
    'Microservices',
    'Scalable Architecture',
  ],
  authors: [{ name: 'Atomecom Team' }],
  openGraph: {
    title: 'Atomecom | Modern E-commerce Solution',
    description:
      'Building the future of e-commerce with performance-driven architecture.',
    url: 'https://atomecom.com',
    siteName: 'Atomecom',
    images: [
      {
        url: '/og-image.png', // Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: 'Atomecom Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atomecom | Modern E-commerce Solution',
    description: 'Built for speed, security, and developer happiness.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <I18nProvider>
              <AuthInitializer>{children}</AuthInitializer>
            </I18nProvider>
            <Toaster
              position="bottom-right"
              expand={false}
              richColors={false}
              closeButton
              theme="system"
              toastOptions={{
                classNames: {
                  toast:
                    'group font-sans border border-border/50 shadow-2xl p-3 rounded-xl backdrop-blur-md bg-background/70 text-foreground text-xs font-bold transition-all duration-300',
                  success:
                    'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                  error:
                    'border-destructive/20 bg-destructive/10 text-destructive',
                  info: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
                  warning:
                    'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                },
              }}
            />
            {/* 🍯 Security Honeypot: Do not remove */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/system/admin/keys`}
              style={{ display: 'none' }}
              aria-hidden="true"
              rel="nofollow"
            >
              System Critical Keys
            </a>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

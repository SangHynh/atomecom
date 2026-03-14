import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-provider';
import { Toaster } from 'sonner';
import I18nProvider from '@/providers/i18n-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import AuthInitializer from '@/components/auth/providers/auth-initializer';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  variable: '--font-editorial',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
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
        className={`${jakarta.variable} ${dmSerif.variable} antialiased`}
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
              richColors
              closeButton
              theme="system"
              toastOptions={{
                classNames: {
                  toast:
                    'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                  description: 'group-[.toast]:text-muted-foreground',
                  actionButton:
                    'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                  cancelButton:
                    'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
                style: {
                  padding: '12px',
                  fontSize: '12px',
                  width: '300px',
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

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";
import I18nProvider from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atomecom | Modern E-commerce Solution",
  description: "Modern E-commerce Solution with Clean Architecture and Domain-Driven Design. Built with Next.js 15, TypeScript, and high-performance technologies.",
  keywords: ["E-commerce", "Clean Architecture", "Domain-Driven Design", "Next.js 15", "TypeScript", "Microservices", "Scalable Architecture"],
  authors: [{ name: "Atomecom Team" }],
  openGraph: {
    title: "Atomecom | Modern E-commerce Solution",
    description: "Building the future of e-commerce with performance-driven architecture.",
    url: "https://atomecom.com",
    siteName: "Atomecom",
    images: [
      {
        url: "/og-image.png", // Recommended size: 1200x630
        width: 1200,
        height: 630,
        alt: "Atomecom Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atomecom | Modern E-commerce Solution",
    description: "Built for speed, security, and developer happiness.",
    images: ["/og-image.png"],
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
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
            <Toaster 
            position="top-right"
            expand={false}
            richColors={false}
            closeButton
            theme="system"
            toastOptions={{
              className: 'font-sans',
              style: {
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: '#fff',
                color: '#1a1a1a',
              },
            }}
          />
        </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { LanguageProvider } from '@/contexts/language-provider';

export const metadata: Metadata = {
  title: 'TypeZilla',
  description: 'Improve your typing speed and accuracy with realistic typing tests and AI feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Correct favicon setup */}
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=2" />
        <meta name="theme-color" content="#000000" />

        {/* ✅ Preload your logo for navbar */}
        <link rel="preload" as="image" href="/typezillalogo.png" />

        {/* ✅ Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className="font-body antialiased min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

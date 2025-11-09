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
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        {/* Optional: logo preload for faster navbar rendering */}
        <link rel="preload" as="image" href="/typezillalogo.png" />

        {/* Fonts */}
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
            {/* Navbar logo area */}
            <header className="flex items-center p-4">
              <a href="/" className="flex items-center gap-2">
                <img
                  src="/typezillalogo.png"
                  alt="TypeZilla Logo"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </a>
            </header>

            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )};

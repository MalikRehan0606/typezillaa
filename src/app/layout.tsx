import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { GithubIcon, InfoIcon, User as UserIcon } from "lucide-react";
import { SettingsDialog } from '@/components/settings-dialog';
import { LanguageSelector } from '@/components/language-selector';

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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className="font-body antialiased min-h-screen flex flex-col bg-black text-white"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>
            {/* ✅ Global Navbar */}
            <header className="py-3 px-6 md:px-8 sticky top-0 z-50 bg-transparent backdrop-blur-none">
              <div className="container mx-auto flex items-center justify-between md:justify-start gap-8">
                {/* ✅ TypeZilla Logo */}
                <Link href="/" className="flex items-center">
                  <Image
                    src="/typezillalogo.png"
                    alt="TypeZilla Logo"
                    width={150}
                    height={40}
                    priority
                    className="object-contain drop-shadow-[0_0_10px_#00bfff]"
                  />
                </Link>

                {/* ✅ Right-side Navigation */}
                <div className="hidden md:flex items-center gap-3 ml-auto">
                  <Button asChild variant="ghost" size="icon" className="text-white hover:text-cyan-400 transition-colors">
                    <Link href="/about" aria-label="About">
                      <InfoIcon className="h-6 w-6" />
                    </Link>
                  </Button>

                  <LanguageSelector />
                  <SettingsDialog />

                  <Button
                    asChild
                    variant="outline"
                    className="text-white hover:text-cyan-400 hover:bg-transparent border-cyan-400/40"
                  >
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>

                  <a
                    href="https://github.com/MalikRehan0606"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-400 transition-colors"
                    aria-label="GitHub"
                  >
                    <GithubIcon className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </header>

            {/* ✅ Page Content */}
            <main className="flex-grow relative">{children}</main>

            {/* ✅ Toasts */}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

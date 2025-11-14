import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { LanguageProvider } from '@/contexts/language-provider';
import { VisitProvider } from '@/contexts/visit-provider';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="fixed -z-10 w-full h-full object-cover"
        >
          <source src="/bv.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative min-h-screen flex flex-col">
          <LanguageProvider>
            <AuthProvider>
              <VisitProvider>
                {children}
              </VisitProvider>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}

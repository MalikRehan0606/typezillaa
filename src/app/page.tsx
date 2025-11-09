
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { GithubIcon, ArrowRightIcon, InfoIcon, LogOutIcon, User as UserIcon, MenuIcon } from "lucide-react";
import { useAuth } from '@/components/auth-provider';
import { SettingsDialog } from '@/components/settings-dialog';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { LanguageSelector } from '@/components/language-selector';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Custom component for the RGB animated crown
const RgbCrownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-crown ml-2 h-5 w-5 animate-rgb-stroke"
  >
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
    <path d="M5 21h14"></path>
  </svg>
);


export default function HomePage() {
  const creatorGitHubUrl = "https://github.com/MalikRehan0606";
  const { user, logout, isAnonymous } = useAuth();
  const { t } = useLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Button asChild variant="ghost" className="w-full justify-start text-base" onClick={() => setIsSheetOpen(false)}>
      <Link href={href}>{children}</Link>
    </Button>
  );

  const headerContent = (
    <>
      <div className="hidden md:flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-background">
          <Link href="/about" aria-label="About the Creator">
              <InfoIcon className="h-6 w-6" />
          </Link>
        </Button>
        <LanguageSelector />
        <SettingsDialog />
        {user && !isAnonymous ? (
          <>
            <Button asChild variant="outline" className="hover:text-primary hover:bg-background">
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={logout} className="hover:text-primary hover:bg-background">
              <LogOutIcon className="mr-2 h-4 w-4" /> {t.logout}
            </Button>
          </>
        ) : (
           <Button asChild variant="outline" className="hover:text-primary hover:bg-background">
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
        )}
        <a
          href={creatorGitHubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label="View creator's profile on GitHub"
        >
          <GithubIcon className="h-6 w-6" />
        </a>
      </div>
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4">
            <div className="flex flex-col gap-4 py-6">
                <NavLink href="/about">
                  <InfoIcon className="mr-2 h-5 w-5" />
                  About
                </NavLink>
                <NavLink href="/profile">
                  <UserIcon className="mr-2 h-5 w-5" />
                  Profile
                </NavLink>
                {user && !isAnonymous && (
                    <Button variant="ghost" onClick={() => { logout(); setIsSheetOpen(false); }} className="w-full justify-start text-base text-destructive hover:text-destructive">
                      <LogOutIcon className="mr-2 h-5 w-5" /> {t.logout}
                    </Button>
                )}
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground px-4">Settings</p>
                    <div className="px-2">
                      <LanguageSelector />
                    </div>
                    <SettingsDialog />
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-2 px-6 md:px-8 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={`/sounds/logo.png/logo.png?v=${new Date().getTime()}`} alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          {headerContent}
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <section className="py-10 md:py-16">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">
            {t.homeTitle}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="p-1 rounded-lg border border-input hover:border-primary/50 transition-colors">
                <Button asChild size="lg" variant="ghost" className="text-base hover:text-primary hover:bg-transparent">
                  <Link href="/levels">
                    {t.homeChooseChallenge} <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </div>
            <div className="p-1 rounded-lg border border-input hover:border-primary/50 transition-colors">
                <Button asChild size="lg" variant="ghost" className="text-xl hover:bg-transparent hover:text-primary">
                  <Link href="/leaderboard" className="flex items-center">
                    <span className="animate-rgb-train">{t.leaderboard}</span>
                    <RgbCrownIcon />
                  </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>

      <TypingTip />
    </div>
  );
}

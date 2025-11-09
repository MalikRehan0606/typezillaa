

"use client";

import { Suspense } from 'react';
import { TypingChallenge } from "@/components/typing-challenge";
import { Button } from "@/components/ui/button";
import { GithubIcon, Loader2, LogOutIcon, User as UserIcon, MenuIcon } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { DifficultyLevel, Language } from '@/types';
import { useAuth } from '@/components/auth-provider';
import { SettingsDialog } from '@/components/settings-dialog';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { LanguageSelector } from '@/components/language-selector';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import Image from 'next/image';

function TypingTestContent() {
  const searchParams = useSearchParams();
  const levelParam = searchParams.get('level') as DifficultyLevel | null;
  const level: DifficultyLevel = levelParam && ["simple", "intermediate", "expert", "mixed", "time"].includes(levelParam) ? levelParam : "intermediate";
  
  const wordCountParam = searchParams.get('words');
  const wordCount = wordCountParam ? parseInt(wordCountParam, 10) : null;

  const timeParam = searchParams.get('time');
  const time = timeParam ? parseInt(timeParam, 10) : null;

  const langParam = searchParams.get('lang') as Language | null;
  const customText = searchParams.get('customText');
  const language: Language = langParam || 'en';
  const { t } = useLanguage();

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-xl">{t.loadingChallenge}</span></div>}>
        <TypingChallenge level={level} wordCount={wordCount} timeLimit={time} language={language} customText={customText || undefined} />
    </Suspense>
  );
}

export default function TypingTestPage() {
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
        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="outline" className="hover:text-primary hover:bg-background">
              <Link href="/levels">{t.changeLevel}</Link>
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
                        <NavLink href="/levels">{t.changeLevel}</NavLink>
                        <NavLink href="/leaderboard">{t.leaderboard}</NavLink>
                        <NavLink href="/profile">Profile</NavLink>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-2 px-6 md:px-8 border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={`/sounds/logo.png/logo.png?v=${new Date().getTime()}`} alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          {headerContent}
        </div>
      </header>

      <main className="flex-grow container mx-auto flex items-center justify-center p-2 md:p-4">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-xl">{t.loadingChallenge}...</span></div>}>
          <TypingTestContent />
        </Suspense>
      </main>

      <TypingTip />
    </div>
  );
}

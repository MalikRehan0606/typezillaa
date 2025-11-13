
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { GithubIcon, InfoIcon, LogOutIcon, User as UserIcon, MenuIcon, Users } from "lucide-react";
import { useAuth } from '@/components/auth-provider';
import { SettingsDialog } from '@/components/settings-dialog';
import { useLanguage } from '@/contexts/language-provider';
import { LanguageSelector } from '@/components/language-selector';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import Image from 'next/image';
import { FriendsSidebar } from '@/components/friends-sidebar';
import { usePathname } from 'next/navigation';

const CREATOR_GITHUB_URL = "https://github.com/MalikRehan0606";

const NavLink = ({ href, children, closeSheet }: { href: string; children: React.ReactNode, closeSheet: () => void }) => (
    <Button asChild variant="ghost" className="w-full justify-start text-base" onClick={closeSheet}>
      <Link href={href}>{children}</Link>
    </Button>
);

export function Header() {
  const { user, logout, isAnonymous } = useAuth();
  const { t } = useLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const closeSheet = () => setIsSheetOpen(false);

  const isTypingTestPage = pathname.startsWith('/typing-test');

  const desktopNav = (
    <div className="hidden md:flex items-center gap-2">
        {isTypingTestPage && (
            <Button asChild variant="outline" className="hover:text-primary hover:bg-background">
              <Link href="/levels">{t.changeLevel}</Link>
            </Button>
        )}
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-background">
            <Link href="/about" aria-label="About the Creator">
                <InfoIcon className="h-6 w-6" />
            </Link>
        </Button>
        <FriendsSidebar>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-background">
                <Users className="h-6 w-6"/>
            </Button>
        </FriendsSidebar>
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
            href={CREATOR_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="View creator's profile on GitHub"
        >
            <GithubIcon className="h-6 w-6" />
        </a>
    </div>
  );

  const mobileNav = (
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
                    {isTypingTestPage && <NavLink href="/levels" closeSheet={closeSheet}>{t.changeLevel}</NavLink>}
                    <NavLink href="/leaderboard" closeSheet={closeSheet}>{t.leaderboard}</NavLink>
                    <NavLink href="/about" closeSheet={closeSheet}>About</NavLink>
                    <NavLink href="/profile" closeSheet={closeSheet}>Profile</NavLink>
                    {user && !isAnonymous && (
                        <Button variant="ghost" onClick={() => { logout(); closeSheet(); }} className="w-full justify-start text-base text-destructive hover:text-destructive">
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
  );

  return (
    <header className="fixed top-0 z-50 w-full py-2 px-6 md:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/typezillalogo.png" alt="TypeZilla Logo" width={140} height={32} unoptimized />
        </Link>
        <div className="flex items-center gap-2">
            {desktopNav}
            {mobileNav}
        </div>
    </header>
  );
}

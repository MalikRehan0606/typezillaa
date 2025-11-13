"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useLanguage } from '@/contexts/language-provider';
import { Header } from '@/components/header';
import { TypingTip } from '@/components/typing-tip';

// RGB crown icon
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
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />

      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <section className="py-10 md:py-16">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">
            Train Like a Pro. Type Like a Legend.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your Fastest Finger Awaits. Prove Yourself.
          </p>
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

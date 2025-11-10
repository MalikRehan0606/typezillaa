"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from '@/components/auth-provider';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { useState } from 'react';

// RGB animated crown icon
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
  const { user, isAnonymous } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="relative flex flex-col min-h-screen text-foreground overflow-hidden">
      {/* 🌌 Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10 brightness-75"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* 🌠 Main Section */}
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center text-center text-white z-10">
        <section className="py-10 md:py-16">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 drop-shadow-[0_0_10px_#00bfff]">
            {t.homeTitle}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="p-1 rounded-lg border border-input hover:border-primary/50 transition-colors">
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-base hover:text-primary hover:bg-transparent"
              >
                <Link href="/levels">
                  {t.homeChooseChallenge} <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="p-1 rounded-lg border border-input hover:border-primary/50 transition-colors">
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-xl hover:bg-transparent hover:text-primary"
              >
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

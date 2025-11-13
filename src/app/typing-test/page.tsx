
"use client";

import { Suspense } from 'react';
import { TypingChallenge } from "@/components/typing-challenge";
import { Loader2 } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import type { DifficultyLevel, Language } from '@/types';
import { useLanguage } from '@/contexts/language-provider';
import { Header } from '@/components/header';
import { TypingTip } from '@/components/typing-tip';

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
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-grow container mx-auto flex items-center justify-center p-2 md:p-4">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <span className="ml-4 text-xl">{t.loadingChallenge}...</span></div>}>
          <TypingTestContent />
        </Suspense>
      </main>

      <TypingTip />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { typingTips } from '@/lib/typing-tips';
import { useLanguage } from '@/contexts/language-provider';

export function TypingTip() {
  const [tip, setTip] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    // Select a random tip on component mount (client-side) to ensure it changes on each visit
    const randomIndex = Math.floor(Math.random() * typingTips.length);
    setTip(typingTips[randomIndex]);
  }, []);

  if (!tip) {
    // Render a placeholder with a fixed height to prevent layout shift on load
    return (
      <footer className="py-4 px-6 md:px-8 border-t border-border text-center text-sm text-muted-foreground h-[57px] flex items-center justify-center">
        &nbsp;
      </footer>
    );
  }

  return (
    <footer className="py-4 px-6 md:px-8 border-t border-border text-center">
        <div className="container mx-auto flex items-start justify-center text-sm text-muted-foreground">
            <strong className="shrink-0 mr-1">{t.proTip}:</strong><span className="text-left">{tip}</span>
        </div>
    </footer>
  );
}

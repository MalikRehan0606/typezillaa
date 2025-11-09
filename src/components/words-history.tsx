
"use client";

import React from "react";
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface WordsHistoryProps {
  textToType: string;
  userInput: string;
  correctCharColor: string;
  wordsWithErrors: Set<number>;
}

export const WordsHistory: React.FC<WordsHistoryProps> = ({
  textToType,
  userInput,
  correctCharColor,
  wordsWithErrors,
}) => {

  const renderWordHistory = () => {
    const originalChars = textToType.split('');
    const typedChars = userInput.split('');
    const maxLength = Math.max(originalChars.length, typedChars.length);
    const historySpans: React.ReactNode[] = [];

    for (let i = 0; i < maxLength; i++) {
        const originalChar = originalChars[i];
        const typedChar = typedChars[i];

        if (originalChar !== undefined && typedChar !== undefined) {
            // Character exists in both original and typed text
            if (originalChar === typedChar) {
                historySpans.push(
                    <span key={`char-correct-${i}`} className={correctCharColor}>
                        {originalChar}
                    </span>
                );
            } else {
                 historySpans.push(
                    <span key={`char-incorrect-${i}`} className="text-destructive bg-destructive/20 rounded-sm">
                        {originalChar}
                    </span>
                );
            }
        } else if (originalChar !== undefined) {
            // Character was missed by the user
            historySpans.push(
                <span key={`char-missed-${i}`} className="text-muted-foreground underline decoration-wavy decoration-muted-foreground">
                    {originalChar}
                </span>
            );
        } else {
            // User typed an extra character
            historySpans.push(
                <span key={`char-extra-${i}`} className="text-destructive bg-destructive/20 rounded-sm underline decoration-wavy">
                    {typedChar}
                </span>
            );
        }
    }
    return historySpans;
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Words History</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="p-4 md:p-6 bg-card rounded-lg shadow-inner w-full leading-relaxed select-none relative"
          aria-label="Words History"
        >
          <p className="whitespace-pre-wrap break-words text-2xl md:text-3xl font-mono">
            {renderWordHistory()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

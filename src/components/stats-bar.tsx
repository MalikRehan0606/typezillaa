
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TimerIcon, ZapIcon } from "lucide-react";
import type { TestStatus } from "@/types";
import { translations } from "@/lib/translations";

interface StatsBarProps {
  timerValue: number;
  wpm: number;
  accuracy: number; // Keep prop for other potential uses, but won't be displayed live
  status: TestStatus;
  t: typeof translations.en;
  mode: 'stopwatch' | 'countdown';
}

export const StatsBar: React.FC<StatsBarProps> = ({
  timerValue,
  wpm,
  accuracy,
  status,
  t,
  mode,
}) => {
  const formatTime = (seconds: number) => {
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const showStats = status !== 'pending';

  return (
    <Card className="w-full max-w-3xl mt-4 shadow-sm">
      <CardContent className="p-4 flex justify-around items-center">
        <div className="flex flex-col items-center text-center w-1/2">
          <div className="flex items-center text-lg font-semibold text-muted-foreground">
            <TimerIcon className="mr-2 h-5 w-5 text-primary" />
            <span>{mode === 'countdown' ? t.timeLeft : t.time}</span>
          </div>
          <span className="text-2xl font-bold">{formatTime(timerValue)}</span>
        </div>
        <div className="flex flex-col items-center text-center w-1/2">
          <div className="flex items-center text-lg font-semibold text-muted-foreground">
            <ZapIcon className="mr-2 h-5 w-5 text-primary" />
            <span>{t.wpm.toUpperCase()}</span>
          </div>
          <span className="text-2xl font-bold">{showStats ? wpm : "--"}</span>
        </div>
      </CardContent>
    </Card>
  );
};

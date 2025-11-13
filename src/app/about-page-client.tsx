
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GithubIcon, ArrowLeftIcon, Loader2, LogOutIcon, User as UserIcon } from "lucide-react";
import { useState, useEffect } from 'react';
import type { GlobalStats, LeaderboardEntry } from '@/types';
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, doc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/auth-provider';
import { SettingsDialog } from './settings-dialog';
import { TypingTip } from './typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { LanguageSelector } from './language-selector';
import Image from 'next/image';

const AboutChart = dynamic(() => import('@/components/about-chart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full max-w-6xl items-center justify-center rounded-lg bg-card border border-border shadow-xl">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function AboutPageClient() {
  const { toast } = useToast();
  const { user, logout, isAnonymous } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<GlobalStats>({
    totalTestStarted: 0,
    totalTestsCompleted: 0,
    totalTypingTimeInSeconds: 0,
  });
  const [wpmDistribution, setWpmDistribution] = useState<{name: string, users: number}[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const processWpmDataForChart = (testResults: LeaderboardEntry[]) => {
    if (testResults.length === 0) return [];
  
    const bins: { [key: string]: { name: string; users: number } } = {};
    const binSize = 10;
  
    // Dynamically determine the max WPM from the data, with a minimum of 100
    const maxWpmInData = Math.max(...testResults.map(entry => entry.wpm), 99);
    const maxWpm = Math.ceil((maxWpmInData + 1) / binSize) * binSize -1;
  
    // Initialize bins up to the calculated max
    for (let i = 0; i <= Math.floor(maxWpm / binSize); i++) {
      const lowerBound = i * binSize;
      const upperBound = lowerBound + binSize - 1;
      const binName = `${lowerBound}-${upperBound}`;
      bins[binName] = { name: binName, users: 0 };
    }
  
    testResults.forEach(entry => {
      const binIndex = Math.floor(entry.wpm / binSize);
      const lowerBound = binIndex * binSize;
      const upperBound = lowerBound + binSize - 1;
      
      let binName = `${lowerBound}-${upperBound}`;

      // If a score is higher than the generated bins, create a new "150+" style bin
      if (!bins[binName]) {
          const plusBinName = `${lowerBound}+`;
          if (!bins[plusBinName]) {
              bins[plusBinName] = { name: plusBinName, users: 0 };
          }
          binName = plusBinName;
      }
      
      bins[binName].users += 1;
    });
  
    return Object.values(bins);
  };


  useEffect(() => {
    setIsClient(true);
    if (!db) return;

    // WPM Distribution listener
    setChartError(null);
    const q = query(collection(db, "leaderboard"), orderBy("wpm", "desc"), limit(1000));
    const unsubscribeLeaderboard = onSnapshot(q, (querySnapshot) => {
      let leaderboardData: LeaderboardEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaderboardEntry));

      if (leaderboardData.length > 0) {
        setWpmDistribution(processWpmDataForChart(leaderboardData));
      }
    }, (error) => {
      console.error("Could not load WPM distribution data from Firestore:", error);
      let description = "Could not load global WPM data. Please check your connection or the browser console for details.";
      if (error.code === 'unavailable' || !navigator.onLine) {
          description = "You appear to be offline. Chart data cannot be loaded.";
      }
      setWpmDistribution([]);
      setChartError(description);
      toast({
        title: "Chart Error",
        description: description,
        variant: "destructive",
      });
    });

    // Global Stats listener
    const statsDocRef = doc(db, "globalStats", "main");
    const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setStats(docSnap.data() as GlobalStats);
        }
    }, (error) => {
        console.error("Could not load global stats from Firestore:", error);
        let description = "Could not load global statistics.";
        if (error.code === 'unavailable' || !navigator.onLine) {
            description = "You appear to be offline. Global stats cannot be loaded.";
        }
        toast({
          title: "Stats Error",
          description: description,
          variant: "destructive",
        });
    });

    return () => {
        unsubscribeLeaderboard();
        unsubscribeStats();
    };
  }, [toast]);

  const formatLargeNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
        return new Intl.NumberFormat().format(num);
    }
    return num.toString();
  };
  
  const formatTypingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground font-mono">
      <header className="py-2 px-6 md:px-8 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/typezillalogo.png" alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          <div className="flex items-center gap-4">
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
              href={"https://github.com/MalikRehan0606"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="View creator's profile on GitHub"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center mb-8 w-fit mx-auto">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {t.backToHome}
          </Link>
          
          <div className="mb-12 text-sm text-muted-foreground">
            <p>{t.aboutCreatedBy}</p>
            <p>{t.aboutLaunchedOn}</p>
          </div>

          <AboutChart data={wpmDistribution} error={chartError} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 w-full">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.aboutTotalTestsStarted}</CardTitle>
                    <CardDescription className="text-muted-foreground">{t.aboutTotalTestsStartedDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{isClient ? formatLargeNumber(stats.totalTestStarted) : '0'}</p>
                </CardContent>
            </Card>
             <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.aboutTotalTestsCompleted}</CardTitle>
                    <CardDescription className="text-muted-foreground">{t.aboutTotalTestsCompletedDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{isClient ? formatLargeNumber(stats.totalTestsCompleted) : '0'}</p>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.aboutTotalTimeTyping}</CardTitle>
                    <CardDescription className="text-muted-foreground">{t.aboutTotalTimeTypingDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">{isClient ? formatTypingTime(stats.totalTypingTimeInSeconds) : '00:00:00'}</p>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <TypingTip />
    </div>
  );
}


"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, Loader2, Trophy, Globe, CalendarDays, Sun, Hourglass, RocketIcon } from "lucide-react";
import type { LeaderboardEntry, UserProfileData } from '@/types';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit, where } from "firebase/firestore";
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { AchievementBadge } from '@/components/achievement-badge';
import { usePioneerUsers } from '@/hooks/use-pioneer-users';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { VoidminBadge } from '@/components/voidmin-badge';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Header } from '@/components/header';
import { CREATOR_USER_ID } from '@/lib/config';

type EnrichedLeaderboardEntry = LeaderboardEntry & Partial<Pick<UserProfileData, 'unlockedAchievements'>>;

const LeaderboardTable: React.FC<{ data: EnrichedLeaderboardEntry[], t: any, isTimeMode?: boolean }> = ({ data, t, isTimeMode = false }) => {
  const pioneerUserIds = usePioneerUsers();
  
  const EXCLUDED_BADGE_IDS = new Set([
    'speed_demon_1',
    'accuracy_1',
    'accuracy_2',
    'consistency_1',
    'consistency_2',
    'flawless_simple',
  ]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (data.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">{t.noScores}</div>;
  }
  
  const getBadgesForUser = (entry: EnrichedLeaderboardEntry) => {
    const badges: React.ReactNode[] = [];
    const unlockedIds = new Set(entry.unlockedAchievements || []);

    if (entry.userId === CREATOR_USER_ID) {
      badges.push(
        <Tooltip key="creator">
          <TooltipTrigger asChild><div className="ml-2"><VoidminBadge /></div></TooltipTrigger>
          <TooltipContent><p>Creator of TypeZilla.</p></TooltipContent>
        </Tooltip>
      );
    }
    
    if (entry.userId && pioneerUserIds.includes(entry.userId)) {
        badges.push(
            <Tooltip key="pioneer">
                <TooltipTrigger asChild><div className="ml-2"><AchievementBadge icon={<RocketIcon size={10} />} text="Pioneer" className="pioneer-badge-animated" animated={true} /></div></TooltipTrigger>
                <TooltipContent><p>First 10 users to register on TypeZilla</p></TooltipContent>
            </Tooltip>
        );
    }
    
    // Add dynamically checked achievements, filtering out the excluded ones
    ALL_ACHIEVEMENTS.forEach(ach => {
      if (unlockedIds.has(ach.id) && !EXCLUDED_BADGE_IDS.has(ach.id)) {
        badges.push(
            <Tooltip key={ach.id}>
                <TooltipTrigger asChild><div className="ml-2"><AchievementBadge icon={<ach.icon size={10}/>} text={ach.name} gradient="linear-gradient(135deg, #4F4F4F, #2C2C2C)"/></div></TooltipTrigger>
                <TooltipContent><p>{ach.description}</p></TooltipContent>
            </Tooltip>
        );
      }
    });

    return badges;
  };


  return (
    <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-0">
              <TableHead className="w-[80px] text-center">{t.rank}</TableHead>
              <TableHead>{t.name}</TableHead>
              <TableHead className="text-center">{t.wpm.toUpperCase()}</TableHead>
              <TableHead className="text-center">{t.accuracy}</TableHead>
              {isTimeMode && <TableHead className="text-center">Mode</TableHead>}
              <TableHead className="text-center">{t.language}</TableHead>
              <TableHead className="text-center">{t.date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/20 border-t border-border">
                <TableCell className="font-medium text-center">
                  <div className="flex h-8 w-full items-center justify-center">
                    {entry.rank === 1 ? (
                         <Trophy className="h-5 w-5 text-glow-gold" />
                    ) : (
                        <span
                        className={cn(
                            "text-xl font-bold",
                            entry.rank === 2 && "text-glow-silver",
                            entry.rank === 3 && "text-glow-bronze"
                        )}
                        >
                        {entry.rank}
                        </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-base">
                  <div className="flex items-center flex-wrap">
                  {entry.userId ? (
                    <Link href={`/profile/${entry.userId}`} className="hover:underline hover:text-primary transition-colors">
                        {entry.name}
                    </Link>
                  ) : (
                    entry.name
                  )}
                  {getBadgesForUser(entry)}
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">{entry.wpm}</TableCell>
                <TableCell className="text-center">{entry.accuracy}%</TableCell>
                {isTimeMode && <TableCell className="text-center">{entry.time}s</TableCell>}
                <TableCell className="text-center uppercase font-mono text-xs">{entry.language || 'EN'}</TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">{formatDate(entry.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<{ [key in DifficultyLevel | 'time']: EnrichedLeaderboardEntry[] }>({
    simple: [],
    intermediate: [],
    expert: [],
    mixed: [],
    time: [],
  });
  const [timeframe, setTimeframe] = useState<'all-time' | 'weekly' | 'daily'>('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, language: currentLang } = useLanguage();
  
  const [dateRange, setDateRange] = useState('');
  const [countdown, setCountdown] = useState('');
  
  const processAndRankScores = (entries: EnrichedLeaderboardEntry[], selectedTimeframe: 'all-time' | 'weekly' | 'daily'): EnrichedLeaderboardEntry[] => {
    const bestScoresByUser = new Map<string, EnrichedLeaderboardEntry>();

    for (const entry of entries) {
      if (!entry.userId) continue;

      const now = Date.now();
      if (selectedTimeframe !== 'all-time') {
          const startTime = (selectedTimeframe === 'daily')
              ? now - 24 * 60 * 60 * 1000
              : now - 7 * 24 * 60 * 60 * 1000;
          if (entry.timestamp < startTime) {
              continue; // Skip scores outside the timeframe
          }
      }

      const existing = bestScoresByUser.get(entry.userId);
      if (!existing || entry.wpm > existing.wpm || (entry.wpm === existing.wpm && entry.accuracy > existing.accuracy)) {
        bestScoresByUser.set(entry.userId, entry);
      }
    }

    const sorted = Array.from(bestScoresByUser.values()).sort((a, b) => {
      if (a.wpm !== b.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    
    return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
  };
  
  const processAndRankTimedScores = (entries: EnrichedLeaderboardEntry[], selectedTimeframe: 'all-time' | 'weekly' | 'daily'): EnrichedLeaderboardEntry[] => {
     const bestScoresByUser = new Map<string, EnrichedLeaderboardEntry>();

    for (const entry of entries) {
      if (!entry.userId || !entry.time) continue;

      const now = Date.now();
      if (selectedTimeframe !== 'all-time') {
          const startTime = (selectedTimeframe === 'daily')
              ? now - 24 * 60 * 60 * 1000
              : now - 7 * 24 * 60 * 60 * 1000;
          if (entry.timestamp < startTime) {
              continue; // Skip scores outside the timeframe
          }
      }
      
      const key = `${entry.userId}-${entry.time}`; // Best score for each user *for each time mode*
      const existing = bestScoresByUser.get(key);
      if (!existing || entry.wpm > existing.wpm || (entry.wpm === existing.wpm && entry.accuracy > existing.accuracy)) {
        bestScoresByUser.set(key, entry);
      }
    }

    const finalBestScores = new Map<string, EnrichedLeaderboardEntry>();
    for(const entry of Array.from(bestScoresByUser.values())) {
        if(!entry.userId) continue;
        const existing = finalBestScores.get(entry.userId);
        if (!existing || entry.wpm > existing.wpm || (entry.wpm === existing.wpm && entry.accuracy > existing.accuracy)) {
            finalBestScores.set(entry.userId, entry);
        }
    }

    const sorted = Array.from(finalBestScores.values()).sort((a, b) => {
      if (a.wpm !== b.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    
    return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }


  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        if (!db) {
          setError("Database connection not available.");
          setIsLoading(false);
          return;
        }

        const q = query(
            collection(db, "leaderboard"),
            orderBy("wpm", "desc"),
            limit(500)
        );

        const querySnapshot = await getDocs(q);
        let allScores = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaderboardEntry)).filter(s => s.userId);

        const userIds = [...new Set(allScores.map(s => s.userId).filter(id => id))];
        const userProfiles: Record<string, UserProfileData> = {};

        if (userIds.length > 0) {
            const usersQuery = query(collection(db, 'users'), where('__name__', 'in', userIds));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
                userProfiles[doc.id] = doc.data() as UserProfileData;
            });
        }
        
        const enrichedScores: EnrichedLeaderboardEntry[] = allScores.map(score => ({
            ...score,
            unlockedAchievements: score.userId ? userProfiles[score.userId]?.unlockedAchievements : [],
        }));


        const scoresByLevel = {
            simple: enrichedScores.filter(s => s.level === 'simple'),
            intermediate: enrichedScores.filter(s => s.level === 'intermediate'),
            expert: enrichedScores.filter(s => s.level === 'expert'),
            time: enrichedScores.filter(s => s.time && [15, 30, 60].includes(s.time)),
            mixed: enrichedScores.filter(s => s.level === 'mixed'),
        };

        const newLeaderboardData = {
            simple: processAndRankScores(scoresByLevel.simple, timeframe).slice(0, 100),
            intermediate: processAndRankScores(scoresByLevel.intermediate, timeframe).slice(0, 100),
            expert: processAndRankScores(scoresByLevel.expert, timeframe).slice(0, 100),
            time: processAndRankTimedScores(scoresByLevel.time, timeframe).slice(0, 100),
            mixed: processAndRankScores(scoresByLevel.mixed, timeframe).slice(0, 100),
        };
        
        setLeaderboardData(newLeaderboardData);

    } catch (err: any) {
        console.error("Failed to load leaderboard from Firestore:", err);
        let description = "Could not retrieve scores. Please check your internet connection and try again.";
        if (err.code === 'unavailable' || !navigator.onLine) {
            description = "You appear to be offline. Please check your network connection.";
        }
        setError(description);
        toast({ title: "Error Loading Leaderboard", description, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [timeframe, toast]);


  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Effect for countdown timer and date range
  useEffect(() => {
    const formatWithSuffix = (date: Date) => {
      const day = date.getDate();
      let suffix = 'th';
      if (day === 1 || day === 21 || day === 31) suffix = 'st';
      else if (day === 2 || day === 22) suffix = 'nd';
      else if (day === 3 || day === 23) suffix = 'rd';
      
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Intl.DateTimeFormat(currentLang, options).format(date);
      // Replace the day number with the number + suffix
      return formattedDate.replace(String(day), `${day}${suffix}`);
    };

    const updateTimers = () => {
      const now = new Date();
      if (timeframe === 'weekly') {
        const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() - dayOfWeek + 7);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(endOfWeek.getDate() - 6);
        startOfWeek.setHours(0,0,0,0);

        setDateRange(`${formatWithSuffix(startOfWeek)} - ${formatWithSuffix(endOfWeek)} UTC`);

        const diff = endOfWeek.getTime() - now.getTime();
        setCountdown(formatCountdown(diff));

      } else if (timeframe === 'daily') {
        setDateRange(`${formatWithSuffix(now)} UTC`);
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const diff = endOfDay.getTime() - now.getTime();
        setCountdown(formatCountdown(diff));
      } else {
        setDateRange('');
        setCountdown('');
      }
    };
    
    updateTimers(); // Initial call
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [timeframe, currentLang]);

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const timeframeOptions = [
    { id: 'all-time', label: t.leaderboardAllTime, icon: Globe },
    { id: 'weekly', label: t.leaderboardWeekly, icon: CalendarDays },
    { id: 'daily', label: t.leaderboardDaily, icon: Sun },
  ];
  
  const getLeaderboardTitle = () => {
      switch(timeframe) {
          case 'daily': return t.leaderboardDailyTitle;
          case 'weekly': return t.leaderboardWeeklyTitle;
          default: return t.leaderboardAllTimeTitle;
      }
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />

      <main className="flex-grow container mx-auto flex flex-col items-center p-4 md:p-8 mt-20">
        <section className="py-12 md:py-16 w-full max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {t.backToHome}
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4 lg:w-1/5">
                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                    {timeframeOptions.map((option) => (
                        <Button
                            key={option.id}
                            variant={timeframe === option.id ? 'default' : 'ghost'}
                            onClick={() => setTimeframe(option.id as any)}
                            className="justify-start gap-3 px-4 flex-shrink-0"
                        >
                            <option.icon className="h-5 w-5" />
                            <span className={cn(timeframe === option.id ? "animate-rgb-train" : "")}>{option.label}</span>
                        </Button>
                    ))}
                </nav>
            </aside>
            <div className="flex-1">
              <TooltipProvider>
                <Card className="shadow-xl bg-card">
                    <CardHeader className="items-center text-center border-b pb-4">
                        <h2 className="text-3xl font-headline tracking-wider uppercase animate-rgb-train">{getLeaderboardTitle()}</h2>
                        <CardDescription className="text-muted-foreground">
                           {timeframe === 'all-time' ? t.leaderboardTop100AllTime : dateRange}
                        </CardDescription>
                        {timeframe !== 'all-time' && (
                            <>
                                <hr className="w-full border-border my-2" />
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    {t.nextResetIn}: <span className="font-mono font-semibold text-foreground">{countdown}</span>
                                </p>
                            </>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin"/> {t.loading}...
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-destructive">{error}</div>
                    ) : (
                        <Tabs defaultValue="simple" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none border-b">
                            <TabsTrigger value="simple">{t.levelSimple}</TabsTrigger>
                            <TabsTrigger value="intermediate">{t.levelIntermediate}</TabsTrigger>
                            <TabsTrigger value="expert">{t.levelExpert}</TabsTrigger>
                            <TabsTrigger value="time">Time</TabsTrigger>
                        </TabsList>
                        <TabsContent value="simple">
                            <LeaderboardTable data={leaderboardData.simple} t={t} />
                        </TabsContent>
                        <TabsContent value="intermediate">
                            <LeaderboardTable data={leaderboardData.intermediate} t={t} />
                        </TabsContent>
                        <TabsContent value="expert">
                            <LeaderboardTable data={leaderboardData.expert} t={t} />
                        </TabsContent>
                        <TabsContent value="time">
                            <LeaderboardTable data={leaderboardData.time} t={t} isTimeMode={true} />
                        </TabsContent>
                        </Tabs>
                    )}
                    </CardContent>
                </Card>
              </TooltipProvider>
            </div>
          </div>
        </section>
      </main>

      <TypingTip />
    </div>
  );
}

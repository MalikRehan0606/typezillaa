
"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserIcon, TrophyIcon, LogInIcon, UserPlusIcon, StarIcon, FlameIcon } from "lucide-react";
import { useState, useEffect } from 'react';
import type { TestHistoryEntry, Achievement, UserProfileData } from '@/types';
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ProfileChart = dynamic(() => import('@/components/profile-chart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full max-w-6xl items-center justify-center rounded-lg bg-card border border-border shadow-xl">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

const StatCard: React.FC<{ title: string; value: string | number, icon?: React.ReactNode, children?: React.ReactNode, valueClassName?: string }> = ({ title, value, icon, children, valueClassName }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
                <span>{title}</span>
                {icon}
            </CardDescription>
            <CardTitle className={cn("text-4xl", valueClassName)}>{value}</CardTitle>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
    </Card>
);

const PersonalBestCard: React.FC<{ title: string, pbs: { [key: string]: {wpm: number, accuracy: number} | undefined } }> = ({ title, pbs }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
            {Object.entries(pbs).map(([key, value]) => (
                <div key={key}>
                    <p className="text-sm text-muted-foreground">{key}</p>
                    {value ? (
                        <>
                            <p className="text-2xl font-bold text-primary">{value.wpm}</p>
                            <p className="text-sm text-muted-foreground">{value.accuracy}%</p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-primary">-</p>
                            <p className="text-sm text-muted-foreground">-</p>
                        </>
                    )}
                </div>
            ))}
        </CardContent>
    </Card>
);


export function ProfilePageClient() {
  const { toast } = useToast();
  const { user, loading, isAnonymous } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);


  useEffect(() => {
      if (loading) return;
      
      if (!user || isAnonymous) {
        setIsLoading(false);
        // Guests see no achievements.
        setAchievements([]);
        return;
      }
      
      if (!db) {
          setError("Database connection not available.");
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      setError(null);

      // Fetch user profile data
      const userDocRef = doc(db, `users/${user.uid}`);
      const unsubscribeProfile = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = { uid: docSnap.id, ...docSnap.data() } as UserProfileData;
             // Ensure photoURL is synced from auth object if not in firestore
            if (user.photoURL && data.photoURL !== user.photoURL) {
                data.photoURL = user.photoURL;
            }
            setProfileData(data);
            
            // Map unlocked achievement IDs to full achievement objects
            const unlockedIds = new Set(data.unlockedAchievements || []);
            const allAchievements = ALL_ACHIEVEMENTS.map(ach => ({
                ...ach,
                unlocked: unlockedIds.has(ach.id)
            }));
            setAchievements(allAchievements);

        } else {
            setError("Could not find your profile data. It might be being created.");
        }
        setIsLoading(false);
      }, (err) => {
          if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
          }
          console.error("Failed to load profile data from Firestore:", err);
          setIsLoading(false);
      });
      
      const testHistoryCollectionRef = collection(db, `users/${user.uid}/testHistory`);
      const q = query(
        testHistoryCollectionRef, 
        orderBy("timestamp", "desc"), 
        limit(100)
      );

      const unsubscribeHistory = onSnapshot(q, (querySnapshot) => {
        const data: TestHistoryEntry[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toMillis ? doc.data().timestamp.toMillis() : doc.data().timestamp,
        } as TestHistoryEntry));
        
        setHistory(data);
        setIsLoading(false);

      }, (err) => {
        if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: testHistoryCollectionRef.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        console.error("Failed to load test history from Firestore:", err);
        let description = "Could not retrieve your test history. Please try again.";
        if (err.code === 'unavailable' || !navigator.onLine) {
            description = "You appear to be offline. Please check your network connection.";
        }
        setError(description);
        toast({ title: "Error Loading History", description, variant: "destructive" });
        setIsLoading(false);
      });

      return () => {
          unsubscribeProfile();
          unsubscribeHistory();
      }
  }, [user, loading, isAnonymous, toast]);

  if (loading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }
  
  const formatJoinDate = (timestamp: any) => {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return `Joined ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  
  const unlockedAchievements = achievements.filter(ach => ach.unlocked);

  return (
    <main className="flex-grow container mx-auto flex flex-col items-center p-4 md:p-8 mt-20">
      <div className="w-full max-w-6xl">
          {isAnonymous ? (
            <Card className="text-center py-12 px-6">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Track Your Progress</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Create a free account to save your test history, see your performance improve over time, and compete on the global leaderboards.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="outline" className="hover:bg-background hover:text-primary">
                    <Link href="/login">
                        <LogInIcon className="mr-2 h-5 w-5"/>
                        Login
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="hover:bg-background hover:text-primary">
                     <Link href="/signup">
                        <UserPlusIcon className="mr-2 h-5 w-5"/>
                        Sign Up
                    </Link>
                  </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
              <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          ) : (
              <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="charts">Charts</TabsTrigger>
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                          <div className="md:col-span-1 flex flex-col gap-4">
                              <Card className="p-4">
                                  <div className="flex items-center gap-4">
                                      <Avatar className="h-20 w-20">
                                          <AvatarImage src={profileData?.photoURL} alt={profileData?.name} />
                                          <AvatarFallback>
                                              <UserIcon className="h-10 w-10 text-primary" />
                                          </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold">{profileData?.name}</h2>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatJoinDate(profileData?.createdAt)}</p>
                                      </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-4">This will be your public display name and cannot be changed.</p>
                              </Card>
                          </div>
                           <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <StatCard title="current streak" value={profileData?.currentStreak || 0} valueClassName="text-orange-400" icon={<FlameIcon className="h-4 w-4 text-muted-foreground" />} />
                              <StatCard title="longest streak" value={profileData?.longestStreak || 0} icon={<TrophyIcon className="h-4 w-4 text-muted-foreground" />} />
                              <StatCard title="tests started" value={profileData?.testsStarted || 0}/>
                              <StatCard title="tests completed" value={profileData?.testsCompleted || 0}/>
                          </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 mt-8">
                          <PersonalBestCard 
                              title="Personal Bests (Words)"
                              pbs={{
                                  "15 words": profileData?.personalBests?.words?.[15],
                                  "30 words": profileData?.personalBests?.words?.[30],
                                  "45 words": profileData?.personalBests?.words?.[45],
                              }}
                          />
                          <PersonalBestCard 
                              title="Personal Bests (Time)"
                              pbs={{
                                  "15 sec": profileData?.personalBests?.time?.[15],
                                  "30 sec": profileData?.personalBests?.time?.[30],
                                  "60 sec": profileData?.personalBests?.time?.[60],
                              }}
                          />
                      </div>
                      
                  </TabsContent>
                  <TabsContent value="charts">
                      <ProfileChart data={history} />
                  </TabsContent>
                  <TabsContent value="achievements">
                      <Card>
                          <CardHeader>
                              <CardTitle>Achievements</CardTitle>
                              <CardDescription>Badges you've earned through your typing journey.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {unlockedAchievements.length > 0 ? (
                                  unlockedAchievements.map((ach) => (
                                      <div key={ach.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card border-primary/30">
                                          <ach.icon className="h-8 w-8 mt-1 text-primary" />
                                          <div>
                                              <h4 className="font-semibold text-foreground">{ach.name}</h4>
                                              <p className="text-sm text-muted-foreground">{ach.description}</p>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="col-span-full text-center text-muted-foreground py-10">
                                      <p>You haven't unlocked any achievements yet. Keep practicing!</p>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>
          )}
      </div>
    </main>
  );
}

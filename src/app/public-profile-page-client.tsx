
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2, User as UserIcon, AlertTriangleIcon, FlagIcon, BarChart, FlameIcon, Swords, UserPlus } from "lucide-react";
import { useState, useEffect } from 'react';
import type { UserProfileData } from '@/types';
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { TypingTip } from '@/components/typing-tip';

const StatCard: React.FC<{ title: string; value: string | number, icon?: React.ReactNode, valueClassName?: string }> = ({ title, value, icon, valueClassName }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
                <span>{title}</span>
                {icon}
            </CardDescription>
            <CardTitle className={cn("text-4xl", valueClassName)}>{value}</CardTitle>
        </CardHeader>
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

const REPORTED_USERS_KEY_PREFIX = 'reportedUser_';

export function PublicProfilePageClient({ userId }: { userId: string }) {
  const { user: currentUser, isAnonymous } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'friends' | 'pending' | 'not_friends' | 'self'>('not_friends');
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);

  useEffect(() => {
    if (!userId || !db) {
      setError("Invalid user ID or database connection.");
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    
    const profileDocRef = doc(db, 'users', userId);
    getDoc(profileDocRef).then(docSnap => {
        if (!docSnap.exists()) {
            setError("This user profile does not exist.");
            setProfile(null);
        } else {
            const data = {uid: docSnap.id, ...docSnap.data()} as UserProfileData
            setProfile(data);
            if (currentUser) {
              if (currentUser.uid === userId) {
                setFriendStatus('self');
              } else if (data.friends?.includes(currentUser.uid)) {
                setFriendStatus('friends');
              }
            }
        }
    }).catch(err => {
        console.error("Error fetching profile:", err);
         if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: profileDocRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
         } else {
            setError("Could not retrieve this user's profile information.");
         }
    }).finally(() => {
        setIsLoading(false);
    });

  }, [userId, currentUser]);

  useEffect(() => {
    try {
        const reportedKey = `${REPORTED_USERS_KEY_PREFIX}${userId}`;
        const reportedStatus = localStorage.getItem(reportedKey);
        if (reportedStatus === 'true') {
            setHasReported(true);
        }
    } catch (e) {
        console.error("Failed to check reported status from localStorage", e);
    }
  }, [userId]);

  if (isLoading) {
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

  const formatTypingTime = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const handleAddFriend = async () => {
    if (!currentUser || isAnonymous || !profile) return;
    setIsFriendActionLoading(true);
    try {
      const requestData = {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || 'A user',
        toUserId: profile.uid,
        toUserName: profile.name,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'friendRequests'), requestData);
      toast({
        title: "Friend Request Sent!",
        description: `Your request to ${profile.name} has been sent.`,
      });
      setFriendStatus('pending');
    } catch (err: any) {
      if (err.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: 'friendRequests',
          operation: 'create',
          requestResourceData: { to: profile.uid },
        });
        errorEmitter.emit('permission-error', permissionError);
      }
      toast({
        title: "Error",
        description: "Could not send friend request. Please try again.",
        variant: 'destructive'
      });
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (hasReported || !currentUser || !db || isAnonymous) return;
    
    try {
        const reportData = {
            reportedUserId: userId,
            reporterId: currentUser.uid,
            timestamp: serverTimestamp(),
        };

        await addDoc(collection(db, "reports"), reportData);
        
        toast({
          title: "User Reported",
          description: "Thank you. We will review this user's activity.",
        });

        const reportedKey = `${REPORTED_USERS_KEY_PREFIX}${userId}`;
        localStorage.setItem(reportedKey, 'true');
        setHasReported(true);

    } catch (error: any) {
         if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'reports',
                operation: 'create',
                requestResourceData: { reportedUserId: userId, reporterId: currentUser.uid },
            });
            errorEmitter.emit('permission-error', permissionError);
         } else {
            console.error("Failed to submit report:", error);
            toast({
                title: "Report Failed",
                description: "Could not submit your report. Please try again.",
                variant: "destructive"
            });
         }
    }
  };

  const handleChallenge = () => {
      if (!currentUser || isAnonymous) {
          toast({
              title: "Login Required",
              description: "Please log in to challenge other players.",
              variant: "destructive"
          });
          return;
      }
      if (currentUser.uid === userId) {
          toast({
              title: "Cannot Challenge Yourself",
              description: "You cannot start a match with yourself.",
              variant: "destructive"
          });
          return;
      }
      router.push(`/match/${userId}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono">
      <Header />
      
      <main className="flex-grow container mx-auto flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
            {!profile || error ? (
                <Card className="text-center py-12 px-6">
                    <CardHeader>
                    <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="text-2xl font-headline mt-4">Profile Not Found</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        {error || "Could not retrieve this user's profile information."}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href="/leaderboard">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Leaderboard
                            </Link>
                        </Button>
                    </CardContent>
              </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                        <div className="md:col-span-1 flex flex-col gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={profile?.photoURL} alt={profile?.name} />
                                        <AvatarFallback>
                                            <UserIcon className="h-10 w-10 text-primary" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                      <h2 className="text-2xl font-bold">{profile?.name}</h2>
                                      <p className="text-xs text-muted-foreground">{formatJoinDate(profile?.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    {friendStatus !== 'self' && (
                                     <div className="flex gap-2">
                                        {friendStatus === 'not_friends' && (
                                            <Button className="w-full" onClick={handleAddFriend} disabled={isFriendActionLoading || !currentUser || isAnonymous}>
                                                {isFriendActionLoading ? <Loader2 className="mr-2 animate-spin" /> : <UserPlus className="mr-2" />}
                                                Add Friend
                                            </Button>
                                        )}
                                        {friendStatus === 'pending' && <Button className="w-full" disabled>Request Sent</Button>}
                                        {friendStatus === 'friends' && (
                                            <Button className="w-full" onClick={handleChallenge} disabled={!currentUser || currentUser.uid === userId}>
                                                <Swords className="mr-2" /> Challenge
                                            </Button>
                                        )}
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button variant="ghost" size="icon" onClick={handleReportUser} disabled={hasReported || !currentUser || isAnonymous}>
                                                <FlagIcon className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {!currentUser || isAnonymous ? <p>Login to report user</p> : hasReported ? <p>User already reported</p> : <p>Report User</p>}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                     </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                       <div className="md:col-span-3 grid grid-cols-4 gap-4">
                           <StatCard title="current streak" value={profile?.currentStreak || 0} valueClassName="text-orange-400" icon={<FlameIcon className="h-4 w-4 text-muted-foreground" />} />
                           <StatCard title="tests started" value={profile?.testsStarted || 0}/>
                           <StatCard title="tests completed" value={profile?.testsCompleted || 0}/>
                           <StatCard title="time typing" value={formatTypingTime(profile?.totalTimeTyping)} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <PersonalBestCard 
                            title="Personal Bests (Words)"
                            pbs={{
                                "15 words": profile?.personalBests?.words?.[15],
                                "30 words": profile?.personalBests?.words?.[30],
                                "45 words": profile?.personalBests?.words?.[45],
                            }}
                        />
                        <PersonalBestCard 
                            title="Personal Bests (Time)"
                            pbs={{
                                "15 sec": profile?.personalBests?.time?.[15],
                                "30 sec": profile?.personalBests?.time?.[30],
                                "60 sec": profile?.personalBests?.time?.[60],
                            }}
                        />
                    </div>
                </>
            )}
        </div>
      </main>
      <TypingTip />
    </div>
  );
}

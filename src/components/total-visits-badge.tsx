
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { CREATOR_USER_ID } from '@/lib/config';
import { EyeIcon, Loader2, Users, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from './ui/separator';

export function TotalVisitsBadge() {
  const { user } = useAuth();
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [liveUsers, setLiveUsers] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user || user.uid !== CREATOR_USER_ID) {
      setIsLoading(false);
      return;
    }

    const statsDocRef = doc(db, 'meta', 'site_stats');
    const unsubscribeVisits = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalVisits(docSnap.data().totalVisits);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to fetch site stats:", error);
      setIsLoading(false);
    });

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('presence.state', '==', 'online'));
    const unsubscribeLiveUsers = onSnapshot(q, (snapshot) => {
      setLiveUsers(snapshot.size);
    });

    // Fetch total users count once
    getDocs(collection(db, 'users')).then(snapshot => {
        setTotalUsers(snapshot.size);
    }).catch(err => {
        console.error("Failed to fetch total user count:", err);
    });

    return () => {
        unsubscribeVisits();
        unsubscribeLiveUsers();
    };
  }, [user]);

  if (!user || user.uid !== CREATOR_USER_ID) {
    return null;
  }
  
  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 hidden md:flex">
                <EyeIcon className="mr-1.5 h-4 w-4" />
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <span>{totalVisits !== null ? totalVisits.toLocaleString() : 'N/A'}</span>
                )}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
                <h4 className="font-medium leading-none">Site Statistics</h4>
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Wifi className="h-4 w-4"/> Live Users</span>
                        <span className="font-semibold">
                            {liveUsers === null ? <Loader2 className="h-4 w-4 animate-spin" /> : liveUsers}
                        </span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Total Users</span>
                        <span className="font-semibold">
                            {totalUsers === null ? <Loader2 className="h-4 w-4 animate-spin" /> : totalUsers}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2"><EyeIcon className="h-4 w-4"/> Total Visits</span>
                        <span className="font-semibold">
                           {totalVisits === null ? <Loader2 className="h-4 w-4 animate-spin" /> : totalVisits.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
  );
}

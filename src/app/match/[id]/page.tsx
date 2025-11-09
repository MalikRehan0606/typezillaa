
'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, addDoc, updateDoc, collection, serverTimestamp, getDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { Loader2, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MatchLobby } from '@/components/match-lobby';
import type { UserProfileData, ChallengeStats } from '@/types';

const DAILY_CHALLENGE_LIMIT = 10;
const CHALLENGE_COOLDOWN_SECONDS = 60;

function MatchLobbyContent() {
    const params = useParams();
    const router = useRouter();
    const { user, isAnonymous } = useAuth();
    const { toast } = useToast();
    let { id: targetId } = params;
    targetId = Array.isArray(targetId) ? targetId[0] : targetId;

    const handleStartMatch = async () => {
        if (!user || isAnonymous || !targetId || user.uid === targetId) {
            toast({ 
                title: "Cannot start match", 
                description: "You must be logged in and cannot challenge yourself.",
                variant: "destructive" 
            });
            return;
        }

        try {
            // Fetch challenger's data for checks
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data() as UserProfileData | undefined;

            // Fetch opponent's data to get their name
            const opponentDocRef = doc(db, 'users', targetId);
            const opponentDocSnap = await getDoc(opponentDocRef);

            if (!opponentDocSnap.exists()) {
                toast({ title: "Error", description: "The player you are trying to challenge does not exist.", variant: "destructive" });
                return;
            }
            const opponentName = opponentDocSnap.data()?.name || 'Opponent';

            const now = new Date();
            const nowTimestamp = Timestamp.fromDate(now);

            const challengeStats = userData?.challengeStats || {
                dailyChallengeCount: 0,
                dailyChallengeCountResetAt: nowTimestamp,
                lastChallengeSentAt: null,
            };
            
            const toDateSafe = (timestamp: any): Date | null => {
              if (!timestamp) return null;
              if (timestamp.toDate) return timestamp.toDate();
              if (timestamp instanceof Date) return timestamp;
              return null;
            }

            // Check Cooldown
            const lastSentDate = toDateSafe(challengeStats.lastChallengeSentAt);
            if (lastSentDate) {
                const secondsSinceLast = (now.getTime() - lastSentDate.getTime()) / 1000;
                if (secondsSinceLast < CHALLENGE_COOLDOWN_SECONDS) {
                    toast({
                        title: "Cooldown Active",
                        description: `You must wait ${Math.ceil(CHALLENGE_COOLDOWN_SECONDS - secondsSinceLast)} more seconds before sending another challenge.`,
                        variant: "destructive"
                    });
                    return;
                }
            }

            // Check Daily Limit
            const resetDate = toDateSafe(challengeStats.dailyChallengeCountResetAt) || new Date(0);
            let currentCount = challengeStats.dailyChallengeCount;
            if (now > resetDate) {
                currentCount = 0; // Reset if the day has passed
            }

            if (currentCount >= DAILY_CHALLENGE_LIMIT) {
                 toast({
                    title: "Daily Limit Reached",
                    description: `You have reached your daily limit of ${DAILY_CHALLENGE_LIMIT} challenges.`,
                    variant: "destructive"
                });
                return;
            }

            // All checks passed, create match and update user stats
            const batch = writeBatch(db);

            const matchData = {
                player1Id: user.uid,
                player1Name: user.displayName || 'Player 1',
                player2Id: targetId,
                player2Name: opponentName,
                status: 'pending',
                wordCount: 30,
                createdAt: serverTimestamp(),
                player1Result: null,
                player2Result: null,
            };
            const matchRef = doc(collection(db, 'matches'));
            batch.set(matchRef, matchData);

            const newResetDate = new Date(now);
            newResetDate.setHours(23, 59, 59, 999);

            const newChallengeStats: ChallengeStats = {
                dailyChallengeCount: currentCount + 1,
                lastChallengeSentAt: serverTimestamp(),
                dailyChallengeCountResetAt: now > resetDate ? Timestamp.fromDate(newResetDate) : challengeStats.dailyChallengeCountResetAt,
            };
            batch.update(userDocRef, { challengeStats: newChallengeStats });

            await batch.commit();
            router.push(`/match/${matchRef.id}`);

        } catch (error: any) {
            console.error("Error creating match:", error);
            let description = "Failed to create match. Please try again.";
            if (error.code === 'permission-denied') {
                description = "You are not allowed to send a challenge right now. This could be due to rate limits. Try again in a minute.";
            }
            toast({ title: "Error", description, variant: "destructive" });
        }
    };
    
    // This page can now be a lobby OR a pre-lobby to start a match
    // If the ID is a user ID, it's a pre-lobby.
    // If the ID is a match ID, it's a lobby.
    // We can differentiate by the length of the ID. A Firestore-generated ID is 20 chars.
    const isPotentiallyUser = targetId && targetId.length > 20;

    if (isPotentiallyUser) {
        return (
            <div className="text-center space-y-6">
                <h1 className="text-3xl font-bold">Challenge Player?</h1>
                <p>You are about to challenge this player to a 1v1 typing race.</p>
                <Button onClick={handleStartMatch} size="lg">
                    <Swords className="mr-2"/>
                    Start Match
                </Button>
            </div>
        );
    }
    
    const matchId = targetId;

    if (!matchId) {
        return <div className="text-destructive text-center">Invalid match URL.</div>;
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <MatchLobby matchId={matchId} />
        </Suspense>
    );
}

export default function MatchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow container mx-auto flex items-center justify-center p-2 md:p-4">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
          <MatchLobbyContent />
        </Suspense>
      </main>
    </div>
  );
}

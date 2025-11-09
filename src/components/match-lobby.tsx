
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import type { Match, MatchResult } from '@/types';
import { useAuth } from './auth-provider';
import { Loader2, Swords, User, Clock, AlertTriangle, XIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { TypingChallenge } from './typing-challenge';
import { useRouter } from 'next/navigation';
import { getRandomText } from '@/lib/sample-texts';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import Link from 'next/link';

function MatchResultsDisplay({ match, currentUserId }: { match: Match; currentUserId: string }) {
    const router = useRouter();
    const { player1Result, player2Result, player1Name, player2Name, winnerId } = match;

    const getResultCard = (playerName: string, result: MatchResult | null, isWinner: boolean) => {
        return (
            <Card className={isWinner ? 'border-primary border-2 shadow-lg' : ''}>
                <CardHeader>
                    <CardTitle className={isWinner ? 'text-primary' : ''}>{playerName}</CardTitle>
                    {isWinner && <CardDescription>Winner!</CardDescription>}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {result ? (
                        <>
                            <div>
                                <p className="text-sm text-muted-foreground">WPM</p>
                                <p className="text-4xl font-bold">{result.wpm}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Accuracy</p>
                                <p className="text-4xl font-bold">{result.accuracy}%</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="text-4xl font-bold">{result.time}s</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground">Did not finish.</p>
                    )}
                </CardContent>
            </Card>
        );
    }
    
    const isPlayer1Winner = winnerId === match.player1Id;
    const isPlayer2Winner = winnerId === match.player2Id;

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Match Over!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {getResultCard(player1Name, player1Result, isPlayer1Winner)}
                   {getResultCard(player2Name, player2Result, isPlayer2Winner)}
                </div>
                 <div className="text-center flex justify-center gap-4">
                    <Button onClick={() => router.push('/levels')}>Play Again</Button>
                    <Button asChild variant="outline">
                        <Link href="/">Home</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function Countdown({ onCountdownEnd }: { onCountdownEnd: () => void }) {
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count === 0) {
            onCountdownEnd();
            return;
        }

        const timer = setTimeout(() => {
            setCount(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, onCountdownEnd]);

    return (
        <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Get ready!</p>
            <p className="text-8xl font-bold text-primary animate-pulse">{count}</p>
        </div>
    );
}


export function MatchLobby({ matchId }: { matchId: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    const matchRef = doc(db, 'matches', matchId);
    const unsubscribe = onSnapshot(matchRef, async (docSnap) => {
      if (docSnap.exists()) {
        const matchData = { id: docSnap.id, ...docSnap.data() } as Match;
        
        // If the match is pending and has no text, the creator generates it
        if (matchData.status === 'pending' && !matchData.textToType && user?.uid === matchData.player1Id) {
            const text = getRandomText('intermediate', 'en', matchData.wordCount);
            await updateDoc(matchRef, { textToType: text, player1Ready: false, player2Ready: false });
        } else {
            setMatch(matchData);
        }

      } else {
        setError('This match does not exist or has been deleted.');
      }
    });

    return () => unsubscribe();
  }, [matchId, user]);
  
   useEffect(() => {
    if (match?.player1Ready && match?.player2Ready && match.status === 'active') {
      const startMatch = async () => {
        const matchRef = doc(db, 'matches', matchId);
        await updateDoc(matchRef, { status: 'starting' });
      }
      // Only one player needs to trigger the update
      if(user?.uid === match.player1Id) {
        startMatch();
      }
    }
  }, [match, user, matchId]);


  const handleTestComplete = async (result: MatchResult) => {
    if (!user || !match) return;

    const playerField = user.uid === match.player1Id ? 'player1Result' : 'player2Result';
    
    try {
        const matchRef = doc(db, 'matches', matchId);
        
        // Use a transaction/batch to be safe, but a simple update is fine for now
        await updateDoc(matchRef, { [playerField]: result });

    } catch (err) {
        console.error("Failed to save match result:", err);
    }
  };
  
  useEffect(() => {
    if (!match || !match.player1Result || !match.player2Result) return;
    
    const setMatchCompleted = async () => {
        const matchRef = doc(db, 'matches', matchId);
        await updateDoc(matchRef, { status: 'completed' });
    };

    if (match.status === 'inprogress') {
        setMatchCompleted();
    }
  }, [match, matchId]);
  
  useEffect(() => {
    if (!match || match.status !== 'completed' ) return;
    
    const determineWinner = async () => {
        const { player1Result, player2Result } = match;
        let winnerId = null;

        if (player1Result && player2Result) {
            if (player1Result.wpm > player2Result.wpm) {
                winnerId = match.player1Id;
            } else if (player2Result.wpm > player2Result.wpm) {
                winnerId = match.player2Id;
            } else { // Tie in WPM, check accuracy
                if(player1Result.accuracy > player2Result.accuracy) {
                    winnerId = match.player1Id;
                } else {
                    winnerId = match.player2Id;
                }
            }
        } else if (player1Result) {
            winnerId = match.player1Id;
        } else if (player2Result) {
            winnerId = match.player2Id;
        }
        
        if (winnerId && !match.winnerId) {
             const matchRef = doc(db, 'matches', matchId);
             await updateDoc(matchRef, { winnerId: winnerId });
        }
    };

    if(user?.uid === match.player1Id) { // Only have player 1 determine the winner
        determineWinner();
    }
  }, [match, user, matchId]);
  
  const handleReady = async () => {
    if (!user || !match) return;
    const isPlayer1 = user.uid === match.player1Id;
    const readyField = isPlayer1 ? 'player1Ready' : 'player2Ready';
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, { [readyField]: true });
  }

  const handleStartTyping = () => {
    setIsStarting(false);
    const setInProgress = async () => {
        const matchRef = doc(db, 'matches', matchId);
        await updateDoc(matchRef, { status: 'inprogress' });
    }
     if(user?.uid === match.player1Id) {
        setInProgress();
    }
  };
  
  const handleForfeit = async () => {
    if (!user || !match) return;
    const opponentId = user.uid === match.player1Id ? match.player2Id : match.player1Id;
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
        status: 'completed',
        winnerId: opponentId
    });
  };

  const handleCancelChallenge = async () => {
    if (!user || !match || user.uid !== match.player1Id) return;
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, { status: 'declined' });
    router.push('/levels');
  };
  

  if (loading || !match) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (error) {
    return (
      <Card className="text-center py-12 px-6">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-2xl font-headline mt-4">Match Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/levels">Back to Levels</Link></Button>
        </CardContent>
      </Card>
    );
  }
  
  if (match.status === 'completed' || match.status === 'declined') {
    if (match.status === 'declined') {
        const message = user?.uid === match.player1Id
            ? 'You cancelled the challenge.'
            : `${match.player2Name} has declined the challenge.`;
      return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center gap-4">Match Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground">{message}</p>
                 <Button onClick={() => router.push('/levels')} className="mt-4">Find a new match</Button>
            </CardContent>
        </Card>
      );
    }
    return <MatchResultsDisplay match={match} currentUserId={user!.uid} />;
  }

  if (match.status === 'starting') {
     return <Countdown onCountdownEnd={handleStartTyping} />;
  }
  
  if (match.status === 'inprogress' && match.textToType) {
    const isPlayer1 = user?.uid === match.player1Id;
    const hasFinished = isPlayer1 ? !!match.player1Result : !!match.player2Result;
    
    if (hasFinished) {
      return (
        <div className="text-center space-y-4">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p>You have finished! Waiting for your opponent...</p>
        </div>
      );
    }

    return (
        <div className="w-full">
            <div className="flex justify-around mb-4">
                <div className="flex items-center gap-2">
                    <Avatar><AvatarFallback><User/></AvatarFallback></Avatar>
                    <span>{match.player1Name}</span>
                     {match.player1Result && <Badge variant="secondary">Finished</Badge>}
                </div>
                <div className="flex items-center gap-2">
                    <Avatar><AvatarFallback><User/></AvatarFallback></Avatar>
                    <span>{match.player2Name}</span>
                    {match.player2Result && <Badge variant="secondary">Finished</Badge>}
                </div>
            </div>
            <TypingChallenge 
                level="intermediate" // or derive from match
                wordCount={match.wordCount}
                timeLimit={null} // Can be added to match data model
                language="en"
                onTestCompleteForMatch={handleTestComplete}
                onForfeit={handleForfeit}
                customText={match.textToType}
                isMatchMode={true}
            />
        </div>
    );
  }

  // Active (in lobby) or Pending state
  const isPlayer1 = user?.uid === match.player1Id;
  const isPlayer2 = user?.uid === match.player2Id;
  const amIReady = isPlayer1 ? match.player1Ready : match.player2Ready;
  
  if (match.status === 'active') {
    return (
       <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-4"><Swords /> 1v1 Lobby <Swords/></CardTitle>
            <CardDescription>Both players must be ready to start.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-2">
                    <User className="h-10 w-10" />
                    <p className="font-semibold">{match.player1Name}</p>
                    <Badge variant={match.player1Ready ? "default" : "outline"}>{match.player1Ready ? "Ready" : "Not Ready"}</Badge>
                </div>
                <p className="text-2xl font-bold">vs</p>
                <div className="flex flex-col items-center gap-2">
                    <User className="h-10 w-10" />
                    <p className="font-semibold">{match.player2Name}</p>
                    <Badge variant={match.player2Ready ? "default" : "outline"}>{match.player2Ready ? "Ready" : "Not Ready"}</Badge>
                </div>
            </div>
            {amIReady ? (
                <Button disabled>Waiting for opponent...</Button>
            ) : (
                <Button onClick={handleReady}>Ready Up!</Button>
            )}
        </CardContent>
    </Card>
    );
  }

  // Pending state (waiting for player 2 to accept)
  return (
    <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-4"><Swords /> 1v1 Challenge <Swords/></CardTitle>
            <CardDescription>Waiting for opponent to accept the challenge...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-2">
                    <User className="h-10 w-10" />
                    <p className="font-semibold">{match.player1Name}</p>
                    <Badge variant="secondary">Waiting</Badge>
                </div>
                <p className="text-2xl font-bold">vs</p>
                <div className="flex flex-col items-center gap-2">
                    <User className="h-10 w-10" />
                    <p className="font-semibold">{match.player2Name}</p>
                    <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> Invited</Badge>
                </div>
            </div>
             <p className="text-sm text-muted-foreground">The race for {match.wordCount} words will begin when your opponent accepts.</p>
        </CardContent>
         {isPlayer1 && (
            <CardFooter className="flex justify-center">
                <Button variant="destructive" onClick={handleCancelChallenge}>
                    <XIcon className="mr-2 h-4 w-4" />
                    Exit
                </Button>
            </CardFooter>
        )}
    </Card>
  );
}

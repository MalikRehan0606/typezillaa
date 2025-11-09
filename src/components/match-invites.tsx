
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { Match } from '@/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, XIcon, Loader2, Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MatchInvites({ userId }: { userId: string }) {
  const router = useRouter();
  const [invites, setInvites] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // This component is now only for visibility of invites one might have missed.
    // The main notification happens via the global listener in AuthProvider.
    const q = query(
      collection(db, 'matches'),
      where('player2Id', '==', userId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newInvites: Match[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      setInvites(newInvites);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching match invites:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleInviteAction = async (matchId: string, action: 'accept' | 'decline') => {
    const matchRef = doc(db, 'matches', matchId);
    try {
        if (action === 'accept') {
            await updateDoc(matchRef, { status: 'active' });
            toast({ title: 'Challenge Accepted!', description: 'Get ready to race!' });
            router.push(`/match/${matchId}`);
        } else {
            await updateDoc(matchRef, { status: 'declined' });
            toast({ title: 'Challenge Declined' });
        }
    } catch (err) {
        console.error(`Failed to ${action} match`, err);
        toast({ title: 'Error', description: 'Could not respond to the challenge.', variant: 'destructive'});
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin h-5 w-5 mr-2"/>Loading invites...</div>;
  }

  if (invites.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No pending match invites.</p>;
  }

  return (
    <ul className="space-y-2">
      {invites.map((invite) => (
        <li key={invite.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-primary" />
            <span>{invite.player1Name} challenges you! ({invite.wordCount} words)</span>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => handleInviteAction(invite.id, 'accept')}>
              <CheckIcon />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleInviteAction(invite.id, 'decline')}>
              <XIcon />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

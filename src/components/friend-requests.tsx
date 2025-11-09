
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import type { FriendRequest } from '@/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, XIcon, Loader2 } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function FriendRequests({ userId, onFriendChange }: { userId: string, onFriendChange: () => void }) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handlingRequest, setHandlingRequest] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRequests: FriendRequest[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
      setRequests(newRequests);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching friend requests:", err);
       if (err.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: `friendRequests`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
      setError('Could not load friend requests.');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleRequestAction = useCallback(async (requestId: string, fromUserId: string, action: 'accept' | 'decline') => {
    setHandlingRequest(requestId);
    try {
        const requestRef = doc(db, 'friendRequests', requestId);

        if (action === 'decline') {
            await updateDoc(requestRef, { status: 'declined' });
            toast({ title: 'Request Declined', description: 'The request has been removed.' });
        } else { // Accept request
            const batch = writeBatch(db);

            // 1. Update friend request status
            batch.update(requestRef, { status: 'accepted' });

            // 2. Add each user to the other's friend list
            const currentUserRef = doc(db, 'users', userId);
            const newFriendRef = doc(db, 'users', fromUserId);
            
            batch.update(currentUserRef, { friends: arrayUnion(fromUserId) });
            batch.update(newFriendRef, { friends: arrayUnion(userId) });

            await batch.commit();

            toast({ title: 'Friend Added!', description: 'You are now friends.' });
        }

        onFriendChange(); // Notify parent
    } catch (err: any) {
        console.error(`Failed to ${action} friend request:`, err);
        if (err.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: `friendRequests/${requestId} and user profiles`,
                operation: 'write',
                requestResourceData: { status: action, from: fromUserId, to: userId }
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        toast({
            title: 'Error',
            description: `Could not ${action} the request. Check security rules and Firestore paths.`,
            variant: 'destructive',
        });
    } finally {
        setHandlingRequest(null);
    }
  }, [userId, toast, onFriendChange]);


  if (isLoading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin h-5 w-5 mr-2"/>Loading requests...</div>;
  }

  if (error) {
    return <div className="text-destructive p-4">{error}</div>;
  }

  if (requests.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No pending friend requests.</p>;
  }

  return (
    <ul className="space-y-2">
      {requests.map((req) => (
        <li key={req.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
          <span>{req.fromUserName}</span>
          {handlingRequest === req.id ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => handleRequestAction(req.id, req.fromUserId, 'accept')}>
                <CheckIcon />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleRequestAction(req.id, req.fromUserId, 'decline')}>
                <XIcon />
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

    
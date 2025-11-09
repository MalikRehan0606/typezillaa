
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayRemove, collection, query, where, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import type { UserProfileData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User as UserIcon, Loader2, Swords, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getFunctions, httpsCallable } from 'firebase/functions';


interface FriendsListProps {
  userId: string;
  friends: UserProfileData[];
  onFriendChange: () => void;
}

export function FriendsList({ userId, friends, onFriendChange }: FriendsListProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isRemovingFriend, setIsRemovingFriend] = useState<string | null>(null);

  const handleRemoveFriend = async (friendToRemoveId: string) => {
    if (!currentUser) return;
    setIsRemovingFriend(friendToRemoveId);
  
    try {
      const functions = getFunctions();
      const removeFriend = httpsCallable(functions, 'removeFriend');
      await removeFriend({ friendId: friendToRemoveId });
  
      toast({
        title: 'Friend Removed',
        description: 'They have been removed from your friends list.',
      });
      onFriendChange();
    } catch (err: any) {
      console.error('Error removing friend:', err);
      toast({
        title: 'Error',
        description: err.message || 'Could not remove friend. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRemovingFriend(null);
    }
  };

  if (friends.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">You have no friends yet. Add some from their profiles!</p>;
  }

  return (
    <ul className="space-y-2">
      {friends.map(friend => {
        return (
          <li key={friend.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-muted group">
            <Link href={`/profile/${friend.uid}`} className="flex items-center gap-3 flex-grow">
               <div className="relative">
                <Avatar>
                    <AvatarImage src={friend.photoURL} alt={friend.name} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
                 <span className={cn(
                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                    friend.presence?.state === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  )} />
              </div>
              <div>
                <span>{friend.name}</span>
              </div>
            </Link>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push(`/match/${friend.uid}`)} 
                className="h-8 w-8"
                aria-label={`Challenge ${friend.name}`}
              >
                <Swords className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={isRemovingFriend === friend.uid}
                  >
                    {isRemovingFriend === friend.uid ? <Loader2 className="animate-spin h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {friend.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {friend.name} from your friends list. This action is permanent.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleRemoveFriend(friend.uid)}
                      disabled={!!isRemovingFriend}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isRemovingFriend === friend.uid ? <Loader2 className="animate-spin" /> : 'Remove'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

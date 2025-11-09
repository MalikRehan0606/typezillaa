
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import type { UserProfileData } from '@/types';
import { FriendRequests } from './friend-requests';
import { FriendsList } from './friends-list';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MatchInvites } from './match-invites';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2 } from 'lucide-react';

export function Friends({ userId }: { userId: string }) {
    const [friendIds, setFriendIds] = useState<string[]>([]);
    const [friends, setFriends] = useState<UserProfileData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFriendProfiles = useCallback(() => {
        if (!userId || !db) return;
        if (friendIds.length === 0) {
            setFriends([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);

        const friendsQuery = query(collection(db, 'users'), where('__name__', 'in', friendIds));
        const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
            const friendsData: UserProfileData[] = [];
            snapshot.forEach(doc => {
                friendsData.push({ uid: doc.id, ...doc.data() } as UserProfileData);
            });
            setFriends(friendsData.sort((a, b) => a.name.localeCompare(b.name)));
            setIsLoading(false);
        }, (err) => {
            if (err.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({ path: 'users', operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
            }
            setError("Could not load friend details.");
            setIsLoading(false);
        });

        return unsubscribe;
    }, [userId, friendIds]);

    // Effect to get the user's friend IDs
    useEffect(() => {
        if (!userId || !db) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const userDocRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setFriendIds(userData.friends || []);
            }
            setIsLoading(false);
        }, (err) => {
            if (err.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({ path: userDocRef.path, operation: 'get' });
                errorEmitter.emit('permission-error', permissionError);
            }
            console.error("Error fetching user's friend list:", err);
            setError("Could not load your friends list.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [userId]);

    // Effect to get friend profiles when friendIds change
    useEffect(() => {
        const unsubscribe = fetchFriendProfiles();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [fetchFriendProfiles]);

    const handleFriendChange = useCallback(() => {
        // This function is called by child components to signal a change in the friends list
        // which triggers a re-fetch of friendIds via the onSnapshot listener.
        // For now, we don't need to do anything extra here as the listeners handle it.
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Match Invites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MatchInvites userId={userId} />
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Friend Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FriendRequests userId={userId} onFriendChange={handleFriendChange} />
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Friends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin h-5 w-5 mr-2"/>Loading friends...</div>
                        ) : error ? (
                            <div className="text-destructive p-4">{error}</div>
                        ) : (
                            <FriendsList userId={userId} friends={friends} onFriendChange={handleFriendChange} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    
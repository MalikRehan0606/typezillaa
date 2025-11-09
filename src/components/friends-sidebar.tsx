
"use client";

import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Friends } from './friends';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { LogInIcon, UserPlusIcon } from 'lucide-react';
import Link from 'next/link';

export function FriendsSidebar({ children }: { children: React.ReactNode }) {
    const { user, isAnonymous } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Friends</SheetTitle>
                    <SheetDescription>
                        Manage your friend requests and see who is online.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    {user && !isAnonymous ? (
                        <Friends userId={user.uid} />
                    ) : (
                        <div className="text-center space-y-4 pt-8">
                            <p>You need to be logged in to manage friends.</p>
                            <div className="flex flex-col gap-4">
                                <Button asChild>
                                    <Link href="/login"><LogInIcon/> Login</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/signup"><UserPlusIcon/> Sign Up</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

    

"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut, User, signInAnonymously } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc, query, where, onSnapshot } from "firebase/firestore";
import type { TestResult, Match } from '@/types';
import { useLanguage } from '@/contexts/language-provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ToastAction } from './ui/toast';


// A listener component that catches permission errors and displays them in the dev overlay.
const FirebaseErrorListener = () => {
    const [error, setError] = useState<FirestorePermissionError | null>(null);

    useEffect(() => {
        const handleError = (e: FirestorePermissionError) => {
            console.error("A Firestore permission error was caught by the central error listener.", e);
            setError(e);
        };
        errorEmitter.on('permission-error', handleError);
        return () => {
            errorEmitter.off('permission-error', handleError);
        };
    }, []);

    if (process.env.NODE_ENV === 'production' || !error) {
        return null;
    }
    
    // In development, we throw the error to make it visible in Next.js's dev overlay.
    // This is a special pattern to make security rule debugging easier.
    throw error;
};


// Component to show when Firebase is not configured
const FirebaseNotConfigured = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background p-4">
    <Card className="w-full max-w-lg shadow-xl border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Firebase Configuration Missing
          </CardTitle>
          <CardDescription>
            Your app is not connected to Firebase. Please follow the steps below to fix this.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <p>To use all features of this app, including login and leaderboards, you need to provide your Firebase project's configuration keys.</p>
            <div className="p-4 bg-muted rounded-md space-y-2">
                <h3 className="font-semibold">How to fix this:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to your <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Firebase Console</a>.</li>
                  <li>Click the gear icon next to "Project Overview" and select <strong>Project settings</strong>.</li>
                  <li>In the "General" tab, scroll down to the "Your apps" section and find your web app.</li>
                  <li>Under "Firebase SDK snippet", select the <strong>Config</strong> option.</li>
                  <li>Copy the configuration values.</li>
                  <li>In your project code, open the <code className="bg-secondary px-1 py-0.5 rounded">.env</code> file.</li>
                  <li>Paste the keys into the file, one for each line, like this:</li>
                </ol>
                <div className="p-2 bg-secondary rounded-md text-xs overflow-x-auto font-mono">
                    <div>NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"</div>
                    <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"</div>
                    <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"</div>
                    <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"</div>
                    <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"</div>
                    <div>NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"</div>
                </div>
                <p>After saving the <code className="bg-secondary px-1 py-0.5 rounded">.env</code> file, the app should reload and work correctly.</p>
            </div>
        </CardContent>
    </Card>
  </div>
);


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  isAnonymous: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const previousUserRef = useRef<User | null>(null);
  const isAnonymous = user?.isAnonymous ?? true;

  useEffect(() => {
    previousUserRef.current = user;
  }, [user]);

  // Presence management effect
  useEffect(() => {
    if (!user || isAnonymous || !db) return;

    const userStatusRef = doc(db, 'users', user.uid);

    const updateStatus = (state: 'online' | 'offline') => {
        updateDoc(userStatusRef, {
            presence: {
                state,
                lastSeen: serverTimestamp(),
            },
        }).catch(err => console.error("Could not update presence status:", err));
    };

    updateStatus('online');

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            updateStatus('offline');
        } else {
            updateStatus('online');
        }
    };
    
    const handleBeforeUnload = () => {
        updateStatus('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      updateStatus('offline');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, [user, isAnonymous]);

  // Listener for incoming match challenges
  useEffect(() => {
    if (!user || isAnonymous || !db) return;

    const q = query(
      collection(db, 'matches'),
      where('player2Id', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          
          const handleAccept = async () => {
            const matchRef = doc(db, 'matches', match.id);
            await updateDoc(matchRef, { status: 'active' });
            router.push(`/match/${match.id}`);
          };
          
          const handleDecline = async () => {
            const matchRef = doc(db, 'matches', match.id);
            await updateDoc(matchRef, { status: 'declined' });
          };

          toast({
            title: '1v1 Challenge!',
            description: `${match.player1Name} challenges you to a duel!`,
            duration: 15000,
            action: (
              <div className="flex flex-col gap-2">
                <ToastAction altText="Accept" onClick={handleAccept}>Accept</ToastAction>
                <ToastAction altText="Decline" onClick={handleDecline} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Decline</ToastAction>
              </div>
            ),
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user, isAnonymous, toast, router]);


  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in or is anonymous.
        setUser(user);
      } else {
        // No user is signed in, so sign in anonymously.
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error) {
          console.error("Anonymous sign-in failed", error);
          toast({
            title: "Authentication Error",
            description: "Could not start a session. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [toast]);
  
  // This useEffect handles post-login actions, like saving a score.
  useEffect(() => {
    const LATEST_RESULT_KEY = "latestTestResult";

    const saveHighScore = async (resultToSave: TestResult, loggedInUser: User) => {
      if (!db) return;
      try {
        const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
        const userName = userDoc.data()?.name || loggedInUser.displayName || 'Anonymous';

        const leaderboardColRef = collection(db, "leaderboard");
        await addDoc(leaderboardColRef, {
            name: userName,
            wpm: resultToSave.wpm,
            accuracy: resultToSave.accuracy,
            level: resultToSave.level,
            language: resultToSave.language,
            timestamp: Date.now(),
            userId: loggedInUser.uid,
        });
        
        toast({ title: t.scoreSaved, description: t.scoreSavedDescription });

      } catch (error: any) {
          console.error("Error saving test result post-login:", error);
          toast({ title: "Save Failed", description: "Your result could not be saved after login.", variant: "destructive" });
      }
    };

    const wasAnonymousOrNull = !previousUserRef.current || previousUserRef.current.isAnonymous;
    const isNowLoggedIn = user && !user.isAnonymous;

    if (wasAnonymousOrNull && isNowLoggedIn) {
        const postLoginAction = sessionStorage.getItem('postLoginAction');
        if (postLoginAction === 'saveLatestResult') {
            sessionStorage.removeItem('postLoginAction');
            const storedResult = localStorage.getItem(LATEST_RESULT_KEY);
            if (storedResult) {
                try {
                    const result: TestResult = JSON.parse(storedResult);
                    saveHighScore(result, user);
                } catch(e) {
                    console.error("Failed to parse stored result", e);
                }
            }
        }
    }
  }, [user, toast, t]);


  // This new useEffect handles redirects safely after rendering.
  useEffect(() => {
    if (loading) return; // Don't redirect while still loading auth state.
    
    // Redirect verified users away from auth pages.
    const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password'].includes(pathname);
    if (user && !user.isAnonymous && user.emailVerified && isAuthPage) {
        router.replace('/');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been logged out successfully.' });
      // A full page reload on the homepage is the most robust way to clear all state
      // and ensure a fresh connection to services like Firestore.
      window.location.href = '/';
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Something went wrong.', variant: 'destructive' });
    }
  };

  const value = { user, loading, logout, isAnonymous };

  if (!auth) {
    return <FirebaseNotConfigured />;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If a verified user lands on an auth page, show a loader while the useEffect redirects them.
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password'].includes(pathname);
  if (user && !isAnonymous && user.emailVerified && isAuthPage) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
        <FirebaseErrorListener />
        {children}
    </AuthContext.Provider>
  );
}



"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GithubIcon, Loader2 } from 'lucide-react';
import { SettingsDialog } from '@/components/settings-dialog';
import { TypingTip } from '@/components/typing-tip';
import { LanguageSelector } from '@/components/language-selector';
import { useLanguage } from '@/contexts/language-provider';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const creatorGitHubUrl = "https://github.com/MalikRehan0606";
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
        toast({ title: t.signUpInvalidName, description: t.signUpInvalidNameDescription, variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    try {
      if (!auth || !db) {
        throw new Error("Firebase Auth or Firestore is not initialized.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name.trim() });
      
      // Create a user document in Firestore with a complete initial structure
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
          uid: user.uid,
          name: name.trim(),
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          testsStarted: 0,
          testsCompleted: 0,
          totalTimeTyping: 0,
          currentStreak: 0,
          longestStreak: 0,
          unlockedAchievements: [],
          friends: [],
          lastTestTimestamp: null,
          challengeStats: {
            dailyChallengeCount: 0,
            dailyChallengeCountResetAt: serverTimestamp(),
            lastChallengeSentAt: null,
          },
          dominionBadgesEarned: 0,
          sentinelBadgesEarned: 0,
          eternalFlameBadgesEarned: 0,
          viceroyBadgesEarned: 0,
          isBanned: false,
          presence: {
            state: 'offline',
            lastSeen: serverTimestamp()
          },
          personalBests: {
            words: {
                '15': { wpm: 0, accuracy: 0 },
                '30': { wpm: 0, accuracy: 0 },
                '45': { wpm: 0, accuracy: 0 },
            },
            time: {
                '15': { wpm: 0, accuracy: 0 },
                '30': { wpm: 0, accuracy: 0 },
                '60': { wpm: 0, accuracy: 0 },
            }
          }
      });

      await sendEmailVerification(user);
      
      toast({ 
        title: t.signUpSuccess, 
        description: t.signUpSuccessDescription
      });
      router.push('/verify-email');
    } catch (error: any) {
      console.error("Email Signup Failed. Full error:", error);
      let title = t.signUpFailed;
      let description = error.message;

      if (error.code === 'auth/email-already-in-use') {
        title = "Email Already Registered";
        description = 'This email is already in use. Please log in instead.';
      } else if (error.code === 'auth/unauthorized-domain') {
        title = 'Configuration Mismatch Error';
        description = "This error means the API Keys in your .env file do not match the Firebase project where 'localhost' is authorized. Please carefully re-copy all keys from your Firebase project settings into the .env file. Even one wrong character will cause this error.";
      }
      
      toast({
          title: title,
          description: (
            <div>
                {description}{' '}
                {error.code === 'auth/email-already-in-use' && (
                  <Link href="/login" className="underline font-bold">
                    Go to Login
                  </Link>
                )}
            </div>
          ),
          variant: 'destructive',
          duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="py-2 px-6 md:px-8 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/typezillalogo.png" alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <SettingsDialog />
            <a
              href={creatorGitHubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="View creator's profile on GitHub"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{t.signUpTitle}</CardTitle>
            <CardDescription>{t.signUpDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">{t.signUpNameLabel}</Label>
                    <Input id="name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                    <p className="text-xs text-muted-foreground">This will be your public display name and cannot be changed later.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t.loginEmailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t.loginPasswordLabel}</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.signUpButton}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {t.signUpAlreadyHaveAccount}{' '}
              <Link href="/login" className="underline">
                {t.signUpLoginLink}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
       <TypingTip />
    </div>
  );
}


"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GithubIcon, Loader2, ArrowLeftIcon } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { SettingsDialog } from '@/components/settings-dialog';
import { TypingTip } from '@/components/typing-tip';
import { LanguageSelector } from '@/components/language-selector';
import { useLanguage } from '@/contexts/language-provider';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const creatorGitHubUrl = "https://github.com/MalikRehan0606";
  const { user, isAnonymous } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect logged-in (non-anonymous) users to the homepage
    if (user && !isAnonymous) {
      router.replace('/');
    }
  }, [user, isAnonymous, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPageError(null);

    try {
      const attemptsRef = doc(db, "passwordResetAttempts", email.toLowerCase());
      const attemptsSnap = await getDoc(attemptsRef);
      const now = Timestamp.now();
      const twentyFourHoursAgo = new Timestamp(now.seconds - 24 * 60 * 60, now.nanoseconds);

      let recentAttempts: Timestamp[] = [];
      if (attemptsSnap.exists()) {
        const data = attemptsSnap.data();
        const attempts = (data.attempts || []) as Timestamp[];
        recentAttempts = attempts.filter(ts => ts.seconds > twentyFourHoursAgo.seconds);
      }

      if (recentAttempts.length >= 3) {
        const rateLimitMessage = t.forgotPasswordRateLimit;
        setPageError(rateLimitMessage);
        toast({
          title: t.forgotPasswordRateLimitTitle,
          description: rateLimitMessage,
          variant: "destructive",
        });
        return;
      }

      const actionCodeSettings = {
        url:
          process.env.NODE_ENV === "development"
            ? "http://localhost:9002/login"
            : "https://realistictyper.web.app/login",
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      const newAttempts = [...recentAttempts, now];
      await setDoc(attemptsRef, { attempts: newAttempts });

      toast({
        title: t.forgotPasswordCheckEmail,
        description: t.forgotPasswordCheckEmailDescription,
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === "unavailable" || error.code === "auth/network-request-failed" || !navigator.onLine) {
        const offlineMessage = t.forgotPasswordOffline;
        setPageError(offlineMessage);
        toast({
          title: t.forgotPasswordOfflineTitle,
          description: offlineMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.forgotPasswordCheckEmail,
          description: t.forgotPasswordCheckEmailDescription,
        });
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // While redirecting, show a loader to prevent the page from flashing
  if (user && !isAnonymous) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-2 px-6 md:px-8 border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={`/sounds/logo.png/logo.png?v=${new Date().getTime()}`} alt="TypeZilla Logo" width={140} height={32} />
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
            <CardTitle className="text-2xl">{t.forgotPasswordTitle}</CardTitle>
            <CardDescription>{t.forgotPasswordDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-4">
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
                {pageError && (
                  <p className="text-sm text-destructive text-center">{pageError}</p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.forgotPasswordSendLink}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
                <Link href="/login" className="underline flex items-center justify-center hover:text-primary transition-colors">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    {t.forgotPasswordBackToLogin}
                </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <TypingTip />
    </div>
  );
}

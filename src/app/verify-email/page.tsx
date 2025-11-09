
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck, LogOutIcon } from 'lucide-react';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import Image from 'next/image';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const { user, loading, logout, isAnonymous } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading) {
      if (!user || isAnonymous) {
        // If no user is logged in, or they are anonymous, they shouldn't be here.
        router.replace('/login');
      } else if (user.emailVerified) {
        // If the user is already verified, send them to the main app.
        router.replace('/');
      }
    }
  }, [user, loading, isAnonymous, router]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!user || cooldown > 0) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: t.verifyEmailSent,
        description: t.verifyEmailSentDescription,
      });
      setCooldown(COOLDOWN_SECONDS);
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      let description = t.verifyEmailFailedDescription;
      if (error.code === 'auth/too-many-requests') {
          description = "You've requested this too many times. Please wait a moment before trying again.";
          setCooldown(COOLDOWN_SECONDS); // Start cooldown even on server error
      }
      toast({
        title: t.verifyEmailFailed,
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  // While loading or redirecting, show a spinner.
  if (loading || !user || (user && !isAnonymous && user.emailVerified)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-2 px-6 md:px-8 border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={`/sounds/logo.png/logo.png?v=${new Date().getTime()}`} alt="TypeZilla Logo" width={140} height={32} />
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <Button variant="outline" onClick={logout}>
                <LogOutIcon className="mr-2 h-4 w-4" /> {t.logout}
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="items-center text-center">
            <MailCheck className="w-12 h-12 text-primary mb-2" />
            <CardTitle className="text-2xl">{t.verifyEmailTitle}</CardTitle>
            <CardContent className="text-center">
              We've sent a verification link to <strong>{user?.email || 'your email'}</strong>.
            </CardContent>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t.verifyEmailInstructions}
            </p>
            <Button onClick={handleResendVerification} disabled={isResending || cooldown > 0} className="w-full">
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                t.verifyEmailResendButton
              )}
            </Button>
            <div className="mt-4 text-sm">
              {t.verifyEmailAfterwards},{' '}
              <Link href="/login" className="underline hover:text-primary transition-colors">
                {t.verifyEmailLoginLink}
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </main>
      <TypingTip />
    </div>
  );
}


"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { TypingTip } from '@/components/typing-tip';
import { useLanguage } from '@/contexts/language-provider';
import { Header } from '@/components/header';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth is not initialized.");
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        toast({ title: t.loginSuccess, description: t.loginSuccessDescription });
        router.push('/');
      } else {
        await sendEmailVerification(user);
        toast({ 
          title: t.loginVerificationRequired, 
          description: t.loginVerificationRequiredDescription
        });
        router.push('/verify-email');
      }
    } catch (error: any) {
      console.error("Email Login Failed. Full error:", error);
      let title = t.loginFailed;
      let description = 'An unexpected error occurred. Please try again.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = t.loginFailedInvalid;
      } else if (error.code === 'auth/unauthorized-domain') {
        title = 'Configuration Mismatch Error';
        description = "This error means the API Keys in your .env file do not match the Firebase project where 'localhost' is authorized. Please carefully re-copy all keys from your Firebase project settings into the .env file. Even one wrong character will cause this error.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
      }
      else {
        description = error.message;
      }
      
      toast({
        title: title,
        description: description,
        variant: 'destructive',
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{t.loginTitle}</CardTitle>
            <CardDescription>{t.loginDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
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
                <div className="grid gap-2">
                   <div className="flex items-center">
                    <Label htmlFor="password">{t.loginPasswordLabel}</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      {t.loginForgotPasswordLink}
                    </Link>
                  </div>
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
                  {t.loginButton}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              {t.loginDontHaveAccount}{' '}
              <Link href="/signup" className="underline">
                {t.loginSignUpLink}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <TypingTip />
    </div>
  );
}


'use client';

import { useAuth } from '@/components/auth-provider';
import { ProfilePageClient } from '@/components/profile-page-client';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { PublicProfilePageClient } from '@/components/public-profile-page-client';

export default function ProfilePage() {
  const { user, loading, isAnonymous } = useAuth();
  const params = useParams();
  const hasId = params && params.id;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's an ID in the URL, it's a public profile view.
  if (hasId) {
    return <PublicProfilePageClient userId={params.id as string} />;
  }

  // Otherwise, it's the logged-in user's own profile page.
  // This will show the guest view or the full profile based on auth state.
  return <ProfilePageClient />;
}

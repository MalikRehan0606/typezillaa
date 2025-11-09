
'use client';

import { useParams } from 'next/navigation';
import { PublicProfilePageClient } from '@/components/public-profile-page-client';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  if (!userId) {
    // This case should ideally not happen with Next.js file-based routing, but it's good practice.
    return <div>Invalid Profile URL.</div>;
  }
  
  return <PublicProfilePageClient userId={userId} />;
}

    
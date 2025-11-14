'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ total: 0, today: 0, last7: 0 });

  useEffect(() => {
    if (!user) return;

    async function load() {
      const daysRef = collection(db, 'meta');
      const docs = await getDocs(daysRef);

      let total = 0;
      let today = 0;
      let last7 = 0;

      const todayKey = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      docs.forEach((d) => {
        if (d.id === 'site_stats') {
          total = d.data().total || 0;
        }

        if (d.id === `day_${todayKey}`) {
          today = d.data().views || 0;
        }

        if (d.id.startsWith('day_')) {
          const dateStr = d.data().date;
          if (dateStr) {
            const dt = new Date(dateStr);
            if (dt >= weekAgo) {
              last7 += d.data().views || 0;
            }
          }
        }
      });

      setStats({ total, today, last7 });
    }

    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Site Analytics</h1>

      {/* Admin Link */}
      {user?.uid === "xFii0i0yBtgNkbXLOdvTosvU0OF3" && (
        <Link href="/admin/analytics" className="text-primary underline mb-4 block">
          Admin Analytics
        </Link>
      )}

      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl">Total Views</h2>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl">Today</h2>
          <p className="text-3xl font-bold">{stats.today}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl">Last 7 Days</h2>
          <p className="text-3xl font-bold">{stats.last7}</p>
        </div>
      </div>
    </div>
  );
}

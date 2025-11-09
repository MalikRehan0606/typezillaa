
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useToast } from './use-toast';

let cachedPioneerIds: string[] | null = null;

export function usePioneerUsers() {
  const [pioneerIds, setPioneerIds] = useState<string[]>(cachedPioneerIds || []);
  const { toast } = useToast();

  useEffect(() => {
    if (cachedPioneerIds) {
      return;
    }

    const fetchPioneers = async () => {
      if (!db) return;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);
        const ids = querySnapshot.docs.map(doc => doc.id);
        
        cachedPioneerIds = ids;
        setPioneerIds(ids);

      } catch (error) {
        console.error("Failed to fetch pioneer users:", error);
        // Optionally show a toast, but it's not critical for the main functionality
        // toast({
        //   title: "Could not load pioneer badges",
        //   variant: "destructive",
        // });
      }
    };

    fetchPioneers();
  }, [toast]);

  return pioneerIds;
}

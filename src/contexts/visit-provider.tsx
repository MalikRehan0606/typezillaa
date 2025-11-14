'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, writeBatch, serverTimestamp, increment, collection } from 'firebase/firestore';
import { useAuth } from '@/components/auth-provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const VISIT_SESSION_KEY = 'typezilla_visit_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

const VisitContext = createContext<null>(null);

export function useVisit() {
  return useContext(VisitContext);
}

export function VisitProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (loading || isInitialized || typeof window === 'undefined' || !db) return;

    const initializeVisitor = async () => {
      let visitorId: string | null = null;
      try {
        const sessionData = localStorage.getItem(VISIT_SESSION_KEY);
        const now = Date.now();
        
        let shouldIncrement = false;

        if (sessionData) {
          const { id, timestamp } = JSON.parse(sessionData);
          visitorId = id;
          // If more than 30 minutes have passed, it's a new session.
          if (now - timestamp > SESSION_DURATION) {
            shouldIncrement = true;
          }
        } else {
          // No session data found, this is a first-time visit for this browser.
          visitorId = doc(collection(db, 'visitors')).id;
          shouldIncrement = true;
        }

        if (shouldIncrement && visitorId) {
          const visitorDocRef = doc(db, 'visitors', visitorId);
          const siteStatsRef = doc(db, 'meta', 'site_stats');
          
          const batch = writeBatch(db);

          // Set or update the visitor document
          batch.set(visitorDocRef, { 
              lastVisit: serverTimestamp(),
              ...(user && !user.isAnonymous ? { uid: user.uid } : {})
          }, { merge: true });
          
          // Increment the total visits counter
          batch.set(siteStatsRef, { totalVisits: increment(1) }, { merge: true });
          
          await batch.commit();

          // After a successful write, update the session in localStorage
          localStorage.setItem(VISIT_SESSION_KEY, JSON.stringify({ id: visitorId, timestamp: now }));
        }

      } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: `Transaction on meta/site_stats and visitors/${visitorId}`,
              operation: 'write',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Failed to initialize visitor session:", error);
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeVisitor();
  }, [loading, isInitialized, user]);

  return (
    <VisitContext.Provider value={null}>
      {children}
    </VisitContext.Provider>
  );
}

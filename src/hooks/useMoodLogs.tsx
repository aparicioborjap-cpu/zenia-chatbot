import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from './useAuth.tsx';

export interface MoodLog {
  id: string;
  mood: string;
  timestamp: any;
  userId: string;
}

export function useMoodLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'mood_logs'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moodLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MoodLog[];
      setLogs(moodLogs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { logs, loading };
}

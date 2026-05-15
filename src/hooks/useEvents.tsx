import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from './useAuth.tsx';

export interface CalendarEvent {
  id: string;
  title: string;
  date: any;
  type?: string;
  userId: string;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];
      setEvents(eventList);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addEvent = async (title: string, date: Date, type: string = 'personal') => {
    if (!user) return;
    await addDoc(collection(db, 'events'), {
      title,
      date: Timestamp.fromDate(date),
      type,
      userId: user.uid
    });
  };

  const removeEvent = async (eventId: string) => {
    await deleteDoc(doc(db, 'events', eventId));
  };

  return { events, loading, addEvent, removeEvent };
}

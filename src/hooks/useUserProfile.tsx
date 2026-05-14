import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from './useAuth.tsx';

export interface UserProfile {
  displayName?: string;
  gender?: 'masculino' | 'femenino' | 'no-binario';
  email: string;
  createdAt: any;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const updateName = async (name: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: name
    });
  };

  const updateGender = async (gender: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      gender: gender
    });
  };

  return { profile, loading, updateName, updateGender };
}

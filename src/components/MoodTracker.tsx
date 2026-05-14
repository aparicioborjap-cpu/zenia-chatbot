import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { Check } from 'lucide-react';

const MOODS = [
  { emoji: '😔', label: 'Agobiada', color: 'bg-blue-100 text-blue-600' },
  { emoji: '😤', label: 'Frustrada', color: 'bg-red-100 text-red-600' },
  { emoji: '🤔', label: 'Rumiando', color: 'bg-amber-100 text-amber-600' },
  { emoji: '😌', label: 'Calmada', color: 'bg-green-100 text-green-600' },
  { emoji: '✨', label: 'Empoderada', color: 'bg-purple-100 text-purple-600' },
];

export default function MoodTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleMoodSelect = async (mood: string) => {
    if (!user || loading) return;
    setLoading(true);
    setSelected(mood);
    
    try {
      await addDoc(collection(db, 'mood_logs'), {
        mood,
        userId: user.uid,
        timestamp: serverTimestamp()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 p-8 glass-panel rounded-[2rem] border border-white/40 shadow-lg relative z-10">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold mb-6 text-center">
        ¿Cómo te sientes en este momento{profile?.displayName ? `, ${profile.displayName}` : ''}?
      </h2>
      <div className="flex justify-around gap-2">
        {MOODS.map((m) => (
          <button
            key={m.label}
            onClick={() => handleMoodSelect(m.label)}
            className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${
              selected === m.label ? 'bg-white/60 scale-105 shadow-sm' : 'hover:bg-white/20'
            }`}
          >
            <span className="text-3xl filter drop-shadow-sm">{m.emoji}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
              {m.label}
            </span>
          </button>
        ))}
      </div>
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-center gap-2 text-green-600 text-xs font-semibold"
        >
          <Check className="w-3 h-3" />
          Registrado correctamente
        </motion.div>
      )}
    </div>
  );
}

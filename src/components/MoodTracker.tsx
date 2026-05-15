import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { Check } from 'lucide-react';

const MOODS = [
  { label: 'Agobiad', color: 'bg-blue-400' },
  { label: 'Frustrad', color: 'bg-orange-400' },
  { label: 'Rumiando', color: 'bg-amber-400' },
  { label: 'Calmad', color: 'bg-emerald-400' },
  { label: 'Empoderad', color: 'bg-purple-400' },
  { label: 'Triste', color: 'bg-indigo-400' },
  { label: 'Ansios', color: 'bg-rose-400' },
  { label: 'Enfadad', color: 'bg-red-500' },
  { label: 'Alegre', color: 'bg-pink-400' },
  { label: 'Cansad', color: 'bg-slate-400' },
];

export default function MoodTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const suffix = profile?.gender === 'masculino' ? 'o' : profile?.gender === 'no-binario' ? 'e' : 'a';

  const handleMoodSelect = async (mood: string) => {
    if (!user || loading) return;
    setLoading(true);
    setSelected(mood);
    
    try {
      await addDoc(collection(db, 'mood_logs'), {
        mood: mood.endsWith('d') || mood.endsWith('s') ? `${mood}${suffix}` : mood,
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
    <div className="w-full max-w-2xl mx-auto mb-8 p-10 glass-panel rounded-[2.5rem] border border-white/40 shadow-xl relative z-10">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-rose-500 font-bold mb-2">
          ¿Cómo te sientes en este momento{profile?.displayName ? `, ${profile.displayName}` : ''}?
        </h2>
        <div className="h-0.5 w-8 bg-rose-200 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
        {MOODS.map((m) => {
          const displayLabel = m.label.endsWith('d') || m.label.endsWith('s') ? `${m.label}${suffix}` : m.label;
          return (
            <button
              key={m.label}
              onClick={() => handleMoodSelect(m.label)}
              className="group flex flex-col items-center gap-4 transition-all"
            >
              <div 
                className={`w-12 h-12 rounded-full transition-all duration-500 relative flex items-center justify-center ${
                  selected === m.label 
                    ? `${m.color} scale-110 shadow-lg` 
                    : 'bg-white/40 border border-white/60 hover:border-rose-200'
                }`}
              >
                {selected === m.label && (
                  <motion.div 
                    layoutId="outline"
                    className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"
                  />
                )}
                <div className={`w-3 h-3 rounded-full ${selected === m.label ? 'bg-white' : m.color} opacity-80`}></div>
              </div>
              <span className={`text-[9px] uppercase font-bold tracking-widest text-center leading-tight transition-colors ${
                selected === m.label ? 'text-gray-800' : 'text-gray-400 group-hover:text-rose-400'
              }`}>
                {displayLabel}
              </span>
            </button>
          );
        })}
      </div>
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 flex items-center justify-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest"
        >
          <Check className="w-3 h-3" />
          Estado registrado
        </motion.div>
      )}
    </div>
  );
}

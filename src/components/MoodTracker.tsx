import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { useAuth } from '../hooks/useAuth.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { Check } from 'lucide-react';

// Cada emoción tiene sus tres formas: femenino, masculino, no-binario
const MOODS = [
  { key: 'agobiada',    labels: ['Agobiada', 'Agobiado', 'Agobiade'],    color: 'bg-blue-400' },
  { key: 'frustrada',   labels: ['Frustrada', 'Frustrado', 'Frustrade'],  color: 'bg-orange-400' },
  { key: 'rumiando',    labels: ['Rumiando', 'Rumiando', 'Rumiando'],     color: 'bg-amber-400' },
  { key: 'calmada',     labels: ['Calmada', 'Calmado', 'Calmode'],        color: 'bg-emerald-400' },
  { key: 'empoderada',  labels: ['Empoderada', 'Empoderado', 'Empoderade'], color: 'bg-purple-400' },
  { key: 'triste',      labels: ['Triste', 'Triste', 'Triste'],           color: 'bg-indigo-400' },
  { key: 'ansiosa',     labels: ['Ansiosa', 'Ansioso', 'Ansiose'],        color: 'bg-rose-400' },
  { key: 'enfadada',    labels: ['Enfadada', 'Enfadado', 'Enfadade'],     color: 'bg-red-500' },
  { key: 'alegre',      labels: ['Alegre', 'Alegre', 'Alegre'],           color: 'bg-pink-400' },
  { key: 'cansada',     labels: ['Cansada', 'Cansado', 'Cansade'],        color: 'bg-slate-400' },
];

export default function MoodTracker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const genderIndex = profile?.gender === 'masculino' ? 1 : profile?.gender === 'no-binario' ? 2 : 0;

  const getLabel = (mood: typeof MOODS[0]) => mood.labels[genderIndex];

  const handleMoodSelect = async (mood: typeof MOODS[0]) => {
    if (!user || loading) return;
    setLoading(true);
    setSelected(mood.key);
    try {
      await addDoc(collection(db, 'mood_logs'), {
        mood: getLabel(mood),
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
        {MOODS.map((m) => (
          <button
            key={m.key}
            onClick={() => handleMoodSelect(m)}
            className="group flex flex-col items-center gap-4 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-full transition-all duration-500 relative flex items-center justify-center ${
                selected === m.key
                  ? `${m.color} scale-110 shadow-lg`
                  : 'bg-white/40 border border-white/60 hover:border-rose-200'
              }`}
            >
              {selected === m.key && (
                <motion.div
                  layoutId="outline"
                  className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"
                />
              )}
              <div className={`w-3 h-3 rounded-full ${selected === m.key ? 'bg-white' : m.color} opacity-80`}></div>
            </div>
            <span className={`text-[9px] uppercase font-bold tracking-widest text-center leading-tight transition-colors ${
              selected === m.key ? 'text-gray-800' : 'text-gray-400 group-hover:text-rose-400'
            }`}>
              {getLabel(m)}
            </span>
          </button>
        ))}
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

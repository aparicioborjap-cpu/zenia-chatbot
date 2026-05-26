import { useState, useEffect } from 'react';
import { useMoodLogs } from '../hooks/useMoodLogs.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Inbox, Sparkles, Loader2 } from 'lucide-react';

export default function DiaryView() {
  const { logs, loading } = useMoodLogs();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = async () => {
    if (!user) return;
    if (logs.length < 3) {
      setError('Necesitas al menos 3 registros de ánimo para analizar patrones.');
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      // Obtener conversaciones de Firestore
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        text: doc.data().text,
        sender: doc.data().sender,
        date: doc.data().timestamp?.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      }));

      // Solo mensajes del usuario
      const userMessages = conversations
        .filter(m => m.sender === 'user')
      .map(m => `[${m.date}]: ${m.text.slice(0, 200)}`)
        .join('\n');

      // Mood logs
      const moodSummary = logs.slice(0, 30).map(log => ({
        mood: log.mood,
        date: log.timestamp?.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
        hour: log.timestamp?.toDate().getHours(),
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Analiza estos datos de la usuaria y dame un análisis profundo y personal en 4 partes:

1. **Temas recurrentes**: ¿De qué habla más? ¿Qué situaciones o temas aparecen repetidamente en sus mensajes?
2. **Patrones emocionales**: ¿Qué emociones se asocian a esos temas? ¿Hay momentos del día o días de la semana en que se siente peor?
3. **Conexiones**: ¿Hay relación entre sus temas de conversación y sus registros de ánimo?
4. **Ejercicios personalizados**: 2-3 ejercicios de TCC específicos para SUS patrones concretos, no genéricos

Mensajes de la usuaria en el chat:
${userMessages}

Registros de ánimo:
${JSON.stringify(moodSummary)}

Responde como Zenia: cercana, directa, sin rodeos. Como una amiga que ha leído todo lo que le has contado y te da un análisis honesto y útil. Nada de frases genéricas.`,
          history: [],
          userName: 'Usuario',
          gender: 'femenino',
          upcomingEvents: [],
        }),
      });

      const data = await response.json();
      setAnalysis(data.text);
    } catch (err: any) {
      setError('No se pudo generar el análisis. Inténtalo de nuevo.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-rose-300">Cargando tu diario...</div>;

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-6">
          <Inbox className="w-8 h-8 text-rose-300" />
        </div>
        <h3 className="text-lg font-light text-gray-800 mb-2">Aún no hay registros</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto italic">
          Tu orbe de claridad te espera para empezar a trazar tu camino.
        </p>
      </motion.div>
    );
  }

  const chartData = [...logs].reverse().slice(-7).map(log => ({
    date: log.timestamp?.toDate().toLocaleDateString('es-ES', { weekday: 'short' }),
    val: log.mood === 'Empoderada' ? 5 : log.mood === 'Calmada' ? 4 : log.mood === 'Rumiando' ? 3 : log.mood === 'Frustrada' ? 2 : 1
  }));

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Gráfico */}
      <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold mb-6">Patrón de Ánimo (Últimos registros)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
              <XAxis dataKey="date" stroke="#f472b6" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 6]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#e11d48', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="val" stroke="#f472b6" strokeWidth={3} dot={{ r: 4, fill: '#f472b6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis de patrones */}
      <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold">Análisis de Patrones</h2>
            <p className="text-xs text-gray-400 mt-1">Zenia analiza tus conversaciones y registros para detectar patrones reales</p>
          </div>
          <button
            onClick={analyzePatterns}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50"
          >
            {analyzing ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Analizando...</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Analizar</>
            )}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-rose-400 bg-rose-50 rounded-2xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100/50 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
            >
              {analysis}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Registros recientes */}
      <div className="space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold ml-4">Registros Recientes</h2>
        <div className="grid gap-4">
          {logs.slice(0, 10).map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-5 rounded-2xl border border-white/30 flex items-center justify-between hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl">
                  {log.mood === 'Agobiada' ? '😔' : log.mood === 'Frustrada' ? '😤' : log.mood === 'Rumiando' ? '🤔' : log.mood === 'Calmada' ? '😌' : '✨'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{log.mood}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {log.timestamp?.toDate().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <CalendarIcon className="w-4 h-4 text-rose-200" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

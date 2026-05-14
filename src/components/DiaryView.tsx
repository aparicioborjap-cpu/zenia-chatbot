import { useMoodLogs } from '../hooks/useMoodLogs.tsx';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Inbox } from 'lucide-react';

export default function DiaryView() {
  const { logs, loading } = useMoodLogs();

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

  // Simple data transformation for chart
  const chartData = [...logs].reverse().slice(-7).map(log => ({
    date: log.timestamp?.toDate().toLocaleDateString('es-ES', { weekday: 'short' }),
    val: log.mood === 'Empoderada' ? 5 : log.mood === 'Calmada' ? 4 : log.mood === 'Rumiando' ? 3 : log.mood === 'Frustrada' ? 2 : 1
  }));

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

import { useMoodLogs } from '../hooks/useMoodLogs.tsx';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function CalendarView() {
  const { logs, loading } = useMoodLogs();

  if (loading) return <div className="p-12 text-center text-rose-300">Cargando calendario...</div>;

  if (logs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-rose-300" />
        </div>
        <h3 className="text-lg font-light text-gray-800 mb-2">Calendario de Bienestar Vacío</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto italic">
          Cada charla con Zenia es un punto de luz en tu calendario. Empieza ahora.
        </p>
      </motion.div>
    );
  }

  // Basic grid representation
  const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold">Calendario Emocional</h2>
           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map(d => (
            <div key={d} className="text-center text-[10px] text-rose-300 font-bold mb-2">{d}</div>
          ))}
          {/* Mock days for visual completeness */}
          {Array.from({ length: 31 }).map((_, i) => {
            const hasLog = logs.some(l => l.timestamp?.toDate().getDate() === i + 1);
            return (
              <div 
                key={i} 
                className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                  hasLog ? 'bg-rose-200 text-rose-700 shadow-sm' : 'bg-white/20 text-gray-300'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-rose-100/50">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Leyenda de Bienestar</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-200"></div>
              <span className="text-[10px] text-gray-500 font-medium">Sesión Registrada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40"></div>
              <span className="text-[10px] text-gray-500 font-medium">Sin Registros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

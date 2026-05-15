import { useMoodLogs } from '../hooks/useMoodLogs.tsx';
import { useEvents } from '../hooks/useEvents.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar as CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

export default function CalendarView() {
  const { logs, loading: logsLoading } = useMoodLogs();
  const { events, loading: eventsLoading, addEvent, removeEvent } = useEvents();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const loading = logsLoading || eventsLoading;

  if (loading) return <div className="p-12 text-center text-rose-300 uppercase text-[10px] tracking-widest font-bold">Sincronizando con tu orbe...</div>;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    await addEvent(newTitle, new Date(newDate));
    setNewTitle('');
    setNewDate('');
    setShowAdd(false);
  };

  const hasData = logs.length > 0 || events.length > 0;

  if (!hasData) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 px-6 text-center glass-panel rounded-[2rem] border border-white/40"
        >
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-rose-300" />
          </div>
          <h3 className="text-lg font-light text-gray-800 mb-2">Calendario de Bienestar Vacío</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto italic mb-8">
            Cada charla con Zenia o acontecimiento importante es un punto de luz en tu camino.
          </p>
          <button 
            onClick={() => setShowAdd(true)}
            className="px-8 py-3 bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Registrar Acontecimiento
          </button>
        </motion.div>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg"
            >
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="¿Qué va a pasar? (ej: Entrevista, Examen, Cita...)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full glass-input rounded-2xl py-3 px-6 text-sm outline-hidden"
                />
                <input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full glass-input rounded-2xl py-3 px-6 text-sm outline-hidden"
                />
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-3 bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest">Guardar</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold">Calendario Emocional</h2>
           <button 
             onClick={() => setShowAdd(!showAdd)}
             className="p-2 bg-rose-50 text-rose-400 rounded-full hover:bg-rose-100 transition-all"
           >
             <Plus className="w-4 h-4" />
           </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleAddSubmit} className="space-y-4 p-4 bg-white/30 rounded-3xl border border-rose-100">
                <input 
                  type="text" 
                  placeholder="¿Qué quieres agendar?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full glass-input rounded-2xl py-3 px-6 text-sm outline-hidden"
                />
                <input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full glass-input rounded-2xl py-3 px-6 text-sm outline-hidden"
                />
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-3 bg-rose-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest">Añadir al Orbe</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {days.map(d => (
            <div key={d} className="text-center text-[10px] text-rose-300 font-bold mb-2">{d}</div>
          ))}
          
          {(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const grid = [];
            
            // Empty spaces before the first day of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
              grid.push(<div key={`empty-${i}`} className="aspect-square"></div>);
            }
            
            // Actual days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const hasLog = logs.some(l => {
                const d = l.timestamp?.toDate();
                return d && d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
              });
              const hasEvent = events.some(e => {
                const d = e.date?.toDate();
                return d && d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
              });
              
              grid.push(
                <div 
                  key={day} 
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all relative ${
                    hasLog ? 'bg-rose-200 text-rose-700 shadow-sm' : 'bg-white/20 text-gray-300'
                  }`}
                >
                  {day}
                  {hasEvent && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_5px_rgba(251,113,133,0.8)]" />}
                </div>
              );
            }
            
            return grid;
          })()}
        </div>

        <div className="mt-8 pt-8 border-t border-rose-100/50">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Leyenda</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-200"></div>
              <span className="text-[10px] text-gray-500 font-medium">Conversación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.8)]"></div>
              <span className="text-[10px] text-gray-500 font-medium">Acontecimiento</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold ml-4">Próximos Acontecimientos</h3>
        <div className="grid gap-4">
          {events.map((event) => (
            <motion.div 
              key={event.id}
              className="glass-panel p-5 rounded-2xl border border-white/30 flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-rose-50 rounded-xl">
                   <Clock className="w-4 h-4 text-rose-400" />
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {event.date?.toDate().toLocaleDateString('es-ES', { dateStyle: 'long' })}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => removeEvent(event.id)}
                className="p-2 text-rose-200 hover:text-rose-400 transition-colors"
                title="Eliminar del calendario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-10 glass-panel border border-dashed border-rose-200/50 rounded-2xl">
               <p className="text-xs text-rose-300 italic">No hay acontecimientos agendados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


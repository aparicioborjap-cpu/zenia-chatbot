import { useAuth } from '../hooks/useAuth.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { useState } from 'react';
import { Trash2, User, ShieldCheck } from 'lucide-react';
import { deleteDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.ts';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { profile, updateName, updateGender } = useUserProfile();
  const [newName, setNewName] = useState(profile?.displayName || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    await updateName(newName.trim());
  };

  const handleUpdateGender = async (gender: 'femenino' | 'masculino' | 'no-binario') => {
    await updateGender(gender);
  };

  const clearHistory = async () => {
    if (!user) return;
    if (!confirm('¿Seguro que quieres borrar todo el historial de conversaciones? Esta acción no se puede deshacer.')) return;
    
    setIsDeleting(true);
    try {
      const q = query(collection(db, 'conversations'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'conversations', d.id)));
      await Promise.all(deletePromises);
      alert('Historial borrado');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-lg space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <User className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold">Ajustes de Perfil</h2>
        </div>

        <section className="space-y-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Tu Nombre de Identidad</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 glass-input rounded-2xl py-3 px-6 text-sm outline-hidden focus:ring-2 ring-rose-200/50"
              placeholder="¿Cómo quieres que te llame?"
            />
            <button 
              onClick={handleUpdateName}
              className="px-6 py-2 bg-rose-400 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95 shadow-sm"
            >
              Guardar
            </button>
          </div>
        </section>

        <section className="space-y-4 border-t border-rose-100/50 pt-8">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1 mb-2">Preferencia de Tratamiento</label>
          <div className="flex gap-3">
            {['femenino', 'masculino', 'no-binario'].map((g) => (
              <button
                key={g}
                onClick={() => handleUpdateGender(g as any)}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  profile?.gender === g 
                    ? 'bg-rose-400 text-white shadow-md' 
                    : 'bg-white/40 text-rose-300 hover:bg-white/60'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-rose-100/50 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Borrar Historial</h3>
              <p className="text-xs text-gray-400 mt-1">Elimina permanentemente todos tus chats con Zenia.</p>
            </div>
            <button 
              onClick={clearHistory}
              disabled={isDeleting}
              className="p-3 bg-white/50 border border-rose-100 text-rose-400 rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </section>

        <section className="space-y-4 border-t border-rose-100/50 pt-8">
           <div className="flex items-center gap-2 text-rose-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Privacidad y Seguridad</span>
           </div>
           <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
             Tu UID único asegura que solo tú puedas acceder a tus registros de TCC. Todos los datos están encriptados en tránsito y en reposo.
           </p>
        </section>

        <button 
          onClick={logout}
          className="w-full py-4 bg-white/30 border border-rose-100 text-rose-500 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-rose-50 transition-all active:scale-95 mt-4"
        >
          Cerrar Sesión Corriente
        </button>
      </div>
    </div>
  );
}

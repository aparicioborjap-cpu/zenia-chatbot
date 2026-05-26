import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { useState } from 'react';
import AuthModal from './AuthModal.tsx';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'diario', label: 'Diario' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'ajustes', label: 'Ajustes' },
  ];

  return (
    <>
      <header className="w-full bg-white/40 backdrop-blur-md border-b border-white/20 fixed top-0 z-50">
        {/* Fila superior */}
        <div className="flex items-center justify-between px-4 md:px-10 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 shadow-[0_0_20px_rgba(244,114,182,0.6)]"></div>
            <h1 className="text-xl font-light tracking-tight text-gray-800">Zenia</h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold hidden sm:block">
                  {profile?.displayName || 'Usuario'}
                </p>
                <div
                  className="w-10 h-10 rounded-full border border-white/60 bg-white/20 flex items-center justify-center text-gray-700 italic font-serif cursor-pointer hover:bg-white/40 transition-colors uppercase text-sm"
                  onClick={logout}
                  title="Cerrar sesión"
                >
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-400 text-white text-xs font-medium rounded-full hover:bg-rose-500 transition-all shadow-md active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Barra de navegación inferior en móvil */}
        {user && (
          <div className="flex items-center px-2 pb-2 gap-1 overflow-x-auto scrollbar-hide md:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === item.id
                    ? 'bg-rose-400 text-white'
                    : 'text-rose-300 hover:text-rose-500 hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Navegación en desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-2 px-10 pb-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === item.id
                    ? 'bg-rose-400 text-white'
                    : 'text-rose-300 hover:text-rose-500 hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

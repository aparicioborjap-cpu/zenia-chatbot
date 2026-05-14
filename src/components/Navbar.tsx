import { LogIn, LogOut, Heart } from 'lucide-react';
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
      <header className="h-20 w-full flex items-center justify-between px-10 bg-white/40 backdrop-blur-md border-b border-white/20 fixed top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-pink-400 to-rose-300 shadow-[0_0_20px_rgba(244,114,182,0.6)]"></div>
            <h1 className="text-2xl font-light tracking-tight text-gray-800 hidden md:block">Zenia</h1>
          </div>

          {user && (
            <nav className="flex items-center gap-2 md:gap-4 ml-2">
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
            </nav>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <div className="text-right hidden lg:block">
                <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Sesión Activa</p>
                <p className="text-sm text-gray-600">{profile?.displayName || 'Usuario'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full border border-white/60 bg-white/20 flex items-center justify-center text-gray-700 italic font-serif cursor-pointer hover:bg-white/40 transition-colors uppercase"
                  title={profile?.displayName || 'Usuario'}
                  onClick={logout}
                >
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-400 text-white text-sm font-medium rounded-full hover:bg-rose-500 transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </header>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { useUserProfile } from './hooks/useUserProfile.tsx';
import Navbar from './components/Navbar.tsx';
import Orbe from './components/Orbe.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import MoodTracker from './components/MoodTracker.tsx';
import DiaryView from './components/DiaryView.tsx';
import CalendarView from './components/CalendarView.tsx';
import SettingsView from './components/SettingsView.tsx';
import AuthModal from './components/AuthModal.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState('inicio');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loading = authLoading || (user && profileLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quartz-50">
        <div className="w-12 h-12 border-4 border-quartz-200 border-t-quartz-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pb-12 relative overflow-x-hidden">
      {/* Background Decorative Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 bg-gradient-to-tr from-pink-300 to-rose-200 rounded-full blur-[120px] pointer-events-none" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 w-full max-w-5xl px-6 flex flex-col items-center pt-28 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' ? (
            <motion.div 
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center"
            >
              <section className="pb-12 text-center space-y-2">
                <Orbe />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1 className="text-4xl font-light text-gray-800 tracking-tight mb-2">
                    {profile?.displayName ? `Bienvenida, ${profile.displayName}` : 'Bienvenida'}
                  </h1>
                  <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed uppercase tracking-widest font-medium">
                    Sinceridad Radical · Basado en TCC
                  </p>
                </motion.div>
              </section>

              {user ? (
                <motion.div 
                  className="w-full space-y-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <MoodTracker />
                  <ChatInterface />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center p-16 glass-panel rounded-[2rem] border border-white/40 gap-8 max-w-lg text-center">
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                      Inicia sesión para que pueda realizar un seguimiento de tus patrones de rumiación y recordar nuestras sesiones previas.
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Privacidad Radical · TCC Basada en Datos
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAuthOpen(true)}
                    className="px-10 py-4 bg-rose-400 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-rose-500 transition-all hover:scale-105 active:scale-95"
                  >
                    Empezar mi Camino
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'diario' ? (
            <DiaryView key="diario" />
          ) : activeTab === 'calendario' ? (
            <CalendarView key="calendario" />
          ) : (
            <SettingsView key="ajustes" />
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-center px-6">
        <p className="text-[10px] text-quartz-400 uppercase tracking-widest font-semibold">
          Zenia Wellness • Basado en Evidencia Realista
        </p>
      </footer>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

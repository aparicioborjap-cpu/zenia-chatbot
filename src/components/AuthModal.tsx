import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error con Google');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/40"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-pink-400 to-rose-300 shadow-[0_0_20px_rgba(244,114,182,0.4)] mb-4"></div>
            <h2 className="text-2xl font-light text-gray-800 tracking-tight">
              {isRegister ? 'Crea tu cuenta' : 'Bienvenida de nuevo'}
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-2">
              Tu espacio de claridad personal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input 
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 ring-rose-200/50 outline-hidden transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
              <input 
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 ring-rose-200/50 outline-hidden transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
              <input 
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 ring-rose-200/50 outline-hidden transition-all"
              />
            </div>

            {error && (
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-400 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-rose-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isRegister ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="px-4 bg-white text-gray-400">O continúa con</span>
            </div>
          </div>

          <button 
            onClick={handleGoogle}
            className="w-full py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-50" alt="Google" />
            Google Workspace
          </button>

          <p className="mt-8 text-center text-xs text-gray-400">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta aún?'}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-rose-400 font-bold hover:underline"
            >
              {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

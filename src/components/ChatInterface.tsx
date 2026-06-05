import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';
import { useChat } from '../hooks/useChat.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { useEvents } from '../hooks/useEvents.tsx';
import { getZeniaResponseStream } from '../services/zeniaService.ts';
import { motion, AnimatePresence } from 'motion/react';

// Helper: devuelve etiqueta de día (Hoy, Ayer, o fecha)
function getDayLabel(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDay.getTime() === today.getTime()) return 'Hoy';
  if (msgDay.getTime() === yesterday.getTime()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getTimeLabel(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatInterface() {
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { profile, loading: profileLoading, updateName, updateGender } = useUserProfile();
  const { events } = useEvents();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!profileLoading && !chatLoading && messages.length === 0 && !profile?.displayName) {
      const welcome = async () => {
        setIsTyping(true);
        setTimeout(async () => {
          await sendMessage("¡Hola! Soy Zenia, tu espacio de calma y claridad. Mi misión es estar a tu lado para ayudarte a desenredar esos nudos mentales que a veces nos complican el día, usando herramientas de Terapia Cognitivo-Conductual.\n\nPara que podamos empezar este camino juntos con mucha confianza, ¿cómo te llamas y cómo prefieres que me dirija a ti (femenino, masculino o neutro)? Me hace mucha ilusión conocerte.", "zenia");
          setIsTyping(false);
        }, 1000);
      };
      welcome();
    }
  }, [profileLoading, chatLoading, messages.length, profile?.displayName, sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, error, streamingText]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  // Voz
  const startListening = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Tu navegador no soporta el micrófono. Usa Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceError('Permiso de micrófono denegado. Actívalo en el navegador.');
      } else if (event.error !== 'no-speech') {
        setVoiceError('Error al escuchar. Inténtalo de nuevo.');
      }
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    if (isListening) stopListening();

    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);
    setError(null);
    setVoiceError(null);

    try {
      await sendMessage(userMsg, 'user');

      if (!profile?.displayName && messages.length <= 2) {
        const lastZeniaMsg = messages.findLast(m => m.sender === 'zenia');
        if (lastZeniaMsg?.text.includes('¿cómo te llamas?')) {
          const lowerMsg = userMsg.toLowerCase();
          let detectedGender: 'masculino' | 'femenino' | 'no-binario' = 'femenino';
          if (lowerMsg.includes('masculino') || lowerMsg.includes('hombre') || lowerMsg.includes('chico') || lowerMsg.includes('él')) detectedGender = 'masculino';
          else if (lowerMsg.includes('neutro') || lowerMsg.includes('binario') || lowerMsg.includes('elle')) detectedGender = 'no-binario';
          const name = userMsg.length < 15 ? userMsg : userMsg.split(/[ ,.!\n]/)[0];
          await updateName(name);
          await updateGender(detectedGender);
        }
      }

      // Memoria: últimos 30 mensajes para contexto
      const history = messages
        .filter(m => !(m.sender === 'user' && m.text === userMsg))
        .slice(-30)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);

      const upcomingEvents = events
        .filter(e => {
          const d = e.date?.toDate();
          return d && d >= now && d <= in30Days;
        })
        .map(e => ({
          title: e.title,
          date: e.date?.toDate().toLocaleDateString('es-ES', { dateStyle: 'medium' })
        }));

      setStreamingText("");
      const aiResponse = await getZeniaResponseStream(
        userMsg,
        history,
        profile?.displayName || 'Usuario',
        profile?.gender || 'femenino',
        upcomingEvents,
        (chunk) => {
          setStreamingText(prev => (prev || "") + chunk);
        }
      );

      if (aiResponse) {
        await sendMessage(aiResponse, 'zenia');
      }
      setStreamingText(null);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Lo siento, hubo un error al conectar con Zenia. Por favor, inténtalo de nuevo.");
      setStreamingText(null);
    } finally {
      setIsTyping(false);
    }
  };

  // Agrupar mensajes por día para separadores
  const renderMessages = () => {
    const items: React.ReactNode[] = [];
    let lastDayLabel = '';

    messages.forEach((msg) => {
      const dayLabel = getDayLabel(msg.timestamp);
      if (dayLabel && dayLabel !== lastDayLabel) {
        lastDayLabel = dayLabel;
        items.push(
          <div key={`day-${dayLabel}`} className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-rose-100/60" />
            <span className="text-[10px] text-rose-300 uppercase tracking-widest font-bold px-2">
              {dayLabel}
            </span>
            <div className="flex-1 h-px bg-rose-100/60" />
          </div>
        );
      }

      items.push(
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.sender === 'zenia' && (
            <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)] mt-1" />
          )}
          <div className="flex flex-col gap-1 max-w-[85%]">
            <div
              className={`px-5 py-4 rounded-3xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-rose-400 text-white rounded-tr-none shadow-md'
                  : 'bg-white/80 backdrop-blur-sm border border-rose-100/50 text-neutral-800 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.sender === 'zenia' && (
                <p className="text-rose-400 font-bold mb-2 text-xs uppercase tracking-widest">Zenia</p>
              )}
              <div className={msg.sender === 'user' ? 'text-white' : 'markdown-body'}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
            <span className={`text-[10px] text-gray-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'} px-1`}>
              {getTimeLabel(msg.timestamp)}
            </span>
          </div>
        </motion.div>
      );
    });

    return items;
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden relative z-10">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-3 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {renderMessages()}

          {/* Streaming */}
          {streamingText !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)] mt-1" />
              <div className="max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed bg-white/80 backdrop-blur-sm border border-rose-100/50 text-neutral-800 rounded-tl-none shadow-sm">
                <p className="text-rose-400 font-bold mb-2 text-xs uppercase tracking-widest">Zenia</p>
                <div className="markdown-body">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing */}
        {isTyping && streamingText === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start gap-3"
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)] mt-1 opacity-50" />
            <div className="bg-white/80 border border-rose-100/50 px-5 py-3 rounded-3xl rounded-tl-none italic text-rose-400 text-xs flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3 h-3 animate-spin" />
              Zenia está pensando...
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-3 rounded-2xl text-xs font-medium max-w-[90%] text-center shadow-sm">
              {error}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 flex flex-col gap-2">
        <AnimatePresence>
          {voiceError && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-400 text-center px-2"
            >
              {voiceError}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-xs text-rose-400 font-medium"
            >
              <motion.div
                className="w-2 h-2 bg-rose-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              Escuchando... Habla ahora
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 items-end">
          <motion.button
            type="button"
            onClick={toggleVoice}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all flex-shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white'
                : 'bg-rose-100 text-rose-400 hover:bg-rose-200'
            }`}
            title={isListening ? 'Parar micrófono' : 'Hablar'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          <div className="relative flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={
                isListening
                  ? '🎤 Te estoy escuchando...'
                  : !profile?.displayName
                  ? 'Cuéntame cómo te llamas...'
                  : '¿Qué hay en tu mente hoy? Te escucho...'
              }
              className="w-full glass-input rounded-2xl py-4 pl-8 pr-16 outline-hidden focus:ring-2 ring-rose-200/50 text-neutral-700 placeholder:text-neutral-400 transition-all text-sm resize-none min-h-[56px] flex items-center"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 bottom-2 w-10 h-10 bg-rose-400 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-500 disabled:opacity-50 transition-all active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '../hooks/useChat.tsx';
import { useUserProfile } from '../hooks/useUserProfile.tsx';
import { getZeniaResponse } from '../services/zeniaService.ts';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatInterface() {
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { profile, loading: profileLoading, updateName, updateGender } = useUserProfile();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-welcome for new users
  useEffect(() => {
    if (!profileLoading && !chatLoading && messages.length === 0 && !profile?.displayName) {
      const welcome = async () => {
        setIsTyping(true);
        setTimeout(async () => {
          await sendMessage("¡Hola! Soy Zenia, tu orbe de claridad y bienestar. Mi función es acompañarte usando la Terapia Cognitivo-Conductual para ayudarte a ver las cosas con más lógica y menos miedo.\n\nAntes de empezar, ¿cómo te llamas y cómo prefieres que me dirija a ti (femenino, masculino o neutro)? Me gustaría personalizar nuestro espacio.", "zenia");
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
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user msg to Firestore
      await sendMessage(userMsg, 'user');

      // 2. Identify if this is the initial response (name and gender)
      if (!profile?.displayName && messages.length <= 2) {
        const lastZeniaMsg = messages.findLast(m => m.sender === 'zenia');
        if (lastZeniaMsg?.text.includes('¿cómo te llamas?')) {
          const lowerMsg = userMsg.toLowerCase();
          let detectedGender: 'masculino' | 'femenino' | 'no-binario' = 'femenino';
          if (lowerMsg.includes('masculino') || lowerMsg.includes('hombre') || lowerMsg.includes('chico') || lowerMsg.includes('él')) detectedGender = 'masculino';
          else if (lowerMsg.includes('neutro') || lowerMsg.includes('binario') || lowerMsg.includes('elle')) detectedGender = 'no-binario';
          
          // Simple name extraction: first word or the whole thing if short
          const name = userMsg.length < 15 ? userMsg : userMsg.split(/[ ,.!\n]/)[0];
          await updateName(name);
          await updateGender(detectedGender);
        }
      }

      // 3. Get history for AI context (last 15 messages)
      const history = messages.slice(-15).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

      // 4. Get AI response
      const aiResponse = await getZeniaResponse(userMsg, history, profile?.displayName || 'Usuario', profile?.gender || 'femenino');

      // 5. Save AI response to Firestore
      if (aiResponse) {
        await sendMessage(aiResponse, 'zenia');
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden relative z-10">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'zenia' && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)] mt-1" />
              )}
              <div
                className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'glass-user-msg text-neutral-800 rounded-tr-none'
                    : 'glass-zenia-msg text-neutral-800 rounded-tl-none'
                }`}
              >
                {msg.sender === 'zenia' && <p className="text-rose-900 font-bold mb-2 text-xs uppercase tracking-widest">Zenia</p>}
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start gap-3"
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-pink-500 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)] mt-1 opacity-50" />
            <div className="glass-zenia-msg px-5 py-3 rounded-3xl rounded-tl-none italic text-rose-700 text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Zenia está analizando...
            </div>
          </motion.div>
        )}
      </div>

      <form 
        onSubmit={handleSend}
        className="p-6 flex gap-3 items-center"
      >
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!profile?.displayName ? "Escribe tu nombre..." : "Cuéntame qué estás rumiando ahora..."}
            className="w-full glass-input rounded-full py-4 px-8 outline-hidden focus:ring-2 ring-rose-200/50 text-neutral-700 placeholder:text-neutral-400 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-rose-400 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-500 disabled:opacity-50 transition-all active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

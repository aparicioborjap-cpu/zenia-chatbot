import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';

const techniques = [
  {
    id: 'respiracion-caja',
    emoji: '🟦',
    title: 'Respiración en Caja',
    subtitle: '4-4-4-4',
    description: 'Regula tu sistema nervioso con este ritmo de respiración.',
    steps: [
      { text: 'Inhala por la nariz', duration: 4 },
      { text: 'Mantén el aire', duration: 4 },
      { text: 'Exhala por la boca', duration: 4 },
      { text: 'Mantén vacío', duration: 4 },
    ],
  },
  {
    id: 'grounding-54321',
    emoji: '🌿',
    title: 'Técnica 5-4-3-2-1',
    subtitle: 'Grounding',
    description: 'Ancla tu mente al presente usando tus sentidos.',
    steps: [
      { text: 'Nombra 5 cosas que puedes VER ahora mismo', duration: 15 },
      { text: 'Nombra 4 cosas que puedes TOCAR', duration: 15 },
      { text: 'Nombra 3 cosas que puedes OÍR', duration: 15 },
      { text: 'Nombra 2 cosas que puedes OLER', duration: 15 },
      { text: 'Nombra 1 cosa que puedes SABOREAR', duration: 15 },
    ],
  },
  {
    id: 'respiracion-478',
    emoji: '🌙',
    title: 'Respiración 4-7-8',
    subtitle: 'Calma profunda',
    description: 'Activa tu respuesta de relajación natural.',
    steps: [
      { text: 'Inhala por la nariz', duration: 4 },
      { text: 'Mantén el aire', duration: 7 },
      { text: 'Exhala lentamente por la boca', duration: 8 },
    ],
  },
  {
    id: 'relajacion-muscular',
    emoji: '💪',
    title: 'Relajación Muscular',
    subtitle: 'Progresiva',
    description: 'Libera la tensión física de tu cuerpo.',
    steps: [
      { text: 'Tensa los pies y piernas durante 5 segundos, luego suelta', duration: 10 },
      { text: 'Tensa el abdomen y espalda, luego suelta', duration: 10 },
      { text: 'Tensa brazos y manos, luego suelta', duration: 10 },
      { text: 'Tensa hombros y cuello, luego suelta', duration: 10 },
      { text: 'Tensa la cara, luego suelta. Siente tu cuerpo completamente relajado', duration: 10 },
    ],
  },
  {
    id: 'afirmaciones',
    emoji: '✨',
    title: 'Afirmaciones',
    subtitle: 'Anclaje positivo',
    description: 'Recuérdate quién eres cuando todo se siente difícil.',
    steps: [
      { text: 'Esto que siento es temporal. Pasará.', duration: 8 },
      { text: 'Soy capaz de manejar momentos difíciles.', duration: 8 },
      { text: 'No tengo que tenerlo todo bajo control ahora mismo.', duration: 8 },
      { text: 'Merezco calma y compasión, especialmente de mí misma.', duration: 8 },
      { text: 'Estoy a salvo en este momento.', duration: 8 },
    ],
  },
];

export default function EmergencyKit() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<typeof techniques[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);

  const startTechnique = (technique: typeof techniques[0]) => {
    setSelectedTechnique(technique);
    setCurrentStep(0);
    setIsRunning(false);
    setTimer(0);
  };

  const startStep = () => {
    if (!selectedTechnique) return;
    setIsRunning(true);
    const duration = selectedTechnique.steps[currentStep].duration;
    setTimer(duration);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextStep = () => {
    if (!selectedTechnique) return;
    if (currentStep < selectedTechnique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setTimer(0);
      setIsRunning(false);
    } else {
      setSelectedTechnique(null);
      setCurrentStep(0);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-rose-400 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 transition-all active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Kit de Emergencia"
      >
        <Heart className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); setSelectedTechnique(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-rose-100/50">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Kit de Emergencia</h2>
                  <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">Herramientas de calma inmediata</p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setSelectedTechnique(null); }}
                  className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {!selectedTechnique ? (
                    // Lista de técnicas
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {techniques.map((technique) => (
                        <button
                          key={technique.id}
                          onClick={() => startTechnique(technique)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-rose-100/50 hover:bg-rose-50/50 transition-all text-left active:scale-95"
                        >
                          <span className="text-2xl">{technique.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{technique.title}</p>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">{technique.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    // Técnica activa paso a paso
                    <motion.div
                      key="technique"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <button
                        onClick={() => { setSelectedTechnique(null); setCurrentStep(0); }}
                        className="text-[10px] text-rose-300 uppercase tracking-widest font-bold hover:text-rose-500"
                      >
                        ← Volver
                      </button>

                      <div className="text-center space-y-2">
                        <span className="text-4xl">{selectedTechnique.emoji}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{selectedTechnique.title}</h3>
                        <p className="text-xs text-gray-500">{selectedTechnique.description}</p>
                      </div>

                      {/* Progreso */}
                      <div className="flex gap-1 justify-center">
                        {selectedTechnique.steps.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all ${
                              i < currentStep ? 'bg-rose-400 w-6' :
                              i === currentStep ? 'bg-rose-300 w-8' : 'bg-rose-100 w-4'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Paso actual */}
                      <div className="bg-rose-50/50 rounded-2xl p-6 text-center space-y-4 border border-rose-100/50">
                        <p className="text-xs text-rose-400 uppercase tracking-widest font-bold">
                          Paso {currentStep + 1} de {selectedTechnique.steps.length}
                        </p>
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {selectedTechnique.steps[currentStep].text}
                        </p>
                        {timer > 0 && (
                          <div className="text-4xl font-light text-rose-400">{timer}s</div>
                        )}
                      </div>

                      {/* Botones */}
                      <div className="flex gap-3">
                        {!isRunning && timer === 0 && (
                          <button
                            onClick={startStep}
                            className="flex-1 py-3 bg-rose-400 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95"
                          >
                            Empezar
                          </button>
                        )}
                        {!isRunning && timer === 0 && currentStep > 0 && (
                          <button
                            onClick={nextStep}
                            className="flex-1 py-3 bg-white border border-rose-200 text-rose-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                          >
                            {currentStep === selectedTechnique.steps.length - 1 ? '¡Listo! ✨' : 'Siguiente →'}
                          </button>
                        )}
                        {isRunning && (
                          <div className="flex-1 py-3 bg-rose-50 text-rose-300 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                            Respira...
                          </div>
                        )}
                        {!isRunning && timer === 0 && currentStep > 0 && currentStep < selectedTechnique.steps.length && (
                          null
                        )}
                      </div>
                      {!isRunning && timer === 0 && (
                        <button
                          onClick={nextStep}
                          className="w-full py-3 bg-white border border-rose-200 text-rose-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                        >
                          {currentStep === selectedTechnique.steps.length - 1 ? '¡Terminado! ✨' : 'Siguiente paso →'}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

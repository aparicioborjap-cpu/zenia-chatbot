import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';

const techniques = [
  {
    id: 'respiracion-caja',
    emoji: '🟦',
    title: 'Respiración en Caja',
    subtitle: '4-4-4-4',
    description: 'Regula tu sistema nervioso con este ritmo de respiración.',
    autoPlay: true,
    steps: [
      { text: 'Inhala por la nariz', duration: 4 },
      { text: 'Mantén el aire', duration: 4 },
      { text: 'Exhala por la boca', duration: 4 },
      { text: 'Mantén vacío', duration: 4 },
    ],
  },
  {
    id: 'respiracion-478',
    emoji: '🌙',
    title: 'Respiración 4-7-8',
    subtitle: 'Calma profunda',
    description: 'Activa tu respuesta de relajación natural.',
    autoPlay: true,
    steps: [
      { text: 'Inhala por la nariz', duration: 4 },
      { text: 'Mantén el aire', duration: 7 },
      { text: 'Exhala lentamente por la boca', duration: 8 },
    ],
  },
  {
    id: 'grounding-54321',
    emoji: '🌿',
    title: 'Técnica 5-4-3-2-1',
    subtitle: 'Grounding',
    description: 'Ancla tu mente al presente usando tus sentidos.',
    autoPlay: false,
    steps: [
      { text: 'Mira a tu alrededor. Nombra 5 cosas que puedes VER ahora mismo', duration: 20 },
      { text: 'Toca algo cerca. Nombra 4 cosas que puedes TOCAR', duration: 20 },
      { text: 'Quédate quieta. Nombra 3 cosas que puedes OÍR', duration: 20 },
      { text: 'Respira hondo. Nombra 2 cosas que puedes OLER', duration: 20 },
      { text: 'Nombra 1 cosa que puedes SABOREAR ahora mismo', duration: 20 },
    ],
  },
  {
    id: 'relajacion-muscular',
    emoji: '💪',
    title: 'Relajación Muscular',
    subtitle: 'Progresiva',
    description: 'Libera la tensión física de tu cuerpo paso a paso.',
    autoPlay: true,
    steps: [
      { text: 'Tensa los pies y piernas con fuerza...', duration: 5 },
      { text: 'Suelta. Siente cómo se relajan', duration: 8 },
      { text: 'Tensa el abdomen y la espalda...', duration: 5 },
      { text: 'Suelta. Respira', duration: 8 },
      { text: 'Tensa brazos y manos en puños...', duration: 5 },
      { text: 'Suelta. Deja caer los brazos', duration: 8 },
      { text: 'Tensa hombros hacia las orejas...', duration: 5 },
      { text: 'Suelta. Siente el peso caer', duration: 8 },
      { text: 'Arruga la cara entera...', duration: 5 },
      { text: 'Suelta. Tu cuerpo está completamente relajado 🌸', duration: 10 },
    ],
  },
  {
    id: 'afirmaciones',
    emoji: '✨',
    title: 'Afirmaciones',
    subtitle: 'Anclaje positivo',
    description: 'Recuérdate quién eres cuando todo se siente difícil.',
    autoPlay: true,
    steps: [
      { text: 'Esto que siento es temporal. Pasará.', duration: 8 },
      { text: 'Soy capaz de manejar momentos difíciles.', duration: 8 },
      { text: 'No tengo que tenerlo todo bajo control ahora mismo.', duration: 8 },
      { text: 'Merezco calma y compasión, especialmente de mí misma.', duration: 8 },
      { text: 'Estoy a salvo en este momento.', duration: 8 },
    ],
  },
  {
    id: 'frio',
    emoji: '🧊',
    title: 'Técnica del Frío',
    subtitle: 'Reset inmediato',
    description: 'Activa el reflejo de buceo para calmar el sistema nervioso al instante.',
    autoPlay: true,
    steps: [
      { text: 'Ve al baño y abre el grifo de agua fría', duration: 10 },
      { text: 'Moja tus muñecas bajo el agua fría durante 30 segundos', duration: 30 },
      { text: 'Ahora moja tu cara con agua fría', duration: 15 },
      { text: 'Seca tu cara despacio. Respira. Nota cómo tu ritmo cardíaco baja.', duration: 15 },
    ],
  },
  {
    id: 'distraccion',
    emoji: '🧩',
    title: 'Distracción Mental',
    subtitle: 'Corta el bucle',
    description: 'Interrumpe los pensamientos repetitivos con un reto cognitivo.',
    autoPlay: false,
    steps: [
      { text: 'Cuenta hacia atrás desde 100 de 7 en 7: 100, 93, 86...', duration: 30 },
      { text: 'Nombra 10 animales que empiecen por la misma letra. Tómate tu tiempo.', duration: 30 },
      { text: 'Visualiza tu lugar seguro favorito. Descríbelo mentalmente con todo detalle.', duration: 30 },
      { text: 'Bien hecho. El bucle se ha interrumpido. 💛', duration: 10 },
    ],
  },
  {
    id: 'autocompasion',
    emoji: '🤍',
    title: 'Autocompasión',
    subtitle: 'Mano en el corazón',
    description: 'Una práctica suave para momentos de mucho dolor emocional.',
    autoPlay: true,
    steps: [
      { text: 'Pon una mano sobre tu corazón. Siente el calor.', duration: 10 },
      { text: 'Repite en silencio: "Esto duele. El sufrimiento forma parte de la vida."', duration: 10 },
      { text: 'Repite: "Que pueda ser amable conmigo misma en este momento."', duration: 10 },
      { text: 'Repite: "Que pueda darme la compasión que necesito."', duration: 10 },
      { text: 'Quédate así un momento. Siente el calor de tu propia mano. 🌸', duration: 15 },
    ],
  },
];

export default function EmergencyKit() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<typeof techniques[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startStep = (technique: typeof techniques[0], stepIndex: number) => {
    clearTimer();
    const duration = technique.steps[stepIndex].duration;
    setTimer(duration);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          // Avance automático si la técnica es autoPlay
          if (technique.autoPlay) {
            const nextIndex = stepIndex + 1;
            if (nextIndex < technique.steps.length) {
              setCurrentStep(nextIndex);
              startStep(technique, nextIndex);
            } else {
              setIsRunning(false);
              setIsDone(true);
            }
          } else {
            setIsRunning(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = () => {
    if (!selectedTechnique) return;
    setIsDone(false);
    startStep(selectedTechnique, currentStep);
  };

  const handleNext = () => {
    if (!selectedTechnique) return;
    clearTimer();
    const nextIndex = currentStep + 1;
    if (nextIndex < selectedTechnique.steps.length) {
      setCurrentStep(nextIndex);
      setTimer(0);
      setIsRunning(false);
    } else {
      setIsDone(true);
      setIsRunning(false);
    }
  };

  const handleSelectTechnique = (technique: typeof techniques[0]) => {
    clearTimer();
    setSelectedTechnique(technique);
    setCurrentStep(0);
    setTimer(0);
    setIsRunning(false);
    setIsDone(false);
  };

  const handleBack = () => {
    clearTimer();
    setSelectedTechnique(null);
    setCurrentStep(0);
    setTimer(0);
    setIsRunning(false);
    setIsDone(false);
  };

  const handleClose = () => {
    clearTimer();
    setIsOpen(false);
    setSelectedTechnique(null);
    setCurrentStep(0);
    setTimer(0);
    setIsRunning(false);
    setIsDone(false);
  };

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  const progress = selectedTechnique
    ? ((currentStep) / selectedTechnique.steps.length) * 100
    : 0;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-rose-400 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 transition-all active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Kit de Emergencia"
      >
        <Heart className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
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
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-300 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {!selectedTechnique ? (
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
                          onClick={() => handleSelectTechnique(technique)}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-rose-100/50 hover:bg-rose-50/50 transition-all text-left active:scale-95"
                        >
                          <span className="text-2xl">{technique.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{technique.title}</p>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">{technique.subtitle}</p>
                          </div>
                          {technique.autoPlay && (
                            <span className="text-[9px] bg-rose-100 text-rose-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Auto</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="technique"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <button
                        onClick={handleBack}
                        className="text-[10px] text-rose-300 uppercase tracking-widest font-bold hover:text-rose-500"
                      >
                        ← Volver
                      </button>

                      <div className="text-center space-y-1">
                        <span className="text-4xl">{selectedTechnique.emoji}</span>
                        <h3 className="text-lg font-semibold text-gray-800">{selectedTechnique.title}</h3>
                        <p className="text-xs text-gray-500">{selectedTechnique.description}</p>
                        {selectedTechnique.autoPlay && (
                          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">✦ Avance automático</p>
                        )}
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-rose-100 rounded-full h-1.5">
                        <motion.div
                          className="bg-rose-400 h-1.5 rounded-full"
                          animate={{ width: isDone ? '100%' : `${progress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <p className="text-[10px] text-rose-300 text-center uppercase tracking-widest">
                        {isDone ? '¡Completado!' : `Paso ${currentStep + 1} de ${selectedTechnique.steps.length}`}
                      </p>

                      {/* Paso actual */}
                      <AnimatePresence mode="wait">
                        {!isDone ? (
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-rose-50/50 rounded-2xl p-6 text-center space-y-4 border border-rose-100/50"
                          >
                            <p className="text-gray-800 font-medium leading-relaxed text-base">
                              {selectedTechnique.steps[currentStep].text}
                            </p>
                            {timer > 0 && (
                              <motion.div
                                key={timer}
                                initial={{ scale: 1.2, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-5xl font-light text-rose-400"
                              >
                                {timer}
                              </motion.div>
                            )}
                            {isRunning && (
                              <div className="flex justify-center gap-1">
                                {[0,1,2].map(i => (
                                  <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 bg-rose-300 rounded-full"
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-rose-50/50 rounded-2xl p-6 text-center border border-rose-100/50 space-y-2"
                          >
                            <p className="text-3xl">🌸</p>
                            <p className="text-gray-800 font-semibold">¡Lo has hecho genial!</p>
                            <p className="text-xs text-gray-500">Tómate un momento para notar cómo te sientes ahora.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Botones */}
                      <div className="space-y-2">
                        {!isRunning && !isDone && (
                          <button
                            onClick={handleStart}
                            className="w-full py-3 bg-rose-400 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500 transition-all active:scale-95"
                          >
                            {currentStep === 0 ? '▶ Empezar' : '▶ Continuar'}
                          </button>
                        )}
                        {!isRunning && !isDone && !selectedTechnique.autoPlay && currentStep < selectedTechnique.steps.length - 1 && timer === 0 && currentStep > 0 && (
                          <button
                            onClick={handleNext}
                            className="w-full py-3 bg-white border border-rose-200 text-rose-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                          >
                            Siguiente paso →
                          </button>
                        )}
                        {isRunning && (
                          <div className="w-full py-3 bg-rose-50 text-rose-300 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                            {selectedTechnique.autoPlay ? 'Sigue el ritmo...' : 'Respira...'}
                          </div>
                        )}
                        {isDone && (
                          <button
                            onClick={handleBack}
                            className="w-full py-3 bg-white border border-rose-200 text-rose-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                          >
                            Volver al menú
                          </button>
                        )}
                      </div>
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

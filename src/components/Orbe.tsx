import { motion } from 'motion/react';

export default function Orbe() {
  return (
    <div className="relative flex items-center justify-center p-8">
      {/* Outer Glow */}
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-quartz-300/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* The Core Orb */}
      <motion.div
        className="zenia-orb w-24 h-24 rounded-full relative z-10"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-tr from-white/20 to-transparent pointer-events-none"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </div>
  );
}

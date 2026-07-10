import { useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCountdownTick } from '../../audio/audioEngine.js';

function CountdownOverlay({ count }) {
  // Play sound when count changes
  useEffect(() => {
    if (count >= 0) {
      playCountdownTick(count);
    }
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
    >
      {/* Dynamic background darkening */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-1000"
        style={{ opacity: 0.5 + ((10 - count) / 10) * 0.4 }}
      />
      
      {/* Heavy vignette that closes in */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ 
          background: `radial-gradient(circle at center, transparent ${count * 5}%, black ${count * 10 + 20}%)`,
          opacity: 0.8
        }}
      />
      
      {/* Red screen border flash on low counts */}
      <AnimatePresence>
        {count <= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 box-border"
            style={{ border: '8px solid rgba(139,0,0,0.5)', boxShadow: 'inset 0 0 50px rgba(139,0,0,0.8)' }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center">
        <motion.div
          key={count}
          initial={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 
            className="text-8xl md:text-[12rem] leading-none"
            style={{ 
              fontFamily: 'var(--font-family-title)', 
              color: count <= 3 ? 'var(--color-blood-glow)' : 'var(--color-bone)',
              textShadow: count <= 3 
                ? '0 0 40px rgba(255,0,0,0.8), 0 0 80px rgba(139,0,0,1)' 
                : '0 0 20px rgba(184,134,11,0.5)',
              animation: count <= 3 ? 'heartbeat 1s infinite' : 'none'
            }}
          >
            {count}
          </h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-xl md:text-2xl uppercase tracking-[0.5em]"
          style={{ 
            fontFamily: 'var(--font-family-heading)', 
            color: 'var(--color-gold-dim)',
            animation: count <= 3 ? 'flicker 0.2s infinite' : 'none'
          }}
        >
          {count > 3 ? 'Prepare your soul' : 'They are coming'}
        </motion.p>
      </div>

      {/* Extreme camera shake on last second */}
      <AnimatePresence>
        {count === 0 && (
          <motion.div
            initial={{ x: -10, y: 10 }}
            animate={{ 
              x: [10, -10, 15, -15, 0], 
              y: [-10, 10, -15, 15, 0] 
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 bg-white mix-blend-overlay opacity-10"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(CountdownOverlay);

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startAmbience, playThunder } from '../audio/audioEngine.js';

function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  // 0: darkness
  // 1: thunder + fog
  // 2: logo fade in
  // 3: subtitle typewriter
  // 4: buttons fade in
  const [subtitle, setSubtitle] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const subtitleFull = 'Trust no one. Not even the dead.';
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Phase 0: Pure darkness (1.5s)
    setTimeout(() => {
      setPhase(1); // Thunder + fog
    }, 1500);

    // Phase 2: Logo (3.5s)
    setTimeout(() => setPhase(2), 3500);

    // Phase 3: Subtitle typewriter (5s)
    setTimeout(() => {
      setPhase(3);
      setShowCursor(true);
    }, 5000);

    // Phase 4: Buttons (after typewriter)
    setTimeout(() => setPhase(4), 8500);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (phase < 3) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < subtitleFull.length) {
        setSubtitle(subtitleFull.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  const handleStart = () => {
    startAmbience();
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
    >
      {/* Black overlay that fades out to reveal the background scene */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase >= 1 ? 0 : 1 }}
        transition={{ duration: 4 }}
        style={{ background: '#000', zIndex: 0 }}
      />

      {/* Fog overlay that appears */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 4 }}
            className="absolute inset-0 bg-fog pointer-events-none"
            style={{ zIndex: 1 }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Logo */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            >
              <h1 
                className="game-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight"
                style={{ 
                  animation: phase >= 2 ? 'flicker 8s ease-in-out infinite' : 'none',
                }}
              >
                Tales Beyond
                <br />
                <span className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl">The Tomb</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative line */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.4 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="mx-auto my-6 md:my-8"
              style={{
                width: '200px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #8b0000, #b8860b, #8b0000, transparent)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Subtitle with typewriter */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="game-subtitle text-lg sm:text-xl md:text-2xl mt-2"
            >
              {subtitle}
              {showCursor && <span className="typewriter-cursor" />}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="mt-12 md:mt-16"
            >
              <motion.button
                onClick={handleStart}
                className="horror-btn text-lg md:text-xl px-12 md:px-16 py-5 md:py-6"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  letterSpacing: '0.3em',
                  borderColor: 'rgba(184, 134, 11, 0.4)'
                }}
              >
                Enter the Mansion
              </motion.button>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1, duration: 2 }}
                className="mt-8 text-sm"
                style={{ fontFamily: 'var(--font-family-old)', fontStyle: 'italic', color: 'var(--color-bone-dark)' }}
              >
                Click to enable sound
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vignette for intro */}
      <div className="bg-vignette" style={{ zIndex: 5 }} />
    </motion.div>
  );
}

export default memo(IntroScreen);

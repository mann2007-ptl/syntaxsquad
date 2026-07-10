import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound, playHoverSound, playMenuSound } from '../../audio/audioEngine.js';
import HostGameModal from './HostGameModal.jsx';
import JoinGameModal from './JoinGameModal.jsx';

function MainMenu() {
  const { dispatch } = useGame();
  const [showHost, setShowHost] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const openHost = () => {
    playMenuSound();
    setShowHost(true);
  };

  const openJoin = () => {
    playMenuSound();
    setShowJoin(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-center mb-4"
        >
          <h1 
            className="game-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight"
            style={{ animation: 'flicker 10s ease-in-out infinite' }}
          >
            Tales Beyond
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">The Tomb</span>
          </h1>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="mb-4 md:mb-6"
          style={{
            width: '180px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #8b0000, #b8860b, #8b0000, transparent)',
            transformOrigin: 'center'
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="game-subtitle text-base sm:text-lg md:text-xl mb-12 md:mb-16"
        >
          Trust no one. Not even the dead.
        </motion.p>

        {/* Menu Items - simple text style like Fears to Fathom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col gap-4 items-center"
          style={{ fontFamily: 'monospace' }}
        >
          <button
            onClick={openHost}
            className="text-lg transition-colors duration-300 tracking-wider"
            style={{ 
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
            onMouseEnter={(e) => { e.target.style.color = '#fff'; playHoverSound(); }}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >
            Host Game
          </button>

          <button
            onClick={openJoin}
            className="text-lg transition-colors duration-300 tracking-wider"
            style={{ 
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
            onMouseEnter={(e) => { e.target.style.color = '#fff'; playHoverSound(); }}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
          >
            Join Game
          </button>
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 2, duration: 2 }}
          className="absolute bottom-6 text-xs"
          style={{ fontFamily: 'var(--font-family-old)', color: 'var(--color-bone-dark)' }}
        >
          v0.1.0 — Hackathon Build
        </motion.p>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showHost && <HostGameModal onClose={() => setShowHost(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showJoin && <JoinGameModal onClose={() => setShowJoin(false)} />}
      </AnimatePresence>
    </>
  );
}

export default memo(MainMenu);

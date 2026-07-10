import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound, playHoverSound } from '../../audio/audioEngine.js';

function JoinGameModal({ onClose }) {
  const { actions, state } = useGame();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    playerName: '',
    roomCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    if (!form.playerName.trim() || !form.roomCode.trim()) return;
    
    setLoading(true);
    await actions.joinRoom(form);
    setLoading(false);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, roomCode: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl p-10 md:p-12"
        style={{ 
          background: 'rgba(12, 10, 10, 0.98)',
          border: '1px solid rgba(139, 0, 0, 0.3)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl text-stone-100 tracking-wider mb-2" style={{ fontFamily: 'var(--font-family-heading), Cinzel, serif' }}>
            Join Game
          </h2>
          <p className="text-sm text-stone-400" style={{ fontFamily: 'var(--font-family-body), Cormorant Garamond, serif' }}>
            Enter your details and the room code to connect with the investigators
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.2)', marginBottom: '2rem' }} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Name */}
          <div>
            <label className="block mb-2 text-base text-stone-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="enter name..."
              maxLength={20}
              value={form.playerName}
              onChange={(e) => setForm(prev => ({ ...prev, playerName: e.target.value }))}
              onMouseEnter={playHoverSound}
              autoFocus
              required
              className="w-full bg-stone-950/60 outline-none text-lg py-3 px-4 text-stone-100 border border-stone-800 focus:border-red-900/60 transition-colors"
              style={{ 
                fontFamily: 'var(--font-family-old), IM Fell English, serif'
              }}
            />
          </div>

          {/* Room Code */}
          <div>
            <label className="block mb-2 text-base text-stone-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Room Code
            </label>
            <input
              type="text"
              placeholder="_ _ _ _"
              maxLength={4}
              value={form.roomCode}
              onChange={handleCodeChange}
              onMouseEnter={playHoverSound}
              required
              className="w-full bg-stone-950/60 outline-none text-center py-4 text-stone-100 border border-stone-800 focus:border-red-900/60 transition-colors"
              style={{ 
                fontFamily: 'var(--font-family-old), IM Fell English, serif',
                fontSize: '2.5rem',
                letterSpacing: '0.4em'
              }}
            />
          </div>

          {/* Error */}
          {state.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm py-1 text-red-700"
              style={{ fontFamily: 'var(--font-family-body), Cormorant Garamond, serif' }}
            >
              {state.error}
            </motion.p>
          )}

          <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.2)', marginTop: '2rem', marginBottom: '1.5rem' }} />

          {/* Buttons */}
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => { playClickSound(); onClose(); }}
              onMouseEnter={playHoverSound}
              className="text-lg text-stone-400 hover:text-stone-200 transition-colors uppercase tracking-widest"
              style={{ cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-family-heading), Cinzel, serif' }}
            >
              [cancel]
            </button>
            <button
              type="submit"
              disabled={loading || !form.playerName.trim() || form.roomCode.length !== 4}
              onMouseEnter={playHoverSound}
              className="text-lg uppercase tracking-widest transition-colors"
              style={{ 
                color: loading || !form.playerName.trim() || form.roomCode.length !== 4 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)',
                cursor: loading ? 'wait' : 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-family-heading), Cinzel, serif'
              }}
            >
              {loading ? '[joining...]' : '[join room]'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default memo(JoinGameModal);

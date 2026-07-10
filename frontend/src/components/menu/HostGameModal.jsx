import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound, playHoverSound } from '../../audio/audioEngine.js';

function HostGameModal({ onClose }) {
  const { actions, state } = useGame();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hostName: '',
    roomName: '',
    maxPlayers: 4,
    difficulty: 'medium',
    environment: 'haunted-manor',
    isPrivate: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    if (!form.hostName.trim() || !form.roomName.trim()) return;
    
    setLoading(true);
    await actions.createRoom(form);
    setLoading(false);
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
            Host Game
          </h2>
          <p className="text-sm text-stone-400" style={{ fontFamily: 'var(--font-family-body), Cormorant Garamond, serif' }}>
            Create a new session to begin the investigation
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.2)', marginBottom: '2rem' }} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Host Name */}
          <div>
            <label className="block mb-2 text-base text-stone-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="enter name..."
              maxLength={20}
              value={form.hostName}
              onChange={(e) => setForm(prev => ({ ...prev, hostName: e.target.value }))}
              onMouseEnter={playHoverSound}
              autoFocus
              required
              className="w-full bg-stone-950/60 outline-none text-lg py-3 px-4 text-stone-100 border border-stone-800 focus:border-red-900/60 transition-colors"
              style={{ 
                fontFamily: 'var(--font-family-old), IM Fell English, serif'
              }}
            />
          </div>

          {/* Room Name */}
          <div>
            <label className="block mb-2 text-base text-stone-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Room Name
            </label>
            <input
              type="text"
              placeholder="enter room name..."
              maxLength={30}
              value={form.roomName}
              onChange={(e) => setForm(prev => ({ ...prev, roomName: e.target.value }))}
              onMouseEnter={playHoverSound}
              required
              className="w-full bg-stone-950/60 outline-none text-lg py-3 px-4 text-stone-100 border border-stone-800 focus:border-red-900/60 transition-colors"
              style={{ 
                fontFamily: 'var(--font-family-old), IM Fell English, serif'
              }}
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="block mb-3 text-base text-stone-300 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Max Players
            </label>
            <div className="flex gap-4">
              {[4, 6, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { playClickSound(); setForm(prev => ({ ...prev, maxPlayers: num })); }}
                  onMouseEnter={playHoverSound}
                  className="px-6 py-2.5 text-base transition-colors duration-200"
                  style={{
                    color: form.maxPlayers === num ? '#fff' : 'rgba(255,255,255,0.4)',
                    background: form.maxPlayers === num ? 'rgba(139, 0, 0, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${form.maxPlayers === num ? 'rgba(139, 0, 0, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-old), IM Fell English, serif'
                  }}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {state.error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm py-1 text-red-700"
                style={{ fontFamily: 'var(--font-family-body), Cormorant Garamond, serif' }}
              >
                {state.error}
              </motion.p>
            )}
          </AnimatePresence>

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
              disabled={loading || !form.hostName.trim() || !form.roomName.trim()}
              onMouseEnter={playHoverSound}
              className="text-lg uppercase tracking-widest transition-colors"
              style={{ 
                color: loading || !form.hostName.trim() || !form.roomName.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)',
                cursor: loading ? 'wait' : 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-family-heading), Cinzel, serif'
              }}
            >
              {loading ? '[creating...]' : '[create room]'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default memo(HostGameModal);

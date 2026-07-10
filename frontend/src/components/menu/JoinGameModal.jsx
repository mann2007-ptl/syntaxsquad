import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound } from '../../audio/audioEngine.js';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
        style={{ 
          background: 'rgba(15,15,15,0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'monospace'
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-lg" style={{ color: '#fff', letterSpacing: '0.1em' }}>
            Join Game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Enter a room code to join
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 2rem' }} />

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Player Name */}
          <div>
            <label className="block mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="enter name..."
              maxLength={20}
              value={form.playerName}
              onChange={(e) => setForm(prev => ({ ...prev, playerName: e.target.value }))}
              autoFocus
              required
              className="w-full bg-transparent outline-none text-sm py-2"
              style={{ 
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Room Code */}
          <div>
            <label className="block mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Room Code
            </label>
            <input
              type="text"
              placeholder="_ _ _ _"
              maxLength={4}
              value={form.roomCode}
              onChange={handleCodeChange}
              required
              className="w-full bg-transparent outline-none text-2xl tracking-[0.5em] text-center py-3"
              style={{ 
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Error */}
          {state.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs py-2"
              style={{ color: 'rgba(200,50,50,0.7)' }}
            >
              {state.error}
            </motion.p>
          )}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

          {/* Buttons */}
          <div className="flex gap-6 pt-2">
            <button
              type="button"
              onClick={() => { playClickSound(); onClose(); }}
              className="text-sm transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'monospace' }}
            >
              [cancel]
            </button>
            <button
              type="submit"
              disabled={loading || !form.playerName.trim() || form.roomCode.length !== 4}
              className="text-sm transition-colors duration-200"
              style={{ 
                color: loading || !form.playerName.trim() || form.roomCode.length !== 4 ? 'rgba(255,255,255,0.15)' : '#fff',
                cursor: loading ? 'wait' : 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'monospace'
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

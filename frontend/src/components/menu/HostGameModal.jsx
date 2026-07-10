import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound } from '../../audio/audioEngine.js';

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
            Host Game
          </h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Create a new session
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 2rem' }} />

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Host Name */}
          <div>
            <label className="block mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="enter name..."
              maxLength={20}
              value={form.hostName}
              onChange={(e) => setForm(prev => ({ ...prev, hostName: e.target.value }))}
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

          {/* Room Name */}
          <div>
            <label className="block mb-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Room Name
            </label>
            <input
              type="text"
              placeholder="enter room name..."
              maxLength={30}
              value={form.roomName}
              onChange={(e) => setForm(prev => ({ ...prev, roomName: e.target.value }))}
              required
              className="w-full bg-transparent outline-none text-sm py-2"
              style={{ 
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="block mb-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Max Players
            </label>
            <div className="flex gap-4">
              {[4, 6, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => { playClickSound(); setForm(prev => ({ ...prev, maxPlayers: num })); }}
                  className="px-4 py-2 text-sm transition-colors duration-200"
                  style={{
                    color: form.maxPlayers === num ? '#fff' : 'rgba(255,255,255,0.25)',
                    background: form.maxPlayers === num ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: `1px solid ${form.maxPlayers === num ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                  }}
                >
                  {num}
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
                className="text-xs py-2"
                style={{ color: 'rgba(200,50,50,0.7)' }}
              >
                {state.error}
              </motion.p>
            )}
          </AnimatePresence>

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
              disabled={loading || !form.hostName.trim() || !form.roomName.trim()}
              className="text-sm transition-colors duration-200"
              style={{ 
                color: loading || !form.hostName.trim() || !form.roomName.trim() ? 'rgba(255,255,255,0.15)' : '#fff',
                cursor: loading ? 'wait' : 'pointer',
                background: 'none',
                border: 'none',
                fontFamily: 'monospace'
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

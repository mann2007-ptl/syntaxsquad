import { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { setMasterVolume, setMuted } from '../audio/audioEngine.js';

function AudioControls() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showSlider, setShowSlider] = useState(false);

  const handleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      setMuted(newMuted);
      return newMuted;
    });
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMasterVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-3"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {/* Volume Slider */}
      {showSlider && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center"
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b0000 ${(isMuted ? 0 : volume) * 100}%, #2a2a2a ${(isMuted ? 0 : volume) * 100}%)`,
              accentColor: '#8b0000'
            }}
          />
        </motion.div>
      )}

      {/* Mute Button */}
      <button
        onClick={handleMute}
        className="w-10 h-10 flex items-center justify-center rounded border transition-all duration-300 hover:border-[#8b0000] hover:shadow-[0_0_10px_rgba(139,0,0,0.3)]"
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          borderColor: 'rgba(139, 0, 0, 0.3)',
          cursor: 'pointer'
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>
    </motion.div>
  );
}

export default memo(AudioControls);

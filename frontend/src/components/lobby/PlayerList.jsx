import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound } from '../../audio/audioEngine.js';

const AVATARS = ['💀', '👻', '🦇', '🕷️', '🐺', '🧟', '🎃', '👁️'];

function PlayerList({ players, playerId, isHost, maxPlayers }) {
  const { actions } = useGame();
  const emptySlots = maxPlayers - players.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Players
        </span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {players.filter(p => p.isConnected).length} / {maxPlayers}
        </span>
      </div>
      
      {/* Player list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
              className="flex items-center justify-between px-5 py-4"
              style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                opacity: player.isConnected ? 1 : 0.3
              }}
            >
              <div className="flex items-center gap-4">
                {/* Simple dot indicator */}
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ 
                    background: !player.isConnected ? '#553333' : player.isReady ? '#4a9e4a' : '#666'
                  }}
                />
                
                {/* Name */}
                <span 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'monospace',
                    color: player.playerId === playerId ? '#fff' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {player.name}
                  {player.playerId === playerId && (
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}> (you)</span>
                  )}
                </span>
                
                {player.isHost && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                    host
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Status text */}
                <span className="text-xs" style={{ 
                  fontFamily: 'monospace',
                  color: !player.isConnected ? '#553333' : player.isReady ? 'rgba(74,158,74,0.7)' : 'rgba(255,255,255,0.2)'
                }}>
                  {!player.isConnected ? 'disconnected' : player.isReady ? 'ready' : 'not ready'}
                </span>

                {/* Host actions */}
                {isHost && player.playerId !== playerId && player.isConnected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { playClickSound(); actions.kickPlayer(player.playerId); }}
                      className="text-xs transition-colors duration-200"
                      style={{ color: 'rgba(200,50,50,0.5)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'monospace' }}
                    >
                      [kick]
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="px-5 py-4 flex items-center gap-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <span className="text-sm" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.1)' }}>
                - - -
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(PlayerList);

import { memo } from 'react';
import { motion } from 'framer-motion';

const ENV_LABELS = {
  'haunted-manor': '🏚️ Haunted Manor',
  'abandoned-hospital': '🏥 Abandoned Hospital',
  'forest-cabin': '🌲 Forest Cabin',
  'ancient-church': '⛪ Ancient Church',
  'random': '🎲 Random'
};

const DIFF_COLORS = {
  easy: '#4a9e4a',
  medium: '#b8860b',
  hard: '#cc3333'
};

function LeftPanel({ room, isHost, ping }) {
  const connectedCount = room.players.filter(p => p.isConnected).length;
  
  const getPingColor = () => {
    if (ping < 50) return '#4a9e4a';
    if (ping < 100) return '#b8860b';
    return '#cc3333';
  };

  const getPingLabel = () => {
    if (ping < 50) return 'Excellent';
    if (ping < 100) return 'Good';
    if (ping < 200) return 'Fair';
    return 'Poor';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="panel flex flex-col w-full overflow-y-auto"
    >
      <div className="panel-header">
        ⚙️ Room Details
      </div>
      
      <div className="flex-1 p-4 space-y-4" style={{ fontFamily: 'var(--font-family-body)' }}>
        {/* Room Code */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Room Code
          </div>
          <div className="text-2xl font-bold tracking-[0.3em]" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-gold)' }}>
            {room.roomCode}
          </div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.2), transparent)' }} />

        {/* Environment */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Environment
          </div>
          <div className="text-sm" style={{ color: 'var(--color-bone)' }}>
            {ENV_LABELS[room.environment] || room.environment}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Difficulty
          </div>
          <div className="text-sm capitalize flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: DIFF_COLORS[room.difficulty], boxShadow: `0 0 6px ${DIFF_COLORS[room.difficulty]}` }}
            />
            <span style={{ color: DIFF_COLORS[room.difficulty] }}>{room.difficulty}</span>
          </div>
        </div>

        {/* Players */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Players
          </div>
          <div className="text-sm" style={{ color: 'var(--color-bone)' }}>
            {connectedCount} / {room.maxPlayers}
          </div>
          {/* Player bar */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,30,30,0.8)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(connectedCount / room.maxPlayers) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: 'linear-gradient(90deg, #8b0000, #b8860b)' }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.2), transparent)' }} />

        {/* Network */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Network
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span 
              className="w-2 h-2 rounded-full"
              style={{ background: getPingColor(), boxShadow: `0 0 6px ${getPingColor()}` }}
            />
            <span style={{ color: getPingColor() }}>{ping}ms</span>
            <span className="text-xs" style={{ color: 'var(--color-bone-dark)' }}>({getPingLabel()})</span>
          </div>
        </div>

        {/* Status */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Status
          </div>
          <div className="text-sm capitalize flex items-center gap-2" style={{ color: 'var(--color-bone)' }}>
            <span 
              className="w-2 h-2 rounded-full"
              style={{ 
                background: room.status === 'waiting' ? '#b8860b' : '#4a9e4a',
                animation: 'heartbeat 2s ease-in-out infinite',
                boxShadow: `0 0 6px ${room.status === 'waiting' ? '#b8860b' : '#4a9e4a'}`
              }}
            />
            {room.status === 'waiting' ? 'Awaiting Players' : room.status}
          </div>
        </div>

        {/* Room Privacy */}
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
            Visibility
          </div>
          <div className="text-sm" style={{ color: 'var(--color-bone-dark)' }}>
            {room.isPrivate ? '🔒 Private' : '🌐 Public'}
          </div>
        </div>

        {/* Host Settings (if host) */}
        {isHost && (
          <>
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.2), transparent)' }} />
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-gold-dim)', fontFamily: 'var(--font-family-heading)' }}>
              Host Controls
            </div>
            <div className="space-y-2">
              <select
                className="horror-select text-xs py-2"
                value={room.environment}
                onChange={(e) => {
                  const { changeSettings } = require('../../contexts/GameContext.jsx').useGame().actions;
                }}
              >
                {Object.entries(ENV_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default memo(LeftPanel);

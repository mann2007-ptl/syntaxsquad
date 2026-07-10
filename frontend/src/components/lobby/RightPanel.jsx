import { memo } from 'react';
import { motion } from 'framer-motion';

function RightPanel({ room, ping, isHost }) {
  if (!room) return null;

  const connectedCount = room.players.filter(p => p.isConnected).length;
  const readyCount = room.players.filter(p => p.isReady && p.isConnected).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: 'rgba(12, 10, 10, 0.4)', border: '1px solid rgba(139, 0, 0, 0.15)' }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4"
        style={{ borderBottom: '1px solid rgba(139, 0, 0, 0.15)', background: 'rgba(0,0,0,0.2)' }}
      >
        <span className="text-sm uppercase tracking-widest text-stone-400" style={{ fontFamily: 'var(--font-family-heading), Cinzel, serif' }}>
          Room Information
        </span>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Room Code */}
        <div className="flex justify-between items-center">
          <div className="text-base uppercase tracking-wider text-stone-500" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
            Invitation Code
          </div>
          <div className="text-3xl font-bold tracking-widest text-stone-100" style={{ fontFamily: 'var(--font-family-heading), Cinzel, serif' }}>
            {room.roomCode}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.1)' }} />

        {/* Room Name */}
        <div className="flex justify-between items-center">
          <div className="text-base uppercase tracking-wider text-stone-500" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
            Active Session
          </div>
          <div className="text-lg text-stone-200" style={{ fontFamily: 'var(--font-family-body), Cormorant Garamond, serif' }}>
            {room.roomName}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.1)' }} />

        {/* Players */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-base uppercase tracking-wider text-stone-500" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Connected Players
            </div>
            <div className="text-lg text-stone-200 font-bold" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              {connectedCount} <span style={{ color: 'rgba(255,255,255,0.25)' }}>/ {room.maxPlayers}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-stone-950 border border-stone-900 rounded-sm overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${(connectedCount / room.maxPlayers) * 100}%`,
                background: 'rgba(139,0,0,0.5)'
              }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.1)' }} />

        {/* Ready Status */}
        <div className="flex justify-between items-center">
          <div className="text-base uppercase tracking-wider text-stone-500" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
            Ready Status
          </div>
          <div className="text-lg font-bold" style={{ 
            fontFamily: 'var(--font-family-old), IM Fell English, serif',
            color: readyCount === connectedCount && connectedCount > 1 ? '#4ea366' : 'rgba(255,255,255,0.4)' 
          }}>
            {readyCount} / {connectedCount}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(139, 0, 0, 0.1)' }} />

        {/* Network and Privacy Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-stone-950/40 border border-stone-900/40">
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-1" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Network Ping
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ping < 100 ? '#4ea366' : ping < 200 ? '#b8860b' : '#cc3333' }} />
              <span>{ping}ms</span>
            </div>
          </div>
          <div className="p-3 bg-stone-950/40 border border-stone-900/40">
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-1" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              Lobby State
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-300 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: room.isLocked ? '#cc3333' : '#4ea366' }} />
              <span>{room.isLocked ? 'Locked' : 'Open'}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default memo(RightPanel);

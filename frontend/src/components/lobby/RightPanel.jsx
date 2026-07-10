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
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div 
        className="px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Room Info
        </span>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto space-y-5" style={{ fontFamily: 'monospace' }}>
        
        {/* Room Code */}
        <div>
          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Code
          </div>
          <div className="text-2xl tracking-[0.3em] font-bold" style={{ color: '#fff' }}>
            {room.roomCode}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

        {/* Room Name */}
        <div>
          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Session
          </div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {room.roomName}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

        {/* Players */}
        <div>
          <div className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Players
          </div>
          <div className="text-sm" style={{ color: '#fff' }}>
            {connectedCount} <span style={{ color: 'rgba(255,255,255,0.3)' }}>/ {room.maxPlayers}</span>
          </div>
          {/* Simple progress bar */}
          <div className="w-full h-px mt-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${(connectedCount / room.maxPlayers) * 100}%`,
                background: 'rgba(255,255,255,0.3)'
              }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

        {/* Ready Status */}
        <div>
          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Ready
          </div>
          <div className="text-sm" style={{ color: readyCount === connectedCount && connectedCount > 1 ? 'rgba(74,158,74,0.8)' : 'rgba(255,255,255,0.5)' }}>
            {readyCount} / {connectedCount}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />

        {/* Network */}
        <div className="flex gap-8">
          <div>
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ping
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ping < 100 ? 'rgba(74,158,74,0.6)' : ping < 200 ? 'rgba(184,134,11,0.6)' : 'rgba(200,50,50,0.6)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{ping}ms</span>
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Status
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: room.isLocked ? 'rgba(200,50,50,0.6)' : 'rgba(74,158,74,0.6)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{room.isLocked ? 'Locked' : 'Open'}</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default memo(RightPanel);

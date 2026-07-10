import { memo, useState } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound } from '../../audio/audioEngine.js';

function LobbyHeader({ room, isHost }) {
  const { actions } = useGame();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = room.roomCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectedCount = room.players.filter(p => p.isConnected).length;

  return (
    <div 
      className="flex-shrink-0 px-6 md:px-10 py-4"
      style={{ 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Room code + name */}
        <div className="flex items-center gap-6">
          <span
            className="text-2xl font-bold tracking-widest"
            style={{ color: '#fff', fontFamily: 'monospace' }}
          >
            {room.roomCode}
          </span>
          
          <button
            onClick={copyCode}
            className="text-xs transition-colors duration-200"
            style={{ 
              color: copied ? '#888' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            [{copied ? 'copied' : 'copy code'}]
          </button>

          <span 
            className="text-sm hidden sm:inline"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}
          >
            {room.roomName}
          </span>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-8 text-sm" style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>
          <span>
            Players: <span style={{ color: '#fff' }}>{connectedCount}</span>/{room.maxPlayers}
          </span>
          <span className="hidden md:inline">
            {room.isLocked ? 'Locked' : 'Open'}
          </span>
        </div>

        {/* Right: Host controls */}
        <div className="flex items-center gap-4">
          {isHost && (
            <>
              <button
                onClick={() => { playClickSound(); actions.lockRoom(!room.isLocked); }}
                className="text-xs transition-colors duration-200"
                style={{ 
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'monospace'
                }}
              >
                [{room.isLocked ? 'unlock' : 'lock'}]
              </button>
              <button
                onClick={() => { playClickSound(); actions.closeRoom(); }}
                className="text-xs transition-colors duration-200"
                style={{ 
                  color: 'rgba(200,50,50,0.6)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'monospace'
                }}
              >
                [close room]
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(LobbyHeader);

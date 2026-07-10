import { memo, useState } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound, playHoverSound } from '../../audio/audioEngine.js';

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
      className="flex-shrink-0 px-6 md:px-10 py-6"
      style={{ 
        borderBottom: '1px solid rgba(139, 0, 0, 0.25)',
        background: 'rgba(12, 10, 10, 0.96)'
      }}
    >
      <div className="grid grid-cols-3 items-center w-full">
        {/* Left: Session name / general details */}
        <div className="flex flex-col gap-1 items-start text-stone-300">
          <span className="text-xs uppercase tracking-widest text-stone-500" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
            Current Session
          </span>
          <span 
            className="text-lg md:text-xl font-normal"
            style={{ color: '#fff', fontFamily: 'var(--font-family-heading), Cinzel, serif' }}
          >
            {room.roomName}
          </span>
        </div>

        {/* Center: Bigger, prominent Room Code */}
        <div className="flex flex-col items-center justify-center">
          <span
            className="text-4xl md:text-5xl font-bold tracking-widest leading-none text-stone-100"
            style={{ fontFamily: 'var(--font-family-heading), Cinzel, serif' }}
          >
            {room.roomCode}
          </span>
          
          <button
            onClick={copyCode}
            onMouseEnter={playHoverSound}
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors duration-200 mt-2 uppercase tracking-widest"
            style={{ 
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-family-old), IM Fell English, serif',
            }}
          >
            [{copied ? 'copied' : 'copy code'}]
          </button>
        </div>

        {/* Right: Players + Status & Host controls */}
        <div className="flex items-center justify-end gap-6 text-stone-300">
          <div className="flex flex-col items-end gap-1" style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}>
            <span className="text-sm">
              Players: <span className="font-bold text-stone-100">{connectedCount}</span> / {room.maxPlayers}
            </span>
            <span className="text-xs text-stone-500 uppercase tracking-wider">
              {room.isLocked ? '🔒 Private' : '🔓 Open'}
            </span>
          </div>

          {isHost && (
            <div className="flex items-center gap-4 border-l border-stone-800 pl-6">
              <button
                onClick={() => { playClickSound(); actions.lockRoom(!room.isLocked); }}
                onMouseEnter={playHoverSound}
                className="text-sm text-stone-400 hover:text-stone-200 transition-colors uppercase tracking-widest"
                style={{ 
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-family-heading), Cinzel, serif'
                }}
              >
                [{room.isLocked ? 'unlock' : 'lock'}]
              </button>
              <button
                onClick={() => { playClickSound(); actions.closeRoom(); }}
                onMouseEnter={playHoverSound}
                className="text-sm text-red-800 hover:text-red-600 transition-colors uppercase tracking-widest"
                style={{ 
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-family-heading), Cinzel, serif'
                }}
              >
                [close]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(LobbyHeader);

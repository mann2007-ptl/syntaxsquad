import { useState, useRef, useEffect, memo } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound } from '../../audio/audioEngine.js';

function ChatPanel() {
  const { state, actions } = useGame();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.room?.messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    actions.sendMessage(input);
    setInput('');
    playClickSound();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else {
      actions.sendTyping();
    }
  };

  const formatTime = (isoString) => {
    const d = isoString ? new Date(isoString) : new Date();
    if (isNaN(d.getTime())) return '00:00';
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'system': return 'rgba(255,255,255,0.3)';
      case 'join': return 'rgba(74,158,74,0.6)';
      case 'leave': return 'rgba(255,255,255,0.25)';
      case 'kick': return 'rgba(200,50,50,0.6)';
      default: return 'rgba(255,255,255,0.7)';
    }
  };

  if (!state.room) return null;

  return (
    <div 
      className="flex flex-col h-full w-full"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div 
        className="px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Chat
        </span>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {state.room.messages.map((msg, i) => (
          <div key={i} style={{ color: getMessageColor(msg.type) }}>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>
              [{formatTime(msg.timestamp)}]
            </span>
            {' '}
            {msg.type === 'chat' && (
              <span style={{ color: msg.playerId === state.playerId ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)' }}>
                {msg.playerName}:
              </span>
            )}
            {' '}
            <span style={{ fontStyle: msg.type !== 'chat' ? 'italic' : 'normal' }}>
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit} 
        className="px-5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          placeholder="> type here..."
          className="w-full bg-transparent border-none outline-none text-sm"
          style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}
        />
      </form>
    </div>
  );
}

export default memo(ChatPanel);

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import { playClickSound, playHoverSound } from '../../audio/audioEngine.js';
import PlayerList from './PlayerList.jsx';
import RightPanel from './RightPanel.jsx';
import ChatPanel from './ChatPanel.jsx';
import LobbyHeader from './LobbyHeader.jsx';
import CountdownOverlay from './CountdownOverlay.jsx';

function Lobby() {
  const { state, actions } = useGame();
  const { room, playerId } = state;

  const isHost = useMemo(() => room?.hostId === playerId, [room?.hostId, playerId]);
  const connectedPlayers = useMemo(() => 
    room?.players?.filter(p => p.isConnected) || [], 
    [room?.players]
  );
  const myPlayer = useMemo(() => 
    room?.players?.find(p => p.playerId === playerId),
    [room?.players, playerId]
  );

  if (!room) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-20 flex flex-col h-screen"
      >
        {/* Header */}
        <LobbyHeader room={room} isHost={isHost} />

        {/* Main Content - 2 column layout */}
        <div className="flex-1 flex overflow-hidden p-6 md:p-12 gap-8 lg:gap-12 max-w-[1600px] mx-auto w-full">
          
          {/* Left - Player List */}
          <div className="flex-1 flex flex-col min-w-0 gap-6">
            <PlayerList 
              players={room.players} 
              playerId={playerId}
              isHost={isHost}
              maxPlayers={room.maxPlayers}
            />

            {/* Action Buttons */}
            <div className="flex gap-8 justify-center flex-wrap pt-6" style={{ fontFamily: 'monospace' }}>
              {/* Ready / Unready */}
              {!isHost && myPlayer && (
                <button
                  onClick={() => {
                    playClickSound();
                    actions.setReady(!myPlayer.isReady);
                  }}
                  className="text-sm transition-colors duration-200 px-6 py-3"
                  style={{ 
                    color: myPlayer.isReady ? 'rgba(74,158,74,0.8)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {myPlayer.isReady ? '[ ready ]' : '[ not ready ]'}
                </button>
              )}

              {/* Start Game (Host only) */}
              {isHost && (
                <button
                  onClick={() => {
                    playClickSound();
                    actions.startGame();
                  }}
                  disabled={connectedPlayers.length < 2}
                  className="text-sm transition-colors duration-200 px-8 py-3"
                  style={{ 
                    color: connectedPlayers.length >= 2 ? '#fff' : 'rgba(255,255,255,0.2)',
                    cursor: connectedPlayers.length >= 2 ? 'pointer' : 'not-allowed',
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${connectedPlayers.length >= 2 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`
                  }}
                >
                  {connectedPlayers.length < 2 
                    ? `[ waiting for ${2 - connectedPlayers.length} more ]` 
                    : '[ start game ]'}
                </button>
              )}

              {/* Leave Room */}
              <button
                onClick={() => {
                  playClickSound();
                  actions.leaveRoom();
                }}
                className="text-sm transition-colors duration-200 px-6 py-3"
                style={{ 
                  color: 'rgba(200,50,50,0.5)',
                  cursor: 'pointer',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                [ leave ]
              </button>
            </div>
          </div>

          {/* Right Panel - Mission & Chat */}
          <div className="hidden lg:flex flex-col w-96 xl:w-[28rem] flex-shrink-0 gap-6">
            <div className="flex-none">
              <RightPanel room={room} ping={state.ping} isHost={isHost} />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatPanel />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Countdown Overlay */}
      <AnimatePresence>
        {state.countdown !== null && state.countdown >= 0 && (
          <CountdownOverlay count={state.countdown} />
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Lobby);

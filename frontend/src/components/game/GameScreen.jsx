import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { useVoice } from '../../contexts/VoiceContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound, playHoverSound, setMuted } from '../../audio/audioEngine.js';
import RoomExploration from './RoomExploration.jsx';
import AudioRenderer from '../common/AudioRenderer.jsx';

export default function GameScreen() {
  const { state, actions } = useGame();
  const { isMuted, toggleMute, micError } = useVoice();
  const [activeTab, setActiveTab] = useState('role'); // role, location, suspects, timeline, clues
  const [phase, setPhase] = useState('briefing'); // briefing | exploring
  const [musicMuted, setMusicMuted] = useState(false);

  const toggleMusic = () => {
    setMusicMuted(prev => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  };

  const mystery = state.room?.mysteryData;
  const myPlayerId = state.playerId;

  // Find the suspect assigned to the current player
  const myRole = mystery?.suspects?.find(s => s.playerId === myPlayerId) || mystery?.suspects?.[0];
  const otherSuspects = mystery?.suspects?.filter(s => s.playerId !== myPlayerId) || [];

  if (!mystery) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 text-white font-mono">
        <h1 className="text-xl">Error: Mystery data not found.</h1>
      </div>
    );
  }

  // ── Room Exploration Phase ──
  if (phase === 'exploring') {
    return <RoomExploration />;
  }

  // ── Briefing Phase ──
  const tabs = [
    { id: 'role', label: 'Your Role' },
    { id: 'location', label: 'The Location' },
    { id: 'suspects', label: 'Other Suspects' },
    { id: 'timeline', label: 'Timeline & Clues' }
  ];

  return (
    <motion.div
      key="game-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/90 z-50 font-mono text-gray-300 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <header className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/50">
        <div>
          <h1 className="text-2xl md:text-3xl text-red-500/80 tracking-widest uppercase">
            {mystery.victim.name} is dead.
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mystery.victim.backstory}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={toggleMusic}
            className={`text-xs px-3 py-1 border rounded transition-colors ${
              musicMuted ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' : 'text-red-400 border-red-500/50 bg-red-500/10'
            }`}
            title="Toggle Background Music"
          >
            {musicMuted ? '[MUSIC ON]' : '[MUSIC OFF]'}
          </button>
          <button
            onClick={toggleMute}
            className={`text-xs px-3 py-1 border rounded transition-colors ${
              isMuted ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-red-400 border-red-500/50 bg-red-500/10'
            }`}
            title={micError || 'Toggle Microphone'}
          >
            {isMuted ? '[MIC ON]' : '[MIC OFF]'}
          </button>
          <button
            onClick={() => {
              actions.closeRoom();
              window.location.href = '/';
            }}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            [LEAVE GAME]
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-black/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'text-red-400 border-b-2 border-red-500/50 bg-white/5'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            [{tab.label}]
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center mb-10">
                <h2 className="text-sm text-gray-500 tracking-widest uppercase mb-2">You are</h2>
                <h1 className="text-4xl text-white tracking-widest">{myRole?.name}</h1>
                <p className="text-gray-400 mt-2">{myRole?.age} yrs • {myRole?.occupation}</p>
              </div>

              <div className="space-y-6">
                <section className="bg-gray-900/50 p-6 border border-gray-800 rounded">
                  <h3 className="text-red-400/80 mb-2 tracking-wider">Public Background</h3>
                  <p className="leading-relaxed">{myRole?.publicBackground}</p>
                </section>

                <section className="bg-red-950/20 p-6 border border-red-900/30 rounded">
                  <h3 className="text-red-500 mb-2 tracking-wider">Private Objective</h3>
                  <p className="leading-relaxed text-gray-300">{myRole?.privateObjective}</p>
                </section>

                <section className="bg-gray-900/50 p-6 border border-gray-800 rounded">
                  <h3 className="text-purple-400/80 mb-2 tracking-wider">Hidden Information</h3>
                  <p className="leading-relaxed">{myRole?.hiddenInformation}</p>
                </section>

                <section className="bg-gray-900/50 p-6 border border-gray-800 rounded">
                  <h3 className="text-purple-400/80 mb-2 tracking-wider">Secret Relationship</h3>
                  <p className="leading-relaxed">{myRole?.secretRelationship}</p>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl text-white tracking-widest mb-6">{mystery.location.name}</h2>
              <p className="text-lg leading-relaxed text-gray-400 border-l-2 border-gray-700 pl-6 py-2">
                {mystery.location.description}
              </p>
            </motion.div>
          )}

          {activeTab === 'suspects' && (
            <motion.div
              key="suspects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {otherSuspects.map((suspect, idx) => (
                <div key={idx} className="bg-gray-900/40 p-6 border border-gray-800 rounded">
                  <h3 className="text-xl text-white mb-1">{suspect.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{suspect.age} yrs • {suspect.occupation}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Appearance</span>
                      <p>{suspect.physicalDescription}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Known Background</span>
                      <p>{suspect.publicBackground}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"
            >
              {/* Timeline */}
              <div>
                <h3 className="text-xl text-white tracking-widest mb-6 border-b border-gray-800 pb-2">Timeline</h3>
                <div className="space-y-6">
                  {mystery.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-6 border-l border-gray-800">
                      <div className="absolute w-2 h-2 bg-gray-600 rounded-full -left-[4.5px] top-1.5" />
                      <span className="text-red-400/80 text-sm block mb-1">{event.time}</span>
                      <p className="text-sm">{event.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clues */}
              <div>
                <h3 className="text-xl text-white tracking-widest mb-6 border-b border-gray-800 pb-2">Initial Clues</h3>
                <div className="space-y-4">
                  {mystery.initialClues.map((clue, idx) => (
                    <div key={idx} className="bg-gray-900/30 p-4 border border-gray-800 rounded">
                      <h4 className="text-white mb-1">{clue.name}</h4>
                      <p className="text-sm text-gray-400">{clue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Enter the Mansion Button ── */}
      <div
        className="px-6 py-5 border-t flex items-center justify-center"
        style={{ borderColor: 'rgba(139, 0, 0, 0.3)', background: 'rgba(5, 3, 2, 0.95)' }}
      >
        <button
          onClick={() => { playClickSound(); setPhase('exploring'); }}
          onMouseEnter={playHoverSound}
          className="relative overflow-hidden group transition-all duration-500"
          style={{
            fontFamily: 'var(--font-family-heading), Cinzel, serif',
            fontSize: '1.1rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#d4c5a9',
            background: 'linear-gradient(180deg, rgba(30,20,15,0.9) 0%, rgba(15,10,8,0.95) 100%)',
            border: '1px solid rgba(139, 0, 0, 0.5)',
            padding: '1rem 3rem',
            cursor: 'pointer',
            textShadow: '0 0 15px rgba(139, 0, 0, 0.6)',
            boxShadow: '0 0 25px rgba(139, 0, 0, 0.2), inset 0 0 15px rgba(139, 0, 0, 0.05)',
          }}
        >
          ⚰️ Enter the Mansion
        </button>
      </div>

      <AudioRenderer />
    </motion.div>
  );
}

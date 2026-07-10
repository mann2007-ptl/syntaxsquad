import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import socket from '../socket/socket.js';
import { useGame } from './GameContext.jsx';

const VoiceContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function VoiceProvider({ children }) {
  const { state: gameState } = useGame();
  const { room, playerId: myPlayerId, roomCode } = gameState;
  
  const [isMuted, setIsMuted] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [micError, setMicError] = useState(null);
  
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const micAttemptedRef = useRef(false);

  // Initialize Microphone
  const initMicrophone = useCallback(async () => {
    if (localStreamRef.current || micAttemptedRef.current) return;
    micAttemptedRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setMicError(null);
    } catch (err) {
      console.error('[Voice] Failed to get microphone:', err);
      setMicError('Microphone access denied or unavailable.');
    }
  }, [isMuted]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !newMuted;
        });
      }
      return newMuted;
    });
  }, []);

  // Create Peer Connection
  const createPeerConnection = useCallback((targetPlayerId, isInitiator) => {
    if (peersRef.current[targetPlayerId]) return peersRef.current[targetPlayerId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetPlayerId] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetPlayerId]: event.streams[0]
      }));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          roomCode,
          targetPlayerId,
          callerId: myPlayerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetPlayerId];
          return next;
        });
        delete peersRef.current[targetPlayerId];
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('webrtc-signal', {
            roomCode,
            targetPlayerId,
            callerId: myPlayerId,
            signal: { type: 'offer', sdp: pc.localDescription }
          });
        })
        .catch(err => console.error('[Voice] createOffer error:', err));
    }

    return pc;
  }, [myPlayerId, roomCode]);

  // Listen for WebRTC signals
  useEffect(() => {
    const handleSignal = async (data) => {
      const { callerId, signal } = data;
      
      let pc = peersRef.current[callerId];
      if (!pc && signal.type === 'offer') {
        pc = createPeerConnection(callerId, false);
      }

      if (!pc) return;

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            roomCode,
            targetPlayerId: callerId,
            callerId: myPlayerId,
            signal: { type: 'answer', sdp: pc.localDescription }
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('[Voice] Error handling signal:', err);
      }
    };

    socket.on('webrtc-signal', handleSignal);
    return () => {
      socket.off('webrtc-signal', handleSignal);
    };
  }, [myPlayerId, roomCode, createPeerConnection]);

  // Watch room updates to connect to new players
  useEffect(() => {
    if (!room || !myPlayerId) return;

    room.players.forEach(p => {
      if (p.playerId === myPlayerId || !p.isConnected) return;
      
      // Tie-breaker to decide who initiates the offer
      if (!peersRef.current[p.playerId] && myPlayerId > p.playerId) {
        createPeerConnection(p.playerId, true);
      }
    });

    // Cleanup disconnected players
    const currentActiveIds = room.players.filter(p => p.isConnected).map(p => p.playerId);
    Object.keys(peersRef.current).forEach(id => {
      if (!currentActiveIds.includes(id)) {
        peersRef.current[id].close();
        delete peersRef.current[id];
        
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  }, [room, myPlayerId, createPeerConnection]);

  // Clean up all connections on unmount or when leaving room
  useEffect(() => {
    if (!roomCode) {
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      setRemoteStreams({});
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      micAttemptedRef.current = false;
    }
  }, [roomCode]);

  // Initialize mic when we enter a room
  useEffect(() => {
    if (roomCode && !localStreamRef.current) {
      initMicrophone();
    }
  }, [roomCode, initMicrophone]);

  const value = {
    isMuted,
    toggleMute,
    remoteStreams,
    micError,
    initMicrophone
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export default VoiceContext;

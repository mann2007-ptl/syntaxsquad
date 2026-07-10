import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext.jsx';
import socket from '../../socket/socket.js';
import useGameLoop from '../../hooks/useGameLoop.js';
import { LAYOUT, generateWalls, MAP_WIDTH, MAP_HEIGHT } from './mapLayout.js';

import woodFloor from '../../assets/wood_floor.png';
import stoneFloor from '../../assets/stone_floor.png';
import wallTexture from '../../assets/wall_texture.png';

import furnBookshelf from '../../assets/furniture_bookshelf.png';
import furnDesk from '../../assets/furniture_desk.png';
import furnStove from '../../assets/furniture_stove.png';
import furnCounter from '../../assets/furniture_counter.png';
import furnDiningTable from '../../assets/furniture_dining_table.png';

const furnitureImages = {
  'furniture_bookshelf.png': furnBookshelf,
  'furniture_desk.png': furnDesk,
  'furniture_stove.png': furnStove,
  'furniture_counter.png': furnCounter,
  'furniture_dining_table.png': furnDiningTable
};

const PLAYER_SIZE = 40;
const CLUE_SIZE = 30;
const INTERACTION_RADIUS = 80;

export default function RoomExploration2D() {
  const { state, actions } = useGame();
  const mystery = state.room?.mysteryData;
  const rooms = mystery?.rooms || [];
  
  const [otherPlayers, setOtherPlayers] = useState({});
  const [inspectedClue, setInspectedClue] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState([]);
  
  const mapRef = useRef(null);

  const walls = useMemo(() => generateWalls(), []);
  
  // All solid objects the player can collide with
  const colliders = useMemo(() => [...walls, ...LAYOUT.furniture], [walls]);

  // We use our hardcoded map geometry, but we pull the clue data from the AI generated rooms
  // by matching room IDs.
  const mappedRooms = useMemo(() => {
    return Object.values(LAYOUT.rooms).map(layoutRoom => {
      const aiRoom = rooms.find(r => r.id === layoutRoom.id);
      return {
        ...layoutRoom,
        clues: aiRoom?.clues || [],
        name: aiRoom?.name || layoutRoom.id
      };
    });
  }, [rooms]);

  // Distribute clues within their rooms based on the new static layout
  const cluesData = useMemo(() => {
    const allClues = [];
    mappedRooms.forEach(room => {
      if (room.clues) {
        room.clues.forEach((clue, index) => {
          const offsetX = 50 + (index % 3) * 100;
          const offsetY = 50 + Math.floor(index / 3) * 100;
          allClues.push({
            ...clue,
            id: `${room.id}-${clue.name}`,
            roomId: room.id,
            x: room.x + offsetX,
            y: room.y + offsetY
          });
        });
      }
    });
    return allClues;
  }, [mappedRooms]);

  // Handle local player movement
  const handleMove = (x, y, direction, isMoving) => {
    if (socket) {
      socket.emit('player-move', {
        roomCode: state.roomCode,
        playerId: state.playerId,
        x,
        y,
        direction,
        isMoving
      });
    }
  };

  // Start in the hallway
  const hallway = mappedRooms.find(r => r.id === 'hallway');
  const startX = hallway ? hallway.x + 200 : MAP_WIDTH / 2;
  const startY = hallway ? hallway.y + 200 : MAP_HEIGHT / 2;

  const { position: localPos, direction: localDir, isMoving: localIsMoving } = useGameLoop(
    startX, 
    startY, 
    { width: MAP_WIDTH - PLAYER_SIZE, height: MAP_HEIGHT - PLAYER_SIZE },
    colliders,
    handleMove
  );

  // Listen for other players moving and sync initial positions
  useEffect(() => {
    if (!socket) return;

    // Broadcast my initial spawn location
    socket.emit('player-move', {
      roomCode: state.roomCode,
      playerId: state.playerId,
      x: startX,
      y: startY,
      direction: 'down',
      isMoving: false
    });

    // Ask server for everyone else's last known location
    socket.emit('request-sync-positions', { roomCode: state.roomCode }, (response) => {
      if (response && response.positions) {
        const others = { ...response.positions };
        delete others[state.playerId]; // filter out myself
        setOtherPlayers(others);
      }
    });

    const onPlayerMoved = (data) => {
      if (data.playerId !== state.playerId) {
        setOtherPlayers(prev => ({
          ...prev,
          [data.playerId]: { x: data.x, y: data.y, direction: data.direction, isMoving: data.isMoving }
        }));
      }
    };

    socket.on('player-moved', onPlayerMoved);
    return () => socket.off('player-moved', onPlayerMoved);
  }, [state.playerId, state.roomCode, startX, startY]);

  // Interaction logic
  const [nearbyClue, setNearbyClue] = useState(null);

  useEffect(() => {
    let closest = null;
    let minDistance = Infinity;

    cluesData.forEach(clue => {
      // Calculate center to center distance
      const px = localPos.x + PLAYER_SIZE / 2;
      const py = localPos.y + PLAYER_SIZE / 2;
      const cx = clue.x + CLUE_SIZE / 2;
      const cy = clue.y + CLUE_SIZE / 2;
      
      const dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = clue;
      }
    });

    if (minDistance <= INTERACTION_RADIUS) {
      setNearbyClue(closest);
    } else {
      setNearbyClue(null);
    }
  }, [localPos, cluesData]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'e' && nearbyClue && !inspectedClue) {
        setInspectedClue(nearbyClue);
        if (!discoveredClues.find(c => c.name === nearbyClue.name)) {
          setDiscoveredClues(prev => [...prev, nearbyClue]);
        }
      } else if (e.key === 'Escape' && inspectedClue) {
        setInspectedClue(null);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nearbyClue, inspectedClue, discoveredClues]);

  // Camera Follow
  const cameraStyle = {
    transform: `translate(calc(50vw - ${localPos.x + PLAYER_SIZE/2}px), calc(50vh - ${localPos.y + PLAYER_SIZE/2}px))`,
    transition: 'transform 0.1s linear'
  };

  // Determine which room the player is currently inside
  const currentRoom = useMemo(() => {
    const px = localPos.x + PLAYER_SIZE / 2;
    const py = localPos.y + PLAYER_SIZE / 2;
    // We check if the player's center is within a room's bounding box
    return mappedRooms.find(r => px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height);
  }, [localPos.x, localPos.y, mappedRooms]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden font-mono text-white select-none">
      
      {/* 2D Canvas Container (Camera) */}
      <div className="absolute top-0 left-0" style={{ width: MAP_WIDTH, height: MAP_HEIGHT, ...cameraStyle, backgroundColor: '#0a0a0a' }}>
        
        {/* Rooms Layer (Floors) */}
        {mappedRooms.map(room => (
          <div
            key={room.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: room.x,
              top: room.y,
              width: room.width,
              height: room.height,
              backgroundImage: `url(${room.texture === 'wood_floor.png' ? woodFloor : stoneFloor})`,
              backgroundSize: '200px',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
            }}
          >
            {/* Room names have been moved to the bottom UI overlay */}
          </div>
        ))}

        {/* Walls Layer */}
        {walls.map((wall, i) => (
          <div
            key={`wall-${i}`}
            className="absolute pointer-events-none shadow-[0_0_15px_rgba(0,0,0,1)]"
            style={{
              left: wall.x,
              top: wall.y,
              width: wall.width,
              height: wall.height,
              backgroundImage: `url(${wallTexture})`,
              backgroundSize: '100px',
              zIndex: 5
            }}
          />
        ))}

        {/* Furniture Layer */}
        {LAYOUT.furniture.map(furn => (
          <div
            key={furn.id}
            className="absolute pointer-events-none shadow-[5px_5px_15px_rgba(0,0,0,0.8)]"
            style={{
              left: furn.x,
              top: furn.y,
              width: furn.width,
              height: furn.height,
              backgroundImage: `url(${furnitureImages[furn.image]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            {/* If the AI image has a black background, it usually blends ok with box-shadow, but we could also use mixBlendMode: 'screen' if they were light. Since they are dark, we leave it normal. */}
          </div>
        ))}

        {/* Clues Layer */}
        {cluesData.map(clue => {
          const isNearby = nearbyClue?.id === clue.id;
          const isDiscovered = discoveredClues.some(c => c.name === clue.name);
          
          return (
            <div
              key={clue.id}
              className="absolute rounded-full shadow-[0_0_15px_rgba(218,165,32,0.4)] flex items-center justify-center transition-transform"
              style={{
                left: clue.x,
                top: clue.y,
                width: CLUE_SIZE,
                height: CLUE_SIZE,
                background: isNearby ? 'radial-gradient(circle, #ffeb99, #daa520)' : 'radial-gradient(circle, #daa520, #8b6914)',
                transform: isNearby ? 'scale(1.2)' : 'scale(1)'
              }}
            >
              <span className="text-xs">🔍</span>
              {isDiscovered && (
                <div className="absolute -top-6 whitespace-nowrap text-[10px] text-[rgba(218,165,32,0.8)]">
                  {clue.name}
                </div>
              )}
            </div>
          );
        })}

        {/* Other Players Layer */}
        {Object.entries(otherPlayers).map(([id, p]) => (
          <div
            key={id}
            className="absolute transition-all duration-100 ease-linear rounded-full flex flex-col items-center justify-center"
            style={{
              left: p.x,
              top: p.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              background: 'radial-gradient(circle, rgba(100,0,0,0.8), rgba(50,0,0,0.9))',
              border: '2px solid rgba(255,100,100,0.5)',
              boxShadow: '0 0 20px rgba(255,0,0,0.3)',
              zIndex: 10
            }}
          >
             <div className="absolute -top-8 bg-black/60 px-2 py-1 rounded text-xs whitespace-nowrap text-gray-300">
               {mystery?.suspects?.find(s => s.playerId === id)?.name || 'Unknown Guest'}
             </div>
          </div>
        ))}

        {/* Local Player Layer */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            left: localPos.x,
            top: localPos.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            background: 'radial-gradient(circle, #0044aa, #001144)',
            border: '2px solid #5599ff',
            boxShadow: '0 0 20px rgba(0,100,255,0.4)',
            zIndex: 20
          }}
        >
           <div className="absolute -top-8 bg-black/60 px-2 py-1 rounded text-xs whitespace-nowrap text-white border border-blue-900/50">
             {mystery?.suspects?.find(s => s.playerId === state.playerId)?.name || 'You'} (You)
           </div>
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-start">
        <div className="bg-black/80 p-4 border border-[rgba(139,0,0,0.4)] pointer-events-auto">
          <h3 className="text-[rgba(218,165,32,0.8)] tracking-widest text-sm mb-2 uppercase">Evidence Collected</h3>
          {discoveredClues.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No evidence collected yet.</p>
          ) : (
            <ul className="text-xs text-gray-300 space-y-2">
              {discoveredClues.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span>•</span>
                  <span>{c.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="bg-black/60 px-4 py-2 text-xs text-gray-400 rounded pointer-events-auto">
          WASD to move
        </div>
      </div>

      {/* Interaction Prompt */}
      <AnimatePresence>
        {nearbyClue && !inspectedClue && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/90 border border-[#daa520] px-6 py-3 rounded text-[#daa520] font-bold tracking-widest"
          >
            PRESS [E] TO INSPECT {nearbyClue.name.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspected Clue Modal */}
      <AnimatePresence>
        {inspectedClue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[rgba(15,10,8,0.95)] border border-[rgba(139,0,0,0.5)] p-8 shadow-[0_0_50px_rgba(139,0,0,0.2)]"
              style={{ backgroundImage: `url(${wallTexture})`, backgroundBlendMode: 'overlay', backgroundSize: '200px' }}
            >
              <h2 className="text-2xl text-[#d4c5a9] mb-4 font-serif">{inspectedClue.name}</h2>
              <p className="text-[rgba(200,180,150,0.8)] mb-8 leading-relaxed">
                {inspectedClue.description}
              </p>
              {inspectedClue.isSupernatural && (
                <p className="text-purple-400/80 text-sm mb-6 italic">
                  An eerie chill accompanies this discovery...
                </p>
              )}
              <button
                onClick={() => setInspectedClue(null)}
                className="w-full py-3 bg-[rgba(139,0,0,0.2)] border border-[rgba(139,0,0,0.4)] text-[rgba(200,160,120,0.8)] hover:bg-[rgba(139,0,0,0.4)] hover:text-white transition-all uppercase tracking-widest text-sm"
              >
                Close (Press ESC)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Room Name Overlay */}
      <AnimatePresence mode="wait">
        {currentRoom && (
          <motion.div
            key={currentRoom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none z-40"
          >
            <div className="bg-black/90 px-8 py-3 border-y border-[rgba(139,0,0,0.6)] shadow-[0_0_30px_rgba(139,0,0,0.4)] backdrop-blur-sm">
              <span 
                className="text-2xl tracking-[0.3em] uppercase text-[#d4c5a9]"
                style={{ fontFamily: 'var(--font-family-old), IM Fell English, serif' }}
              >
                {currentRoom.name}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

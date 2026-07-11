import { useState, useEffect, useRef, useCallback } from 'react';

const SPEED = 250; // pixels per second
const TICK_RATE = 1000 / 30; // 30 updates per second for network broadcast

export default function useGameLoop(initialX, initialY, mapBounds, colliders, onMove) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [direction, setDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  
  const keys = useRef({});
  const lastTime = useRef(performance.now());
  const positionRef = useRef({ x: initialX, y: initialY });
  const lastBroadcastTime = useRef(0);
  const rafId = useRef(null);
  
  const handleKeyDown = useCallback((e) => {
    // Ignore keypresses if typing in an input
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
      keys.current[key] = true;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
      keys.current[key] = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const loop = (currentTime) => {
      const deltaTime = (currentTime - lastTime.current) / 1000; // in seconds
      lastTime.current = currentTime;

      let dx = 0;
      let dy = 0;
      
      if (keys.current['w'] || keys.current['arrowup']) dy -= 1;
      if (keys.current['s'] || keys.current['arrowdown']) dy += 1;
      if (keys.current['a'] || keys.current['arrowleft']) dx -= 1;
      if (keys.current['d'] || keys.current['arrowright']) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      let newDir = direction;
      let moving = false;

      if (dx > 0) newDir = 'right';
      else if (dx < 0) newDir = 'left';
      else if (dy > 0) newDir = 'down';
      else if (dy < 0) newDir = 'up';

      if (dx !== 0 || dy !== 0) {
        moving = true;
        let newX = positionRef.current.x + dx * SPEED * deltaTime;
        let newY = positionRef.current.y + dy * SPEED * deltaTime;
        
        // Clamp to map bounds
        if (newX < 0) newX = 0;
        if (newX > mapBounds.width) newX = mapBounds.width;
        if (newY < 0) newY = 0;
        if (newY > mapBounds.height) newY = mapBounds.height;
        
        // AABB Collision Detection with sliding
        const playerSize = 40; // match PLAYER_SIZE in component
        let collidedX = false;
        let collidedY = false;

        if (colliders && colliders.length > 0) {
          for (const c of colliders) {
            // Check X axis independently
            if (
              newX < c.x + c.width &&
              newX + playerSize > c.x &&
              positionRef.current.y < c.y + c.height &&
              positionRef.current.y + playerSize > c.y
            ) {
              collidedX = true;
            }

            // Check Y axis independently
            if (
              positionRef.current.x < c.x + c.width &&
              positionRef.current.x + playerSize > c.x &&
              newY < c.y + c.height &&
              newY + playerSize > c.y
            ) {
              collidedY = true;
            }
          }
        }

        if (collidedX) newX = positionRef.current.x;
        if (collidedY) newY = positionRef.current.y;
        
        // If we collided on both axes, we are stuck, but at least we don't clip through.
        if (newX !== positionRef.current.x || newY !== positionRef.current.y) {
          positionRef.current = { x: newX, y: newY };
          setPosition({ x: newX, y: newY });
          setDirection(newDir);
          setIsMoving(true);
        } else {
          // Hit a wall head on
          setDirection(newDir);
          if (isMoving) setIsMoving(false);
          moving = false;
        }
      } else if (isMoving) {
        setIsMoving(false);
      }

      // Broadcast position to network at a fixed tick rate
      if (moving && currentTime - lastBroadcastTime.current > TICK_RATE) {
        lastBroadcastTime.current = currentTime;
        if (onMove) {
          onMove(positionRef.current.x, positionRef.current.y, newDir, true);
        }
      } else if (!moving && isMoving) {
        // Send one last update when stopping
        if (onMove) {
          onMove(positionRef.current.x, positionRef.current.y, newDir, false);
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [direction, isMoving, mapBounds, colliders, onMove]);

  return { position, direction, isMoving };
}

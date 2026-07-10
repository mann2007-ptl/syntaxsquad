import { useEffect, useRef, useState, memo } from 'react';

function CustomCursor() {
  const cursorRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const frameRef = useRef(null);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const lerp = 0.15;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" style={{ left: 0, top: 0 }}>
      {/* Lantern glow */}
      <div className="cursor-glow" />
      {/* Center dot */}
      <div className="cursor-dot" />
      {/* Lantern icon */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -80%)' }}
      >
        <path d="M10 2h4v2h-4z" fill="#b8860b" opacity="0.8" />
        <path d="M8 4h8l2 6H6z" fill="none" stroke="#b8860b" strokeWidth="0.8" opacity="0.6" />
        <path d="M7 10h10v2a5 5 0 01-10 0z" fill="none" stroke="#daa520" strokeWidth="0.6" opacity="0.4" />
        <circle cx="12" cy="9" r="1.5" fill="#ff9933" opacity="0.7">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="9" r="3" fill="url(#lanternGlow)" opacity="0.3">
          <animate attributeName="r" values="2.5;3.5;2.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <defs>
          <radialGradient id="lanternGlow">
            <stop offset="0%" stopColor="#ff9933" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default memo(CustomCursor);

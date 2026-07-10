import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { playThunder } from '../audio/audioEngine.js';

const BG_IMAGE = 'https://res.cloudinary.com/dovyiuzjv/image/upload/v1783663660/WhatsApp_Image_2026-07-10_at_11.28.36_AM_1_d85u8a.jpg';

function BackgroundScene({ intensify = false }) {
  const canvasRef = useRef(null);
  const [lightningOpacity, setLightningOpacity] = useState(0);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize dust/ash particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.4 - 0.1,
        opacity: Math.random() * 0.4 + 0.1,
        flicker: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;
  }, []);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.flicker += 0.02;
        
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        
        const flicker = Math.sin(p.flicker) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 150, ${p.opacity * flicker})`;
        ctx.fill();
      });
      
      animFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Lightning effect
  useEffect(() => {
    const triggerLightning = () => {
      const baseDelay = intensify ? 8000 : 20000;
      const randomDelay = baseDelay + Math.random() * (intensify ? 10000 : 30000);
      
      setTimeout(() => {
        // Flash sequence
        setLightningOpacity(intensify ? 0.3 : 0.15);
        playThunder();
        
        setTimeout(() => setLightningOpacity(0), 100);
        setTimeout(() => setLightningOpacity(intensify ? 0.2 : 0.1), 200);
        setTimeout(() => setLightningOpacity(0), 300);
        if (Math.random() > 0.5) {
          setTimeout(() => setLightningOpacity(0.08), 500);
          setTimeout(() => setLightningOpacity(0), 600);
        }
        
        triggerLightning();
      }, randomDelay);
    };
    
    const initialTimeout = setTimeout(triggerLightning, 3000 + Math.random() * 5000);
    return () => clearTimeout(initialTimeout);
  }, [intensify]);

  const parallaxX = mouseRef.current.x * 8;
  const parallaxY = mouseRef.current.y * 5;

  return (
    <div className="bg-scene">
      {/* Background Image with parallax */}
      <div 
        className="bg-image" 
        style={{ 
          backgroundImage: `url(${BG_IMAGE})`,
          transform: `scale(1.1) translate(${parallaxX}px, ${parallaxY}px)`
        }}
      />
      
      {/* Dark Overlay */}
      <div className="bg-overlay" />
      
      {/* Fog */}
      <div className="bg-fog" style={{ opacity: intensify ? 0.25 : 0.15 }} />
      
      {/* Second fog layer */}
      <div 
        className="bg-fog" 
        style={{ 
          opacity: intensify ? 0.2 : 0.1, 
          animationDuration: '45s', 
          animationDirection: 'reverse',
          filter: 'blur(20px)'
        }} 
      />
      
      {/* Rain */}
      <div className="bg-rain" style={{ opacity: intensify ? 0.15 : 0.08 }} />
      
      {/* Dust/Ash Particles */}
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}
      />
      
      {/* Vignette */}
      <div className="bg-vignette" />
      
      {/* Film Grain */}
      <div className="bg-grain" />
      
      {/* Scanlines */}
      <div className="bg-scanlines" />
      
      {/* Lightning Flash */}
      <div 
        className="lightning-flash" 
        style={{ 
          opacity: lightningOpacity,
          transition: lightningOpacity > 0 ? 'none' : 'opacity 0.3s ease-out'
        }} 
      />
      
      {/* Moonlight */}
      <div 
        style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(74,111,165,0.08) 0%, transparent 70%)',
          zIndex: 3,
          pointerEvents: 'none',
          animation: 'fogDrift 60s ease-in-out infinite alternate'
        }}
      />
    </div>
  );
}

export default memo(BackgroundScene);

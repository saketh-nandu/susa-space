import React, { useEffect, useRef, useState } from 'react';

export default function ConstellationTransition({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Animate status text percentage loading
  useEffect(() => {
    const start = Date.now();
    const duration = 3000; // 3.0 seconds transition for high-end cinematic feel

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const amount = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(amount);

      // Start fade out slightly before completion
      if (amount >= 92) {
        setIsEnding(true);
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Particle constellation drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const starsCount = 55;
    const stars: { x: number; y: number; vx: number; vy: number; radius: number; baseOpacity: number }[] = [];
    
    // Generate star coordinates with slight random swirl momentum
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 0.8,
        baseOpacity: Math.random() * 0.55 + 0.35,
      });
    }

    const draw = () => {
      // Elegant sand/ivory light theme backdrop with dissolving transparency mapping
      ctx.fillStyle = '#FAF9F6';
      ctx.fillRect(0, 0, width, height);

      // Delicate grid backdrop mapping
      ctx.strokeStyle = 'rgba(197, 168, 128, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw progressive connection paths based on progress percentage
      stars.forEach((star, idx) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;

        const pulse = Math.sin(Date.now() * 0.0035 + idx) * 0.25 + 0.75;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 125, 105, ${star.baseOpacity * pulse})`;
        ctx.fill();

        // Connect nodes based on current loading crystallization matrix
        for (let j = idx + 1; j < starsCount; j++) {
          const target = stars[j];
          const dist = Math.hypot(star.x - target.x, star.y - target.y);
          
          // Progressive range: max connect distance grows alongside loading progress
          const allowableDistance = 150 + 100 * (progress / 100);
          if (dist < allowableDistance) {
            const alpha = (1 - dist / allowableDistance) * 0.12 * (progress / 100);
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(197, 168, 128, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      // Overlay our elegant centerpiece constellation nodes
      const cx = width / 2;
      const cy = height / 2 - 30;
      const nodes = [
        { x: cx, y: cy - 90 }, // top guide
        { x: cx + 80, y: cy + 30 }, // bottom-right anchor
        { x: cx - 80, y: cy + 30 }, // bottom-left anchor
        { x: cx, y: cy + 95 }, // lower baseline
        { x: cx - 40, y: cy - 20 }, // Orion belt 1
        { x: cx, y: cy - 20 }, // Orion belt 2
        { x: cx + 40, y: cy - 20 }, // Orion belt 3
      ];

      // Draw skeletal connector path with growing draw stroke
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[4].x, nodes[4].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[6].x, nodes[6].y);
      ctx.lineTo(nodes[0].x, nodes[0].y);
      
      ctx.strokeStyle = `rgba(197, 168, 128, ${0.1 + 0.25 * (progress / 100)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Golden alignment core belts
      ctx.beginPath();
      ctx.moveTo(nodes[4].x, nodes[4].y);
      ctx.lineTo(nodes[5].x, nodes[5].y);
      ctx.lineTo(nodes[6].x, nodes[6].y);
      ctx.strokeStyle = `rgba(197, 168, 128, ${0.2 + 0.4 * (progress / 100)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Crystal sparkles
      nodes.forEach((n, idx) => {
        const glow = Math.sin(Date.now() * 0.005 + idx * 8) * 5 + 5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#C5A880';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, 8 + glow, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(197, 168, 128, ${0.05 + 0.15 * (progress / 100)})`;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [progress]);

  return (
    <div 
      className={`fixed inset-0 z-[11000] flex flex-col items-center justify-center p-8 text-[#1C1C1C] font-sans transition-all duration-1000 ease-in-out ${
        isEnding ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* Content overlays */}
      <div className="relative z-10 text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1C] text-white text-[9px] uppercase tracking-[0.3em] rounded-full shadow-sm animate-bounce duration-[1.8s]">
          ✨ Connection Portal
        </div>
        
        <div className="space-y-2 max-w-sm">
          <h2 className="text-3xl font-light tracking-widest font-serif text-[#1C1C1C]">
            Orion <span className="italic font-normal">Orbit</span>
          </h2>
          <p className="text-xs text-[#7C7872] uppercase tracking-[0.2em]">
            Aligning Star Constellations
          </p>
        </div>

        {/* Loading details */}
        <div className="w-[180px] space-y-2 mt-4">
          <div className="w-full h-[1px] bg-[#E5E1D8] relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-[#C5A880] transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#7C7872] tracking-wider">
            <span>COORDINATES ENGAGED</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

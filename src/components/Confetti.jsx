import React, { useEffect, useRef } from 'react';

export const Confetti = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#EC4899'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        vy: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1
      });
    }

    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.vy;
        p.x += p.vx;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Se passar da tela, reinicia no topo
        if (p.y > canvas.height) {
          particles[index] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            vy: Math.random() * 3 + 2,
            vx: Math.random() * 2 - 1
          };
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

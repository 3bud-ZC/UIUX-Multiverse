"use client";

import { useEffect, useRef } from "react";

export function RadioWavesCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      // Setup for high DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      time += 0.005; // Very slow and calm animation
      
      // Get physical bounds based on CSS pixels (since we scaled ctx)
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // We'll draw a few gentle sine waves
      const waves = [
        { amplitude: h * 0.1, frequency: 0.001, speed: 1.5, opacity: 0.65 },
        { amplitude: h * 0.15, frequency: 0.0008, speed: 1, opacity: 0.5 },
        { amplitude: h * 0.08, frequency: 0.002, speed: 2, opacity: 0.6 },
      ];

      waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let x = 0; x < w; x += 5) {
          // Calculate y position based on sine function
          // The base y is h/2 (middle of screen)
          // Add some vertical offset based on index so they aren't exactly on top of each other
          const yOffset = (i - 1) * (h * 0.1);
          
          const y =
            h / 2 +
            yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 - time * wave.speed * 0.5) * wave.amplitude * 0.5;

          ctx.lineTo(x, y);
        }

        // Stroke style: soft amber/gold color typical of classic radios
        // We use the CSS variable --glow if possible, or fallback
        ctx.strokeStyle = `rgba(210, 160, 90, ${wave.opacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

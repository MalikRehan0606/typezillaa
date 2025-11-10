"use client";
import { useEffect, useRef } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    const comets: { x: number; y: number; length: number; speed: number }[] = [];

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        speed: 0.05 + Math.random() * 0.2,
      });
    }

    const spawnComet = () => {
      comets.push({
        x: Math.random() * width,
        y: -50,
        length: 80 + Math.random() * 80,
        speed: 5 + Math.random() * 3,
      });
    };

    let cometTimer = 0;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw stars
      ctx.fillStyle = "white";
      for (const star of stars) {
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > height) star.y = 0;
      }

      // Draw comets
      ctx.globalAlpha = 0.9;
      const gradient = ctx.createLinearGradient(0, 0, 0, 100);
      gradient.addColorStop(0, "#00ffff");
      gradient.addColorStop(1, "transparent");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      for (const comet of comets) {
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(comet.x - comet.length * 0.3, comet.y - comet.length);
        ctx.stroke();
        comet.y += comet.speed;
        comet.x -= comet.speed * 0.3;
      }

      // Remove old comets
      for (let i = comets.length - 1; i >= 0; i--) {
        if (comets[i].y > height + 100) comets.splice(i, 1);
      }

      cometTimer++;
      if (cometTimer % 250 === 0) spawnComet();

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,_#001220,_#000)]"
    />
  );
}

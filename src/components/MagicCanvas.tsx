import React, { useEffect, useRef } from "react";
import { ThemeConfig } from "../types";

interface MagicCanvasProps {
  theme: ThemeConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life?: number;
  maxLife?: number;
  angle?: number;
  spin?: number;
}

export default function MagicCanvas({ theme }: MagicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false, px: -1000, py: -1000 });

  useEffect(() => {
    if (!theme.magicAnimationEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleMouseDown = () => {
      // Create a burst of particles on click
      if (theme.magicAnimationType === "cosmic-stars" || theme.magicAnimationType === "interactive-trail") {
        const count = 20;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          particles.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: theme.accentColor,
            alpha: 1,
            life: 0,
            maxLife: Math.random() * 60 + 40,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);

    // Initialize particles
    const particles: Particle[] = [];
    const maxParticles = theme.magicAnimationType === "cosmic-stars" ? 120 : 60;

    if (theme.magicAnimationType === "cosmic-stars" || theme.magicAnimationType === "interactive-trail") {
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2.5 + 0.5,
          color: Math.random() > 0.4 ? theme.accentColor : "#ffffff",
          alpha: Math.random() * 0.6 + 0.2,
        });
      }
    }

    // Sparkle trail state
    const trailParticles: Particle[] = [];

    // Aurora math
    let auroraTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. COSMIC STARS / FLOATING CONSTY
      if (theme.magicAnimationType === "cosmic-stars") {
        particles.forEach((p) => {
          // Move
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off boundaries with margin
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Interactive magnetic push/pull
          if (mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 200) {
              const force = (200 - dist) / 2000;
              p.x += (dx / dist) * force * 5;
              p.y += (dy / dist) * force * 5;
            }
          }

          // Draw glow
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        });

        // Occasional shooting star
        if (Math.random() < 0.008) {
          const startX = Math.random() * width;
          const startY = Math.random() * (height / 2);
          particles.push({
            x: startX,
            y: startY,
            vx: Math.random() * 12 + 6,
            vy: Math.random() * 4 + 2,
            size: Math.random() * 2 + 1.5,
            color: "#ffffff",
            alpha: 1,
            life: 0,
            maxLife: 25,
          });
        }

        // Filter out expired burst/shooting stars
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          if (p.life !== undefined && p.maxLife !== undefined) {
            p.life++;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = 1 - p.life / p.maxLife;
            if (p.life >= p.maxLife) {
              particles.splice(i, 1);
            }
          }
        }
      }

      // 2. CONSTELLATION / INTERACTIVE LINK TRAIL
      if (theme.magicAnimationType === "interactive-trail") {
        // Draw links
        ctx.strokeStyle = `${theme.accentColor}1c`;
        ctx.lineWidth = 0.8;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;

          // Link with other particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Link with mouse
          if (mouseRef.current.active) {
            const mDist = Math.hypot(p1.x - mouseRef.current.x, p1.y - mouseRef.current.y);
            if (mDist < 180) {
              ctx.strokeStyle = `${theme.accentColor}48`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
              ctx.stroke();
              ctx.strokeStyle = `${theme.accentColor}1c`; // Reset
            }
          }

          // Draw node
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
          ctx.fillStyle = theme.accentColor;
          ctx.globalAlpha = p1.alpha;
          ctx.fill();
        }
      }

      // 3. CURSOR SPARKLE TRAIL (Magical particles fading out from cursor)
      if (theme.magicAnimationType === "sparkle-trail") {
        if (mouseRef.current.active && (mouseRef.current.px !== mouseRef.current.x || mouseRef.current.py !== mouseRef.current.y)) {
          // Generate active particles
          for (let i = 0; i < 3; i++) {
            trailParticles.push({
              x: mouseRef.current.x,
              y: mouseRef.current.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3 - Math.random() * 1.5,
              size: Math.random() * 4 + 1.5,
              color: `hsl(${Math.random() * 40 + 260}, 90%, 75%)`, // Sparkly pink/purple/blue pastel hues
              alpha: 1,
              life: 0,
              maxLife: Math.random() * 30 + 20,
              angle: Math.random() * Math.PI * 2,
              spin: (Math.random() - 0.5) * 0.1,
            });
          }
        }

        // Render sparkle particles
        trailParticles.forEach((p, idx) => {
          p.life = (p.life || 0) + 1;
          p.x += p.vx;
          p.y += p.vy;
          if (p.angle !== undefined && p.spin !== undefined) p.angle += p.spin;
          p.alpha = 1 - p.life / (p.maxLife || 30);

          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.angle !== undefined) ctx.rotate(p.angle);
          
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = theme.accentColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.accentColor;

          // Draw magic sparkle four-pointed star
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.lineTo(0, -p.size);
            ctx.lineTo(p.size * 0.2, -p.size * 0.2);
            ctx.rotate(Math.PI / 2);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });

        // Filter expired trail particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
          if ((trailParticles[i].life || 0) >= (trailParticles[i].maxLife || 30)) {
            trailParticles.splice(i, 1);
          }
        }
      }

      // 4. ETHEREAL AURORA BOREALIS WAVES
      if (theme.magicAnimationType === "aurora") {
        auroraTime += 0.003;
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Draw multiple glowing flowing curves
        const waveCount = 4;
        for (let w = 0; w < waveCount; w++) {
          const offset = w * 40;
          const alpha = 0.08 - w * 0.015;

          ctx.beginPath();
          ctx.fillStyle = "transparent";

          // Generate gradient vertical bands
          const grad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.8);
          grad.addColorStop(0, `${theme.accentColor}00`);
          grad.addColorStop(0.3, `${theme.accentColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(0.5, `#ffffff${Math.floor(alpha * 120).toString(16).padStart(2, '0')}`);
          grad.addColorStop(0.7, `${theme.accentColor}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, `${theme.accentColor}00`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 140 - w * 25;

          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            // Complex wave formula combining sine/cosine over time
            const y =
              height * 0.45 +
              Math.sin(x * 0.0015 + auroraTime + w * 0.8) * 120 * Math.cos(x * 0.0004 - auroraTime * 0.5) +
              Math.cos(x * 0.003 - auroraTime * 1.5 + w) * 40;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [theme.magicAnimationEnabled, theme.magicAnimationType, theme.accentColor]);

  if (!theme.magicAnimationEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-1"
      style={{ mixBlendMode: theme.theme === "light" ? "multiply" : "screen" }}
    />
  );
}

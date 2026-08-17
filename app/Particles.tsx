"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  size: number;
  color: string;
};

type ParticlesProps = {
  particleColors?: string[];
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleBaseSize?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  disableRotation?: boolean;
  pixelRatio?: number | string;
};

export default function Particles({
  particleColors = ["#ffffff"],
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleBaseSize = 100,
  moveParticlesOnHover = true,
  alphaParticles = false,
  disableRotation = false,
  pixelRatio = 1,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let angle = 0;
    const pointer = { x: 0, y: 0, active: false };
    let particles: Particle[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const makeParticle = (): Particle => {
      const direction = Math.random() * Math.PI * 2;
      const motionScale = Math.max(0.35, speed * 3.2);
      const velocity = (0.35 + Math.random() * 0.5) * motionScale;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(direction) * velocity,
        vy: Math.sin(direction) * velocity,
        depth: 0.28 + Math.random() * 0.72,
        size: (particleBaseSize / 52) * (0.42 + Math.random() * 0.9),
        color: particleColors[Math.floor(Math.random() * particleColors.length)] || "#ffffff",
      };
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const requestedRatio = Number(pixelRatio);
      const dpr = Number.isFinite(requestedRatio) ? Math.min(2, Math.max(0.5, requestedRatio)) : 1;
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: particleCount }, makeParticle);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      if (!disableRotation && !reducedMotion) angle += speed * 0.00045;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const centerX = width / 2;
      const centerY = height / 2;
      const hoverRadius = Math.min(width, height) * 0.2;
      const spreadStrength = Math.max(0.45, particleSpread / 10);

      particles.forEach((particle) => {
        if (!reducedMotion) {
          particle.x += particle.vx * spreadStrength * particle.depth;
          particle.y += particle.vy * spreadStrength * particle.depth;
        }
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        let drawX = particle.x;
        let drawY = particle.y;
        if (!disableRotation) {
          const offsetX = particle.x - centerX;
          const offsetY = particle.y - centerY;
          drawX = centerX + offsetX * cosine - offsetY * sine;
          drawY = centerY + offsetX * sine + offsetY * cosine;
        }

        if (moveParticlesOnHover && pointer.active) {
          const deltaX = drawX - pointer.x;
          const deltaY = drawY - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < hoverRadius) {
            const force = Math.pow(1 - distance / hoverRadius, 2) * 28;
            drawX += (deltaX / distance) * force;
            drawY += (deltaY / distance) * force;
          }
        }

        context.beginPath();
        context.fillStyle = particle.color;
        context.globalAlpha = alphaParticles ? 0.26 + particle.depth * 0.56 : 0.82;
        context.shadowColor = particle.color;
        context.shadowBlur = particle.size * 2.2;
        context.arc(drawX, drawY, particle.size * particle.depth, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      frame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    resize();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [alphaParticles, disableRotation, moveParticlesOnHover, particleBaseSize, particleColors, particleCount, particleSpread, pixelRatio, speed]);

  return <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />;
}

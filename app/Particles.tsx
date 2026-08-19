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
    let currentDpr = 0;
    let frame = 0;
    let angle = 0;
    let lastDraw = 0;
    let contextLost = false;
    let documentVisible = !document.hidden;
    const pointer = { x: 0, y: 0, active: false };
    let particles: Particle[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileViewport = window.matchMedia("(max-width: 760px)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const device = navigator as Navigator & { deviceMemory?: number };
    const lowPower = mobileViewport
      || (device.hardwareConcurrency ?? 8) <= 4
      || (device.deviceMemory ?? 8) <= 4;
    const effectiveParticleCount = mobileViewport
      ? Math.min(particleCount, 160)
      : lowPower
        ? Math.min(particleCount, 360)
        : particleCount;
    const frameInterval = reducedMotion ? 100 : mobileViewport ? 1000 / 30 : lowPower ? 1000 / 45 : 0;
    const allowRotation = !disableRotation && !reducedMotion && !mobileViewport;
    const allowPointerMotion = moveParticlesOnHover && !coarsePointer && !mobileViewport;

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
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      // Mobile browser chrome changes the visual viewport height while scrolling.
      // Keep the backing buffer stable for height-only changes so particles do not
      // get recreated mid-scroll; a width change still handles rotation/resizing.
      if (mobileViewport && currentDpr > 0 && Math.abs(nextWidth - width) < 1) return;
      if (Math.abs(nextWidth - width) < 0.5 && Math.abs(nextHeight - height) < 0.5 && currentDpr === dpr && particles.length) return;
      const previousWidth = width;
      const previousHeight = height;
      width = nextWidth;
      height = nextHeight;
      currentDpr = dpr;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length && previousWidth > 1 && previousHeight > 1) {
        const scaleX = width / previousWidth;
        const scaleY = height / previousHeight;
        particles.forEach((particle) => {
          particle.x *= scaleX;
          particle.y *= scaleY;
        });
      } else {
        particles = Array.from({ length: effectiveParticleCount }, makeParticle);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const draw = (now: number) => {
      if (contextLost || !documentVisible || (frameInterval > 0 && now - lastDraw < frameInterval)) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      context.clearRect(0, 0, width, height);
      const audioLevel = Math.min(1, Math.max(0, Number(document.documentElement.style.getPropertyValue("--audio-level")) || 0));
      const audioMotion = 1 + audioLevel * 1.35;
      if (allowRotation) angle += speed * 0.00045 * audioMotion;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const centerX = width / 2;
      const centerY = height / 2;
      const hoverRadius = Math.min(width, height) * 0.2;
      const spreadStrength = Math.max(0.45, particleSpread / 10);

      context.shadowColor = particleColors[0] || "#ffffff";
      context.shadowBlur = lowPower ? 0 : 3;
      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.vx * spreadStrength * particle.depth * audioMotion;
          particle.y += particle.vy * spreadStrength * particle.depth * audioMotion;
        }
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        let drawX = particle.x;
        let drawY = particle.y;
        if (allowRotation) {
          const offsetX = particle.x - centerX;
          const offsetY = particle.y - centerY;
          drawX = centerX + offsetX * cosine - offsetY * sine;
          drawY = centerY + offsetX * sine + offsetY * cosine;
        }

        if (allowPointerMotion && pointer.active) {
          const deltaX = drawX - pointer.x;
          const deltaY = drawY - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < hoverRadius) {
            const force = Math.pow(1 - distance / hoverRadius, 2) * 28;
            drawX += (deltaX / distance) * force;
            drawY += (deltaY / distance) * force;
          }
        }

        context.fillStyle = particle.color;
        context.globalAlpha = alphaParticles ? 0.26 + particle.depth * 0.56 : Math.min(1, 0.78 + audioLevel * 0.2);
        const drawSize = particle.size * particle.depth * (1 + audioLevel * 0.32);
        if (mobileViewport) {
          context.fillRect(drawX, drawY, Math.max(1, drawSize), Math.max(1, drawSize));
        } else {
          context.beginPath();
          context.arc(drawX, drawY, drawSize, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      frame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    const onVisibilityChange = () => { documentVisible = !document.hidden; };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
      currentDpr = 0;
      resize();
    };
    resizeObserver.observe(canvas);
    if (allowPointerMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }
    canvas.addEventListener("contextlost", onContextLost);
    canvas.addEventListener("contextrestored", onContextRestored);
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      if (allowPointerMotion) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
      canvas.removeEventListener("contextlost", onContextLost);
      canvas.removeEventListener("contextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [alphaParticles, disableRotation, moveParticlesOnHover, particleBaseSize, particleColors, particleCount, particleSpread, pixelRatio, speed]);

  return <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />;
}

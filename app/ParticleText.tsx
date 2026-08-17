"use client";

import { CSSProperties, useEffect, useRef } from "react";

type ParticleTextProps = {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "always" | "hover" | "click";
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  height?: number | string;
  glow?: boolean;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  angle: number;
  seed: number;
  delay: number;
};

const pseudoRandom = (value: number) => {
  const result = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return result - Math.floor(result);
};

export default function ParticleText({
  text,
  particleSize = 2,
  density = 4,
  color = "#ffffff",
  highlightColor = "#c9ff57",
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = "hover",
  fontSize = "clamp(3rem, 12vw, 8rem)",
  fontWeight = 800,
  fontFamily = "inherit",
  height = 360,
  glow = false,
  className = "",
}: ParticleTextProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let particles: Particle[] = [];
    let frame = 0;
    let visible = true;
    let hovered = false;
    let localPulse = 0;
    let lastTime = performance.now();
    let bornAt = lastTime;
    const pointer = { x: -10000, y: -10000, active: false };
    const pulseOrigin = { x: -10000, y: -10000 };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const buildParticles = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const canvasHeight = Math.max(1, Math.round(rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(canvasHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = width;
      sampleCanvas.height = canvasHeight;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return;

      const computed = window.getComputedStyle(host);
      let resolvedSize = Number.parseFloat(computed.fontSize) || 96;
      const resolvedFamily = fontFamily === "inherit" ? computed.fontFamily : fontFamily;
      const lines = text.split("\n");
      sampleContext.font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
      const widest = Math.max(...lines.map((line) => sampleContext.measureText(line).width));
      if (widest > width * 0.94) resolvedSize *= (width * 0.94) / widest;
      const lineHeight = resolvedSize * 0.88;
      const totalHeight = lineHeight * lines.length;

      sampleContext.clearRect(0, 0, width, canvasHeight);
      sampleContext.fillStyle = "#fff";
      sampleContext.font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
      sampleContext.textAlign = "center";
      sampleContext.textBaseline = "middle";
      lines.forEach((line, lineIndex) => {
        const y = canvasHeight / 2 - totalHeight / 2 + lineHeight * (lineIndex + 0.5);
        sampleContext.fillText(line, width / 2, y);
      });

      const pixels = sampleContext.getImageData(0, 0, width, canvasHeight).data;
      const points: Array<{ x: number; y: number }> = [];
      const step = Math.max(3, Math.round(density));
      for (let y = 0; y < canvasHeight; y += step) {
        for (let x = 0; x < width; x += step) {
          if (pixels[(y * width + x) * 4 + 3] > 100) points.push({ x, y });
        }
      }
      const particleLimit = 8500;
      const keepEvery = Math.max(1, Math.ceil(points.length / particleLimit));
      particles = points.filter((_, index) => index % keepEvery === 0).map((point, index) => {
        const seed = pseudoRandom(index + text.length * 17);
        const angle = seed * Math.PI * 2;
        const distance = scatter * (0.35 + pseudoRandom(index * 2.17 + 4) * 0.65);
        const startsScattered = trigger === "always";
        return {
          x: startsScattered ? point.x + Math.cos(angle) * distance : point.x,
          y: startsScattered ? point.y + Math.sin(angle) * distance : point.y,
          tx: point.x,
          ty: point.y,
          vx: 0,
          vy: 0,
          angle,
          seed,
          delay: pseudoRandom(index * 3.31 + 8) * stagger,
        };
      });
      bornAt = performance.now();
      host.dataset.ready = "true";
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerEnter = (event: PointerEvent) => {
      hovered = true;
      updatePointer(event);
    };
    const onPointerMove = (event: PointerEvent) => updatePointer(event);
    const onPointerLeave = () => {
      hovered = false;
      pointer.active = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event);
      pulseOrigin.x = pointer.x;
      pulseOrigin.y = pointer.y;
      localPulse = 1;
    };

    const draw = (now: number) => {
      const delta = Math.min(34, now - lastTime);
      lastTime = now;
      if (visible && particles.length) {
        const rect = host.getBoundingClientRect();
        context.clearRect(0, 0, rect.width, rect.height);
        const elapsed = now - bornAt;
        localPulse = Math.max(0, localPulse - delta / Math.max(300, gatherDuration * 0.65));
        const basePoints: Particle[] = [];
        const brightPoints: Particle[] = [];

        particles.forEach((particle) => {
          if (!reduceMotion) {
            const reveal = Math.min(1, Math.max(0, (elapsed - particle.delay) / Math.max(1, gatherDuration)));
            const eased = trigger === "always" ? 1 - Math.pow(1 - reveal, 3) : 1;
            const driftX = Math.sin(now * 0.00045 + particle.seed * 18) * idleDrift;
            const driftY = Math.cos(now * 0.00038 + particle.seed * 21) * idleDrift;
            let targetX = particle.tx + driftX;
            let targetY = particle.ty + driftY;

            if (localPulse > 0) {
              const pulseDx = particle.tx - pulseOrigin.x;
              const pulseDy = particle.ty - pulseOrigin.y;
              const pulseDistance = Math.max(1, Math.hypot(pulseDx, pulseDy));
              const pulseRadius = repelRadius * 1.35;
              if (pulseDistance < pulseRadius) {
                const falloff = Math.pow(1 - pulseDistance / pulseRadius, 2);
                const force = localPulse * scatter * 0.22 * falloff;
                targetX += (pulseDx / pulseDistance) * force;
                targetY += (pulseDy / pulseDistance) * force;
              }
            }

            if (pointer.active && hovered) {
              const dx = particle.tx - pointer.x;
              const dy = particle.ty - pointer.y;
              const distance = Math.max(1, Math.hypot(dx, dy));
              if (distance < repelRadius) {
                const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
                targetX += (dx / distance) * force;
                targetY += (dy / distance) * force;
              }
            }

            const spring = (0.025 + eased * 0.055) * Math.min(1.5, delta / 16.67);
            particle.vx = (particle.vx + (targetX - particle.x) * spring) * 0.82;
            particle.vy = (particle.vy + (targetY - particle.y) * spring) * 0.82;
            particle.x += particle.vx;
            particle.y += particle.vy;
          } else {
            particle.x = particle.tx;
            particle.y = particle.ty;
          }

          const pointerDistance = pointer.active ? Math.hypot(particle.x - pointer.x, particle.y - pointer.y) : Number.POSITIVE_INFINITY;
          const pulseDistance = Math.hypot(particle.tx - pulseOrigin.x, particle.ty - pulseOrigin.y);
          if (pointerDistance < repelRadius * 1.05 || (localPulse > 0.04 && pulseDistance < repelRadius * 1.35)) brightPoints.push(particle);
          else basePoints.push(particle);
        });

        context.globalAlpha = 0.92;
        context.fillStyle = color;
        basePoints.forEach((particle) => context.fillRect(particle.x, particle.y, particleSize, particleSize));
        context.globalAlpha = 1;
        context.fillStyle = highlightColor;
        if (glow) {
          context.shadowColor = highlightColor;
          context.shadowBlur = 9;
        }
        brightPoints.forEach((particle) => context.fillRect(particle.x, particle.y, particleSize * 1.25, particleSize * 1.25));
        context.shadowBlur = 0;
      }
      frame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(buildParticles);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "120px" });
    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    host.addEventListener("pointerenter", onPointerEnter);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    host.addEventListener("pointerdown", onPointerDown);
    void document.fonts?.ready.then(buildParticles);
    buildParticles();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
    };
  }, [color, density, fontFamily, fontWeight, gatherDuration, glow, highlightColor, idleDrift, particleSize, pointerRepel, repelRadius, scatter, stagger, text, trigger]);

  const style = {
    height,
    fontSize,
    fontWeight,
    fontFamily,
  } as CSSProperties;

  return (
    <div ref={hostRef} className={`particle-text ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="particle-text-label">{text.replace(/\n/g, " ")}</span>
    </div>
  );
}

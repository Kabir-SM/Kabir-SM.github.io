"use client";

import { useEffect, useRef, useState } from "react";

type RendererMode = "WebGPU" | "WebGL2" | "Static";

type GPUCanvasContextLike = {
  configure: (options: { device: GPUDeviceLike; format: string; alphaMode: string }) => void;
  getCurrentTexture: () => { createView: () => unknown };
};

type GPURenderPipelineLike = {
  getBindGroupLayout: (index: number) => unknown;
};

type GPUDeviceLike = {
  createShaderModule: (options: { code: string }) => unknown;
  createRenderPipelineAsync: (options: unknown) => Promise<GPURenderPipelineLike>;
  createBuffer: (options: { size: number; usage: number }) => unknown;
  createBindGroup: (options: unknown) => unknown;
  createCommandEncoder: () => {
    beginRenderPass: (options: unknown) => {
      setPipeline: (pipeline: GPURenderPipelineLike) => void;
      setBindGroup: (index: number, bindGroup: unknown) => void;
      draw: (vertexCount: number) => void;
      end: () => void;
    };
    finish: () => unknown;
  };
  queue: {
    writeBuffer: (buffer: unknown, offset: number, data: Float32Array<ArrayBuffer>) => void;
    submit: (commands: unknown[]) => void;
  };
};

type GPULike = {
  requestAdapter: (options: { powerPreference: string }) => Promise<{ requestDevice: () => Promise<GPUDeviceLike> } | null>;
  getPreferredCanvasFormat: () => string;
};

const webgpuShader = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
  pointer: vec2f,
  click: vec2f,
  time: f32,
  scroll: f32,
  energy: f32,
  padding: f32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let s = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), s.x), mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), s.x), s.y);
}
fn fbm(start: vec2f) -> f32 {
  var p = start;
  var value = 0.0;
  var amplitude = 0.5;
  for (var i = 0; i < 5; i = i + 1) {
    value = value + amplitude * noise(p);
    p = mat2x2f(1.62, 1.18, -1.18, 1.62) * p;
    amplitude = amplitude * 0.5;
  }
  return value;
}

@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  var positions = array<vec2f, 3>(vec2f(-1.0, -3.0), vec2f(-1.0, 1.0), vec2f(3.0, 1.0));
  return vec4f(positions[index], 0.0, 1.0);
}

@fragment fn fragmentMain(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let safeResolution = max(u.resolution, vec2f(1.0));
  var p = (coord.xy * 2.0 - safeResolution) / safeResolution.y;
  p = p - vec2f(u.pointer.x * 0.16, -u.pointer.y * 0.11);
  let t = u.time * 0.12 + u.scroll * 3.6;
  let warpA = fbm(p * 1.35 + vec2f(t, -t * 0.42));
  let warpB = fbm(p * 1.5 + vec2f(-t * 0.33, t * 0.65) + warpA);
  var q = p + 0.34 * vec2f(warpA - 0.5, warpB - 0.5);
  let field = fbm(q * 2.35 + vec2f(t * 0.7, -t * 0.22));
  let ridge = 1.0 - abs(field * 2.0 - 1.0);
  let lime = vec3f(0.63, 1.0, 0.24);
  let cyan = vec3f(0.08, 0.78, 1.0);
  let violet = vec3f(0.58, 0.24, 1.0);
  let coral = vec3f(1.0, 0.25, 0.38);
  let colorCycle = u.scroll * 4.5 + u.time * 0.055;
  let stage = 0.5 + 0.5 * sin(colorCycle * 2.1);
  let accent = mix(mix(cyan, lime, stage), mix(violet, coral, stage), smoothstep(0.28, 0.9, u.scroll));
  let accentTwo = mix(violet, cyan, 0.5 + 0.5 * cos(colorCycle));
  let orbA = vec2f(sin(t * 1.4) * 0.42, cos(t * 0.88) * 0.24);
  let orbB = vec2f(cos(t * 0.72 + 2.1) * 0.6, sin(t * 1.2) * 0.3);
  let glowA = exp(-4.6 * length(q - orbA));
  let glowB = exp(-5.8 * length(q - orbB));
  let network = pow(smoothstep(0.54, 0.86, ridge), 3.0);
  var color = vec3f(0.004, 0.005, 0.008);
  let wash = 0.5 + 0.5 * sin(field * 4.4 + colorCycle);
  color = color + accent * (0.018 + wash * 0.052) + accentTwo * (1.0 - wash) * 0.028;
  color = color + network * accent * (0.3 + glowA * 0.74);
  color = color + glowA * accent * 0.29;
  color = color + glowB * accentTwo * 0.24;
  let aspect = safeResolution.x / safeResolution.y;
  let clickPosition = vec2f(u.click.x * aspect, u.click.y);
  let clickDistance = length(p - clickPosition);
  let pointerRing = exp(-90.0 * abs(clickDistance - (0.035 + (1.0 - u.energy) * 0.58)));
  color = color + pointerRing * accent * u.energy * 0.82;
  let gridX = smoothstep(0.985, 1.0, cos((q.x + field * 0.04) * 78.0));
  let gridY = smoothstep(0.992, 1.0, cos((q.y - field * 0.04) * 78.0));
  color = color + (gridX + gridY) * accent * 0.018;
  let scanline = 0.965 + 0.035 * sin(coord.y * 1.25 + u.time * 2.0);
  let vignette = smoothstep(1.42, 0.12, length(p * vec2f(0.74, 1.0)));
  let grain = (hash(floor(coord.xy) + floor(u.time * 18.0)) - 0.5) * 0.025;
  color = color * scanline * vignette + grain;
  return vec4f(pow(max(color, vec3f(0.0)), vec3f(0.84)), 1.0);
}`;

const webglVertex = /* glsl */ `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const webglFragment = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uClick;
uniform float uTime;
uniform float uScroll;
uniform float uEnergy;
out vec4 outColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), s.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), s.x), s.y);
}
float fbm(vec2 p) {
  float value = 0.0; float amplitude = 0.5; mat2 rotation = mat2(1.62, 1.18, -1.18, 1.62);
  for (int i = 0; i < 5; i++) { value += amplitude * noise(p); p = rotation * p; amplitude *= 0.5; }
  return value;
}
void main() {
  vec2 safeResolution = max(uResolution, vec2(1.0));
  vec2 p = (gl_FragCoord.xy * 2.0 - safeResolution) / safeResolution.y;
  p -= vec2(uPointer.x * 0.16, uPointer.y * 0.11);
  float t = uTime * 0.12 + uScroll * 3.6;
  float warpA = fbm(p * 1.35 + vec2(t, -t * 0.42));
  float warpB = fbm(p * 1.5 + vec2(-t * 0.33, t * 0.65) + warpA);
  vec2 q = p + 0.34 * vec2(warpA - 0.5, warpB - 0.5);
  float field = fbm(q * 2.35 + vec2(t * 0.7, -t * 0.22));
  float ridge = 1.0 - abs(field * 2.0 - 1.0);
  vec3 lime = vec3(0.63, 1.0, 0.24), cyan = vec3(0.08, 0.78, 1.0), violet = vec3(0.58, 0.24, 1.0), coral = vec3(1.0, 0.25, 0.38);
  float colorCycle = uScroll * 4.5 + uTime * 0.055;
  float stage = 0.5 + 0.5 * sin(colorCycle * 2.1);
  vec3 accent = mix(mix(cyan, lime, stage), mix(violet, coral, stage), smoothstep(0.28, 0.9, uScroll));
  vec3 accentTwo = mix(violet, cyan, 0.5 + 0.5 * cos(colorCycle));
  vec2 orbA = vec2(sin(t * 1.4) * 0.42, cos(t * 0.88) * 0.24);
  vec2 orbB = vec2(cos(t * 0.72 + 2.1) * 0.6, sin(t * 1.2) * 0.3);
  float glowA = exp(-4.6 * length(q - orbA));
  float glowB = exp(-5.8 * length(q - orbB));
  float network = pow(smoothstep(0.54, 0.86, ridge), 3.0);
  vec3 color = vec3(0.004, 0.005, 0.008);
  float wash = 0.5 + 0.5 * sin(field * 4.4 + colorCycle);
  color += accent * (0.018 + wash * 0.052) + accentTwo * (1.0 - wash) * 0.028;
  color += network * accent * (0.3 + glowA * 0.74) + glowA * accent * 0.29 + glowB * accentTwo * 0.24;
  float aspect = safeResolution.x / safeResolution.y;
  vec2 clickPosition = vec2(uClick.x * aspect, -uClick.y);
  float clickDistance = length(p - clickPosition);
  float pointerRing = exp(-90.0 * abs(clickDistance - (0.035 + (1.0 - uEnergy) * 0.58)));
  color += pointerRing * accent * uEnergy * 0.82;
  float gridX = smoothstep(0.985, 1.0, cos((q.x + field * 0.04) * 78.0));
  float gridY = smoothstep(0.992, 1.0, cos((q.y - field * 0.04) * 78.0));
  color += (gridX + gridY) * accent * 0.018;
  float scanline = 0.965 + 0.035 * sin(gl_FragCoord.y * 1.25 + uTime * 2.0);
  float vignette = smoothstep(1.42, 0.12, length(p * vec2(0.74, 1.0)));
  float grain = (hash(floor(gl_FragCoord.xy) + floor(uTime * 18.0)) - 0.5) * 0.025;
  color = color * scanline * vignette + grain;
  outColor = vec4(pow(max(color, vec3(0.0)), vec3(0.84)), 1.0);
}`;

type AudioRig = { context: AudioContext; gain: GainNode; sources: AudioScheduledSourceNode[] };

export function KineticExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioRig | null>(null);
  const [renderer, setRenderer] = useState<RendererMode>("Static");
  const [soundOn, setSoundOn] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [chapter, setChapter] = useState("ORIGIN");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stopped = false;
    let frame = 0;
    let renderFrame: ((time: number, scroll: number, energy: number) => void) | null = null;
    const pointerTarget = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const clickPoint = { x: 0, y: 0 };
    let scrollTarget = 0;
    let scrollValue = 0;
    let energy = 0;
    const start = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(1, Math.floor(window.innerWidth * dpr));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    };
    const compileShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Unable to create shader");
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
      return shader;
    };
    const startWebGL = () => {
      const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
      if (!gl) throw new Error("WebGL2 unavailable");
      const program = gl.createProgram();
      if (!program) throw new Error("Unable to create WebGL program");
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, webglVertex));
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, webglFragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const resolutionLocation = gl.getUniformLocation(program, "uResolution");
      const pointerLocation = gl.getUniformLocation(program, "uPointer");
      const clickLocation = gl.getUniformLocation(program, "uClick");
      const timeLocation = gl.getUniformLocation(program, "uTime");
      const scrollLocation = gl.getUniformLocation(program, "uScroll");
      const energyLocation = gl.getUniformLocation(program, "uEnergy");
      gl.useProgram(program);
      renderFrame = (time, scroll, currentEnergy) => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(pointerLocation, pointer.x, pointer.y);
        gl.uniform2f(clickLocation, clickPoint.x, clickPoint.y);
        gl.uniform1f(timeLocation, time); gl.uniform1f(scrollLocation, scroll); gl.uniform1f(energyLocation, currentEnergy);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      setRenderer("WebGL2");
    };
    const startWebGPU = async () => {
      const gpu = (navigator as Navigator & { gpu?: GPULike }).gpu;
      if (!gpu) throw new Error("WebGPU unavailable");
      const adapter = await gpu.requestAdapter({ powerPreference: "high-performance" });
      if (!adapter) throw new Error("No WebGPU adapter");
      const device = await adapter.requestDevice();
      const context = (canvas as unknown as { getContext: (type: "webgpu") => GPUCanvasContextLike | null }).getContext("webgpu");
      if (!context) throw new Error("No WebGPU canvas context");
      const format = gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "opaque" });
      const shaderModule = device.createShaderModule({ code: webgpuShader });
      const pipeline = await device.createRenderPipelineAsync({ layout: "auto", vertex: { module: shaderModule, entryPoint: "vertexMain" }, fragment: { module: shaderModule, entryPoint: "fragmentMain", targets: [{ format }] }, primitive: { topology: "triangle-list" } });
      const uniformBuffer = device.createBuffer({ size: 48, usage: 0x40 | 0x08 });
      const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniformBuffer } }] });
      renderFrame = (time, scroll, currentEnergy) => {
        device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([canvas.width, canvas.height, pointer.x, pointer.y, clickPoint.x, clickPoint.y, time, scroll, currentEnergy, 0]));
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({ colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: 0.004, g: 0.005, b: 0.004, a: 1 }, loadOp: "clear", storeOp: "store" }] });
        pass.setPipeline(pipeline); pass.setBindGroup(0, bindGroup); pass.draw(3); pass.end();
        device.queue.submit([encoder.finish()]);
      };
      setRenderer("WebGPU");
    };
    const boot = async () => {
      sizeCanvas();
      try { await startWebGPU(); } catch { try { startWebGL(); } catch { setRenderer("Static"); } }
    };
    const updatePointer = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--pointer-x", pointerTarget.x.toFixed(3));
      document.documentElement.style.setProperty("--pointer-y", pointerTarget.y.toFixed(3));
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onPointerMove = (event: PointerEvent) => updatePointer(event);
    const onPointerDown = (event: PointerEvent) => {
      updatePointer(event);
      pointer.x = pointerTarget.x; pointer.y = pointerTarget.y;
      clickPoint.x = pointerTarget.x; clickPoint.y = pointerTarget.y;
      energy = 1;
    };
    const onScroll = () => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = Math.min(1, Math.max(0, window.scrollY / maximum));
      document.documentElement.style.setProperty("--scroll-progress", scrollTarget.toFixed(4));
      setScrollPercent(Math.round(scrollTarget * 100));
      const labels = ["ORIGIN", "WORK", "EXPERIENCE", "ABOUT", "CONTACT"];
      setChapter(labels[Math.min(labels.length - 1, Math.floor(scrollTarget * labels.length))]);
    };
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }), { threshold: 0.08 });
    document.querySelectorAll(".section, .contact-section").forEach((node) => revealObserver.observe(node));
    const animate = (now: number) => {
      if (stopped) return;
      pointer.x += (pointerTarget.x - pointer.x) * 0.055; pointer.y += (pointerTarget.y - pointer.y) * 0.055;
      scrollValue += (scrollTarget - scrollValue) * 0.045; energy = energy > 0.004 ? energy * 0.94 : 0;
      renderFrame?.(reduceMotion ? 0 : (now - start) / 1000, scrollValue, energy);
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener("resize", sizeCanvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); void boot(); frame = requestAnimationFrame(animate);
    return () => {
      stopped = true; cancelAnimationFrame(frame); revealObserver.disconnect();
      window.removeEventListener("resize", sizeCanvas); window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--pointer-x"); document.documentElement.style.removeProperty("--pointer-y");
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);

  useEffect(() => () => { if (audioRef.current) void audioRef.current.context.close(); }, []);

  const toggleSound = async () => {
    if (audioRef.current) {
      const rig = audioRef.current; const now = rig.context.currentTime;
      rig.gain.gain.cancelScheduledValues(now); rig.gain.gain.setValueAtTime(rig.gain.gain.value, now);
      rig.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      rig.sources.forEach((source) => { try { source.stop(now + 0.85); } catch { /* already stopped */ } });
      audioRef.current = null; setSoundOn(false); window.setTimeout(() => void rig.context.close(), 900); return;
    }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context: AudioContext = new AudioContextClass(); await context.resume();
    const master = context.createGain(); const filter = context.createBiquadFilter(); const compressor = context.createDynamicsCompressor();
    master.gain.setValueAtTime(0.0001, context.currentTime); master.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 2.2);
    filter.type = "lowpass"; filter.frequency.value = 780; filter.Q.value = 0.58;
    compressor.threshold.value = -24; compressor.knee.value = 26; compressor.ratio.value = 3; compressor.attack.value = 0.025; compressor.release.value = 0.9;
    filter.connect(master); master.connect(compressor); compressor.connect(context.destination);
    const sources: AudioScheduledSourceNode[] = [];
    [{ frequency: 55, type: "sine" as OscillatorType, gain: 0.32 }, { frequency: 82.41, type: "sine" as OscillatorType, gain: 0.16 }, { frequency: 110, type: "sine" as OscillatorType, gain: 0.07 }, { frequency: 164.81, type: "sine" as OscillatorType, gain: 0.032 }].forEach((voice, index) => {
      const oscillator = context.createOscillator(); const voiceGain = context.createGain();
      oscillator.type = voice.type; oscillator.frequency.value = voice.frequency; oscillator.detune.value = index * 3 - 2; voiceGain.gain.value = voice.gain;
      oscillator.connect(voiceGain); voiceGain.connect(filter); oscillator.start(); sources.push(oscillator);
    });
    const lfo = context.createOscillator(); const lfoGain = context.createGain();
    lfo.frequency.value = 0.045; lfoGain.gain.value = 135; lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start(); sources.push(lfo);
    const breath = context.createOscillator(); const breathGain = context.createGain();
    breath.frequency.value = 0.032; breathGain.gain.value = 0.012; breath.connect(breathGain); breathGain.connect(master.gain); breath.start(); sources.push(breath);
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate); const noiseData = noiseBuffer.getChannelData(0);
    let smoothedNoise = 0;
    for (let i = 0; i < noiseData.length; i += 1) { smoothedNoise = smoothedNoise * 0.985 + (Math.random() * 2 - 1) * 0.015; noiseData[i] = smoothedNoise * 2.4; }
    const noise = context.createBufferSource(); const noiseGain = context.createGain();
    noise.buffer = noiseBuffer; noise.loop = true; noiseGain.gain.value = 0.017; noise.connect(noiseGain); noiseGain.connect(filter); noise.start(); sources.push(noise);
    audioRef.current = { context, gain: master, sources }; setSoundOn(true);
  };

  return (
    <div className="kinetic-experience">
      <canvas ref={canvasRef} className="experience-canvas" aria-hidden="true" />
      <div ref={cursorRef} className="kinetic-cursor" aria-hidden="true"><span /></div>
      <div className="renderer-badge" aria-label={`Visual renderer: ${renderer}`}><span className="renderer-dot" />{renderer}</div>
      <button className={`sound-toggle ${soundOn ? "is-on" : ""}`} type="button" aria-label={soundOn ? "Turn ambient sound off" : "Turn ambient sound on"} aria-pressed={soundOn} onClick={() => void toggleSound()}>
        <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>SOUND: {soundOn ? "ON" : "OFF"}</span>
      </button>
      <div className="experience-progress" aria-hidden="true">
        <span>{String(scrollPercent).padStart(2, "0")}</span><span className="progress-rail"><i style={{ height: `${scrollPercent}%` }} /></span><strong>{chapter}</strong>
      </div>
      <div className="interaction-guide" aria-hidden="true">MOVE / CLICK / SCROLL TO ALTER THE FIELD</div>
    </div>
  );
}
